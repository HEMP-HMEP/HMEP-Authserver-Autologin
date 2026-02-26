// ==UserScript==
// @name         湖南机电职院统一身份验证页面自动登录脚本
// @version      1.2
// @description  在 WebVPN 环境下为湖南机电职院统一认证页面实现跨域记住密码及自动登录功能。
// @author       raccoon
// @homepage     https://github.com/HEMP-HMEP/HMEP-Authserver-Autologin
// @match        *://webvpn.hnjdzy.edu.cn/*/77726476706e69737468656265737421f1e2559434357a467b1ac7a4965f272f0343099d75/authserver/login*
// @match        *://authserver.hnjdzy.net/authserver/login*
// @match        *://webvpn.hnjdzy.edu.cn/*/77726476706e69737468656265737421e0f85388263c265870028db6811b263101b5d9d5/tp_nup/*
// @match        *://portal.hnjdzy.edu.cn/tp_nup/*
// @match        *://webvpn.hnjdzy.edu.cn/
// @match        *://webvpn.hnjdzy.edu.cn/m/portal
// @icon         https://authserver.hnjdzy.net/authserver/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // --- 配置 ---
    const STORAGE_KEY_USER = 'hnjd_username';
    const STORAGE_KEY_PASS = 'hnjd_password_enc';
    const STORAGE_KEY_AUTO = 'hnjd_auto_login';
    const STORAGE_KEY_ATTEMPTS = 'hnjd_login_attempts'; // 记录登录尝试时间戳
    const ENCRYPT_SALT = 'ming_de_chong_ji_zi_qiang_bu_xi';   // 自行修改，虽然说本地储存加密跟脱裤子放屁似的

    // --- 工具函数 ---
    function simpleEncrypt(str) {
        return btoa(ENCRYPT_SALT + str + ENCRYPT_SALT);
    }
    function simpleDecrypt(enc) {
        try {
            let dec = atob(enc);
            if (dec.startsWith(ENCRYPT_SALT) && dec.endsWith(ENCRYPT_SALT)) {
                return dec.slice(ENCRYPT_SALT.length, -ENCRYPT_SALT.length);
            }
        } catch (e) { }
        return '';
    }

    // 等待元素出现
    function waitForElement(selector, callback, timeout = 5000) {
        const interval = 200;
        let elapsed = 0;
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                callback(el);
            }
            elapsed += interval;
            if (elapsed >= timeout) clearInterval(timer);
        }, interval);
    }

    // --- 登录尝试记录管理 ---
    function getRecentAttempts() {
        const now = Date.now();
        let attempts = GM_getValue(STORAGE_KEY_ATTEMPTS, []);
        attempts = attempts.filter(ts => now - ts <= 5000); // 只保留最近5秒
        return attempts;
    }

    function recordAttempt() {
        const now = Date.now();
        let attempts = getRecentAttempts();
        attempts.push(now);
        GM_setValue(STORAGE_KEY_ATTEMPTS, attempts);
    }

    function clearAttempts() {
        GM_deleteValue(STORAGE_KEY_ATTEMPTS);
    }

    // 检测验证码是否可见
    function isCaptchaVisible() {
        const codeInput = document.querySelector('#code');
        return codeInput && codeInput.offsetParent !== null; // 存在于DOM且可见
    }

    // --- 登录页逻辑 ---
    function initLoginPage() {
        // 1. 填充已保存的凭证
        const savedUser = GM_getValue(STORAGE_KEY_USER, '');
        const savedPassEnc = GM_getValue(STORAGE_KEY_PASS, '');
        const autoLogin = GM_getValue(STORAGE_KEY_AUTO, false);

        const unInput = document.querySelector('#un');
        const pdInput = document.querySelector('#pd');
        const rememberChk = document.querySelector('#rememberName');

        if (unInput && pdInput && rememberChk) {
            if (savedUser && savedPassEnc) {
                unInput.value = savedUser;
                pdInput.value = simpleDecrypt(savedPassEnc);
                rememberChk.checked = true;
                // 触发事件
                unInput.dispatchEvent(new Event('input', { bubbles: true }));
                pdInput.dispatchEvent(new Event('input', { bubbles: true }));
                rememberChk.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // 2. 插入自动登录复选框
            insertAutoLoginCheckbox(rememberChk, autoLogin);

            // 3. 如果自动登录为真，且没有错误提示，则尝试自动登录（带频率限制）
            const errorSpan = document.querySelector('#errormsg');
            const hasError = errorSpan && errorSpan.style.display !== 'none' && errorSpan.innerText.trim() !== '';

            if (autoLogin && savedUser && savedPassEnc && !hasError) {
                // 检查验证码是否可见
                if (isCaptchaVisible()) {
                    console.log('检测到验证码，暂停自动登录');
                    return;
                }

                // 获取最近5秒内的尝试次数
                const attempts = getRecentAttempts();
                const attemptCount = attempts.length;

                if (attemptCount >= 3) {
                    console.log('5秒内登录尝试超过3次，暂停自动登录');
                    return; // 超过限制，不执行自动登录
                }

                // 根据尝试次数决定延迟
                let delay = 300; // 默认0.3秒
                if (attemptCount === 1) delay = 800;
                else if (attemptCount === 2) delay = 1000;

                // 记录本次尝试
                recordAttempt();

                setTimeout(() => {
                    const loginBtn = document.querySelector('#index_login_btn .login-btn');
                    if (loginBtn) {
                        loginBtn.click();
                    }
                }, delay);
            }

            // 4. 如果存在错误提示，则取消自动登录标志（这个判断似乎没用，不过有频率限制兜底，问题不大）
            if (hasError && autoLogin) {
                GM_deleteValue(STORAGE_KEY_AUTO);
            }

            // 5. 记住密码复选框变化时实时保存/删除凭证
            rememberChk.addEventListener('change', function () {
                const un = document.querySelector('#un')?.value.trim();
                const pd = document.querySelector('#pd')?.value.trim();
                if (this.checked && un && pd) {
                    GM_setValue(STORAGE_KEY_USER, un);
                    GM_setValue(STORAGE_KEY_PASS, simpleEncrypt(pd));
                } else if (!this.checked) {
                    GM_deleteValue(STORAGE_KEY_USER);
                    GM_deleteValue(STORAGE_KEY_PASS);
                }
            });
        }

        // 6. 监听登录按钮点击，保存自动登录状态及凭证，并清除尝试记录（手动点击时）
        document.addEventListener('click', function (e) {
            const loginBtn = e.target.closest('#index_login_btn .login-btn, #finishloginbymobile');
            if (!loginBtn) return;

            // 仅处理账号密码登录面板
            const activeTab = document.querySelector('#password_login.active');
            if (!activeTab) return;

            // 如果是用户手动点击（isTrusted为true），清除尝试记录
            if (e.isTrusted) {
                clearAttempts();
            }

            // 保存自动登录状态
            const autoChk = document.querySelector('#autoLoginChk');
            if (autoChk && autoChk.checked) {
                GM_setValue(STORAGE_KEY_AUTO, true);
            } else {
                GM_setValue(STORAGE_KEY_AUTO, false);
            }

            // 保存或删除密码凭证（与记住密码复选框同步）
            const rememberChk = document.querySelector('#rememberName');
            if (rememberChk) {
                const un = document.querySelector('#un')?.value.trim();
                const pd = document.querySelector('#pd')?.value.trim();
                if (rememberChk.checked && un && pd) {
                    GM_setValue(STORAGE_KEY_USER, un);
                    GM_setValue(STORAGE_KEY_PASS, simpleEncrypt(pd));
                } else {
                    // 若未勾选记住密码，则清除已保存的凭证
                    GM_deleteValue(STORAGE_KEY_USER);
                    GM_deleteValue(STORAGE_KEY_PASS);
                }
            }
        }, true);
    }

    // 插入自动登录复选框
    function insertAutoLoginCheckbox(rememberChk, autoChecked) {
        // 如果已经存在则先移除
        const existing = document.querySelector('#autoLoginChk');
        if (existing) {
            existing.closest('.option-item')?.remove();
        }

        const optionRow = rememberChk.closest('.password-option-row');
        if (!optionRow) return;

        // 创建新选项
        const autoItem = document.createElement('div');
        autoItem.className = 'option-item';
        autoItem.innerHTML = `
            <input type="checkbox" id="autoLoginChk" ${autoChecked ? 'checked' : ''} ${rememberChk.checked ? '' : 'disabled'}>
            <span>自动登录</span>
        `;
        // 插入到记住密码后面
        const rememberItem = rememberChk.closest('.option-item');
        if (rememberItem) {
            rememberItem.insertAdjacentElement('afterend', autoItem);
        } else {
            optionRow.appendChild(autoItem);
        }

        // 监听记住密码复选框的变化，控制自动登录的可用性
        rememberChk.addEventListener('change', function () {
            const autoChk = document.querySelector('#autoLoginChk');
            if (autoChk) {
                if (this.checked) {
                    autoChk.disabled = false;
                } else {
                    autoChk.disabled = true;
                    autoChk.checked = false; // 同时取消勾选
                }
            }
        });
    }

    // --- 登录后目标页面逻辑：添加“关闭自动登录”按钮 ---
    function initTargetPage() {
        // 根据当前 URL 判断是哪种页面
        const isResourceSite = location.href.startsWith('https://webvpn.hnjdzy.edu.cn/') && !location.href.includes('tp_nup') && !location.href.includes('/m/portal');
        const isResourceSiteMobile = location.href.startsWith('https://webvpn.hnjdzy.edu.cn/') && !location.href.includes('tp_nup') && location.href.includes('/m/portal');
        const isPortal = location.href.includes('portal.hnjdzy.edu.cn/tp_nup') || location.href.includes('webvpn.hnjdzy.edu.cn/https/77726476706e69737468656265737421e0f85388263c265870028db6811b263101b5d9d5/tp_nup');

        if (isResourceSiteMobile) {
            // 手机端资源站点：菜单 div class="wrdvpn-mobile-menu"
            waitForElement('div.wrdvpn-mobile-menu', (menu) => {
                // 这里重点处理手机端的逻辑
                // 避免重复添加
                if (menu.querySelector('.close-auto-login-item')) return;

                // 创建外层 div（与现有菜单项一致）
                const itemDiv = document.createElement('div');

                // 创建内层 a 标签
                const link = document.createElement('a');
                link.href = 'javascript:void(0)'; // 阻止页面跳转
                link.className = 'wrdvpn-mobile-menu__item close-auto-login-item';

                // 添加图标（复用注销图标）
                const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                iconSvg.setAttribute('aria-hidden', 'true');
                iconSvg.setAttribute('class', 'wrdvpn-icon menuitem__icon');
                const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
                use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#wrdvpn-menu-logout');
                iconSvg.appendChild(use);
                link.appendChild(iconSvg);

                // 添加文本
                link.appendChild(document.createTextNode('          关闭自动登录          '));

                // 将 a 放入 div
                itemDiv.appendChild(link);

                // 添加点击事件（实现关闭自动登录逻辑）
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (GM_getValue(STORAGE_KEY_AUTO, false)) {
                        GM_deleteValue(STORAGE_KEY_AUTO);
                        alert('自动登录已关闭。');
                    } else {
                        alert('自动登录尚未开启。');
                    }
                });

                // 将新菜单项插入到菜单末尾
                menu.appendChild(itemDiv);
            });
        } else if (isResourceSite) {
            // 资源站点：菜单 ul.wrdvpn-navbar__user__menu
            waitForElement('ul.wrdvpn-navbar__user__menu', (menu) => {
                addCloseAutoLoginItem(menu, 'li');
            });
        } else if (isPortal) {
            // 门户：菜单 ul.ellipsis-dropdown
            waitForElement('ul.ellipsis-dropdown', (menu) => {
                addCloseAutoLoginItem(menu, 'li');
            });
        }
    }

    // 在菜单中添加一项
    function addCloseAutoLoginItem(menu, tagName = 'li') {
        // 避免重复添加
        if (menu.querySelector('.close-auto-login-item')) return;

        const item = document.createElement(tagName);
        item.className = 'close-auto-login-item';
        if (tagName === 'li') {
            item.classList.add('wrdvpn-navbar__user__menuitem'); // 模仿资源站点样式
            item.classList.add('bg-theme-hover-100'); // 模仿智慧机电样式
            // 反正在另外一方样式没有被定义就不执行了，所以这里两个类都加上
        }
        item.innerHTML = '<a><span>关闭自动登录</span></a>';
        item.style.cursor = 'pointer';

        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (GM_getValue(STORAGE_KEY_AUTO, false)) {
                GM_deleteValue(STORAGE_KEY_AUTO);
                alert('自动登录已关闭。');
            } else {
                alert('自动登录尚未开启。');
            }
        });

        menu.appendChild(item);
    }

    // --- 主入口 ---
    const currentUrl = location.href;

    // 登录页面匹配
    if (currentUrl.includes('/authserver/login')) {
        // 等待账号密码面板出现
        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector('#un')) {
                initLoginPage();
                obs.disconnect();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // 直接尝试一次
        if (document.querySelector('#un')) initLoginPage();
    }
    // 资源站点或门户页面
    else if (currentUrl.startsWith('https://webvpn.hnjdzy.edu.cn/') ||
             currentUrl.includes('portal.hnjdzy.edu.cn/tp_nup')) {
        // 等待 DOM 稳定后添加按钮
        window.addEventListener('load', initTargetPage);
		// 如果已经加载
        if (document.readyState === 'complete') {
            initTargetPage();
        } else {
            document.addEventListener('DOMContentLoaded', initTargetPage);
        }
    }
})();
