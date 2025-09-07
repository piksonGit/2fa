'use client';
import { useState, useEffect } from 'react';
import * as speakeasy from 'speakeasy';
import encode from 'base32-encode';
import decode from 'base32-decode';

const TOTPGenerator = () => {
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  // 修改验证逻辑，允许大小写字母和所有数字
  const isValidSecret = (s: string) => /^[A-Za-z0-9]{16,32}$/.test(s);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 30));
      if(timeLeft === 1) {
        generateCode();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [secret, timeLeft]);

  const generateCode = () => {
    // 清除之前的错误信息
    setErrorMsg('');
    setCopyMsg('');
    
    if (!isValidSecret(secret)) {
      setErrorMsg('请输入16-32位有效密钥（大小写字母A-Z和数字0-9）');
      return;
    }
    
    try {
      // 确保密钥是有效的Base32格式
      const formattedSecret = secret.toUpperCase().replace(/\s/g, '');
      
      console.log('尝试生成TOTP，密钥长度:', formattedSecret.length);
      
      // 使用正确的方式调用speakeasy.totp
      const totpOptions = {
        secret: formattedSecret,
        encoding: 'base32',
        algorithm: 'sha1',
        digits: 6,
        step: 30
      };
      
      // 尝试使用不同的方法生成TOTP
      let code;
      try {
        // 方法1：直接使用speakeasy
        code = speakeasy.totp(totpOptions);
      } catch (err) {
        console.error('方法1失败:', err);
        
        try {
          // 方法2：使用base32-decode先解码密钥
          const decodedSecret = decode(formattedSecret, 'RFC4648');
          const buffer = Buffer.from(decodedSecret);
          
          code = speakeasy.totp({
            ...totpOptions,
            secret: buffer,
            encoding: 'ascii'
          });
        } catch (err2) {
          console.error('方法2失败:', err2);
          throw err2;
        }
      }
      
      console.log('生成的验证码:', code);
      
      if (!code) {
        throw new Error('生成的验证码为空');
      }
      
      setCode(code);
    } catch (error) {
      console.error('生成验证码失败:', error);
      setErrorMsg(`生成验证码失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 复制验证码到剪贴板
  const copyCodeToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          setCopyMsg('验证码已复制到剪贴板');
          setTimeout(() => setCopyMsg(''), 2000); // 2秒后清除提示
        })
        .catch(err => {
          console.error('复制失败:', err);
          setCopyMsg('复制失败，请手动复制');
        });
    }
  };

  // 计算进度条样式
  const progressPercentage = (timeLeft / 30) * 100;
  const progressColor = timeLeft > 10 ? '#67C23A' : '#F56C6C';
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '400px', padding: '20px', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)', borderRadius: '4px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>TOTP 验证码生成器</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="输入16-32位密钥（大小写字母A-Z和数字0-9）"
            value={secret}
            onChange={(e) => setSecret(e.target.value.replace(/[^A-Za-z0-9]/g, ''))}
            maxLength={32}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #dcdfe6', 
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
          <button 
            onClick={generateCode}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#409EFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            生成验证码
          </button>
          
          {errorMsg && (
            <div style={{ 
              color: '#F56C6C', 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#FEF0F0',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {errorMsg}
            </div>
          )}
          
          {copyMsg && (
            <div style={{ 
              color: '#67C23A', 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#F0F9EB',
              borderRadius: '4px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {copyMsg}
            </div>
          )}
        </div>
        
        {code && (
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                fontSize: '2rem', 
                fontFamily: 'monospace', 
                margin: '20px 0',
                cursor: 'pointer',
                padding: '10px',
                backgroundColor: '#F5F7FA',
                borderRadius: '4px',
                display: 'inline-block'
              }}
              onClick={copyCodeToClipboard}
              title="点击复制验证码"
            >
              {code.match(/\d{3}/g)?.join(' ') || code}
            </div>
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
              {/* 圆形进度条背景 */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '8px solid #E4E7ED'
              }}></div>
              
              {/* 圆形进度条 */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '8px solid transparent',
                borderTopColor: progressColor,
                transform: `rotate(${progressPercentage * 3.6}deg)`,
                transition: 'transform 1s linear'
              }}></div>
              
              {/* 倒计时文本 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.5rem'
              }}>
                {timeLeft}s
              </div>
            </div>
            
            <div style={{ color: '#909399', marginTop: '10px' }}>
              验证码有效期剩余时间
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TOTPGenerator;
