# TOTP验证码生成器

这是一个简单的单页面应用，用户可以输入Base32格式的密钥来生成TOTP六位数字验证码。

## 功能特点

- 不使用speakeasy包
- 使用当前时间生成TOTP验证码
- 支持Base32格式密钥输入
- 实时倒计时显示验证码更新时间

## 安装和运行

1. 安装依赖：
   ```
   npm install
   ```

2. 启动应用：
   ```
   npm start
   ```

3. 在浏览器中打开 `http://localhost:3000`

## 开发模式

要以开发模式运行应用（支持自动重启）：
```
npm run dev
```

## 使用方法

1. 在输入框中输入Base32格式的密钥
2. 点击"生成验证码"按钮或按回车键
3. 查看生成的六位数字验证码

## 测试密钥

可以使用以下Base32测试密钥：
- `JBSWY3DPEHPK3PXP` (对应文本 "Hello!")

## 技术实现

- 后端：Node.js + Express
- 前端：原生HTML/CSS/JavaScript
- Base32解码：base32-decode库
- TOTP算法：使用Node.js内置的crypto模块实现