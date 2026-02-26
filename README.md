# 湖南机电职院统一身份验证页面自动登录脚本
## 用途
实现湖南机电职业技术学院智慧校园统一身份认证平台（[https://authserver.hnjdzy.net/authserver/login](https://authserver.hnjdzy.net/authserver/login)）的跨域（WebVPN环境）记住密码以及自动登录功能。
## 使用方法
### 安装脚本
#### Windows/Linux（以 [Microsoft Edge](https://www.microsoft.com/zh-cn/edge/download)为例）
1. 安装[篡改猴](https://www.tampermonkey.net/)等支持Tampermonkey脚本的浏览器扩展。[Edge浏览器点此安装篡改猴](https://microsoftedge.microsoft.com/addons/detail/iikmkjmpaadaobahmlepeloendndfphd)
<img width="1920" height="1032" alt="QQ_1772045227728" src="https://github.com/user-attachments/assets/6959e881-58d3-41d1-ac08-6c88ef8a2ade" />

2. 下载仓库中的`湖南机电职院统一身份验证页面自动登录脚本.js`文件。
3. 右键扩展菜单中的“篡改猴”扩展，并在弹出的菜单中选择“添加新脚本”

<img width="322" height="413" alt="image" src="https://github.com/user-attachments/assets/05feb366-053f-4d86-9050-274ac1cec9c8" /><img width="255" height="252" alt="image" src="https://github.com/user-attachments/assets/c7d4ee91-4760-460d-aa08-01d253023731" />

4. 将下载的脚本拖入新打开的页面

<img width="1920" height="1032" alt="QQ_1772045457163" src="https://github.com/user-attachments/assets/d889cf72-7c52-4ff1-a7ba-1302cf7e9225" />

5. 点击安装

<img width="1920" height="1032" alt="QQ_1772045819300" src="https://github.com/user-attachments/assets/0bb3e58d-029a-4cbf-8deb-c704f74be59b" />

6. 打开扩展页，找到篡改猴，点击“详细信息”

<img width="834" height="132" alt="QQ_1772046264926" src="https://github.com/user-attachments/assets/37b49aed-e2ff-47a5-964b-67b4a9016c12" />


7. 勾选“允许用户脚本”

<img width="1920" height="1032" alt="b67e681160161c63788e6eab11b1e419" src="https://github.com/user-attachments/assets/1634c9e5-5be6-4330-9bff-7b6043eecb33" />

#### Android（以 [Microsoft Edge](https://www.microsoft.com/zh-cn/edge/download)为例）
1. 打开扩展页，安装[篡改猴](https://www.tampermonkey.net/)。

<img width="1176" height="2400" alt="image" src="https://github.com/user-attachments/assets/8c1c57aa-122b-434e-9463-2bb5f0c9bac1" />![300aad875884bc47666c0fcb51dd0b80](https://github.com/user-attachments/assets/2e441904-8342-43cb-9587-ef804b4589fe)

2. 打开篡改猴，点击“添加新脚本”

<img width="1176" height="2400" alt="image" src="https://github.com/user-attachments/assets/4087990a-5f5e-4a94-b005-588beae1e8ed" />![115ef106f1950a85a57ba8a048513bbe](https://github.com/user-attachments/assets/d8a1ef94-c6ff-41db-9a00-a02fb9dbadae)

3. 在新打开的页面中将仓库中的`湖南机电职院统一身份验证页面自动登录脚本.js`文件内容粘贴至输入框，并保存。

![3296f76a7704a0fc0bf1cf367661dd64](https://github.com/user-attachments/assets/85f5bca4-3391-4ceb-86c9-72be0c5a4b73)
![dbbd852a03440fd6dd5ff52a5dfc1fdc](https://github.com/user-attachments/assets/a17ced51-2d30-4118-b0cb-60ff87f53fd8)![de3d37da9ac0512df9877cdfd04b9537](https://github.com/user-attachments/assets/46729450-bbd8-4a12-af01-461e25144f83)


### 使用说明
1. 脚本启用后在湖南机电统一身份验证页面会多出“自动登录”选项，输入账号密码后勾选相应选项并点击“登录”便可启用对应功能。（注：需勾选“记住密码”后方可勾选“自动登录”）

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/95250e2f-df9b-4159-b2ec-ce32355d8fa8" />

3. 若需关闭“自动登录”功能可在“智慧机电”门户及WebVPN门户选择关闭。

<img width="1919" height="1032" alt="image" src="https://github.com/user-attachments/assets/f1590c2d-278e-4e80-a227-8ceb7f4705a5" /><img width="1919" height="1033" alt="image" src="https://github.com/user-attachments/assets/8603ca10-7999-4c05-84a8-b52ea5927cbf" /><img width="388" height="288" alt="QQ_1772047839066" src="https://github.com/user-attachments/assets/29cd42cb-eb94-4c4b-bc45-8b8828b91e99" />




