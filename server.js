const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());

// 静态文件服务
app.use(express.static(__dirname));

// 首页
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'domain-search.html'));
});

// 域名查询API
app.post('/api/check-domain', async (req, res) => {
  let { domain } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Missing domain' });
  }

  // 自动添加 .xyz 后缀
  if (!domain.includes('.')) {
    domain = domain + '.xyz';
  }

  try {
    const whoisResult = await new Promise((resolve, reject) => {
      exec(`whois ${domain}`, { timeout: 5000 }, (err, stdout, stderr) => {
        if (err) {
          resolve(stderr || err.message);
        } else {
          resolve(stdout);
        }
      });
    });

    const text = whoisResult.toLowerCase();
    
    // 可注册的情况
    const availablePatterns = [
      'domain not found',
      'not found',
      'no match',
      'no data',
      'object does not exist'
    ];
    
    // 已注册的情况
    const registeredPatterns = [
      'domain name:',
      'registrar url:',
      'creation date:',
      'registry domain id:'
    ];
    
    let isAvailable = false;
    
    // 先检查是否可注册
    for (const pattern of availablePatterns) {
      if (text.includes(pattern)) {
        isAvailable = true;
        break;
      }
    }
    
    // 如果不是可注册，再检查是否已注册
    if (!isAvailable) {
      for (const pattern of registeredPatterns) {
        if (text.includes(pattern)) {
          isAvailable = false;
          break;
        }
      }
    }

    res.json({
      domain,
      available: isAvailable,
      raw: whoisResult.substring(0, 500)
    });
  } catch (error) {
    // 超时或连接错误，返回null表示未知
    res.json({
      domain,
      available: null,
      error: error.message
    });
    return;
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 服务已启动: http://localhost:${PORT}`);
});
