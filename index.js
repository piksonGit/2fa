const express = require('express');
const decode = require('base32-decode');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static('.'));

// TOTP生成函数
function generateTOTP(secret, timeStep = 30, digits = 6, algorithm = 'sha1') {
  try {
    // 解码Base32密钥
    const decodedSecret = decode(secret.toUpperCase(), 'RFC4648');
    
    // 创建密钥Buffer
    const key = Buffer.from(decodedSecret);
    
    // 计算时间计数器
    const counter = Math.floor(Date.now() / 1000 / timeStep);
    
    // 创建计数器Buffer
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter), 0);
    
    // 生成HMAC
    const hmac = crypto.createHmac(algorithm, key);
    hmac.update(counterBuffer);
    const hash = hmac.digest();
    
    // 动态截断
    const offset = hash[hash.length - 1] & 0xf;
    const binary =
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);
    
    // 生成验证码
    const otp = binary % Math.pow(10, digits);
    
    // 补齐位数
    return otp.toString().padStart(digits, '0');
  } catch (error) {
    throw new Error('Base32解码失败: ' + error.message);
  }
}

// 生成TOTP的API端点
app.post('/generate-totp', (req, res) => {
  try {
    let { secret } = req.body;
    
    if (!secret) {
      return res.status(400).json({ error: '缺少密钥参数' });
    }
    
    // 去除空格并限制长度为100个字符
    secret = secret.replace(/\s/g, '').substring(0, 100);
    
    // 验证Base32格式
    if (!/^[A-Z2-7]+=*$/i.test(secret)) {
      return res.status(400).json({ error: '密钥格式不正确，应为Base32格式 (只允许字母A-Z和数字2-7)' });
    }
    
    // 生成TOTP验证码
    const token = generateTOTP(secret);
    
    res.json({ token });
  } catch (error) {
    console.error('生成TOTP时出错:', error);
    
    if (error.message && error.message.includes('Base32解码失败')) {
      res.status(400).json({ error: 'Base32密钥解码失败，请确保输入的是有效的Base32格式密钥' });
    } else if (error.message && error.message.includes('invalid character')) {
      res.status(400).json({ error: 'Base32密钥包含无效字符，请确保只包含字母A-Z和数字2-7' });
    } else {
      res.status(500).json({ error: '生成验证码时出错' });
    }
  }
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});