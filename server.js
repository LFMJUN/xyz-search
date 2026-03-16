const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// 确保工作目录正确
const WORK_DIR = '/root/.openclaw/workspace';
if (!fs.existsSync(path.join(WORK_DIR, 'domain-search.html'))) {
  console.error('HTML file not found!');
}

// 中间件
app.use(express.json());

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
    // 使用 whois 命令查询域名
    const whoisResult = await new Promise((resolve, reject) => {
      exec(`whois ${domain}`, { timeout: 10000 }, (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      });
    });

    // 判断是否已注册
    // 如果有 "Domain Name:" 表示已注册
    // 如果有 "no match" 或 "not found" 表示未注册
    const hasDomainName = whoisResult.toLowerCase().includes('domain name:');
    const isAvailable = !hasDomainName;

    res.json({
      domain,
      available: isAvailable,
      raw: whoisResult.substring(0, 500)
    });
  } catch (error) {
    // 如果查询失败，假设可能是可注册的（保守估计）
    res.json({
      domain,
      available: true,
      error: error.message
    });
  }
});

// 批量查询
app.post('/api/check-domains', async (req, res) => {
  const { domains } = req.body;
  
  if (!domains || !Array.isArray(domains)) {
    return res.status(400).json({ error: 'Invalid domains array' });
  }

  const results = [];
  
  for (const domain of domains) {
    try {
      const whoisResult = await new Promise((resolve, reject) => {
        exec(`whois ${domain}`, { timeout: 10000 }, (err, stdout) => {
          if (err) resolve('');
          else resolve(stdout);
        });
      });

      const isAvailable = whoisResult.toLowerCase().includes('no match') || 
                          whoisResult.toLowerCase().includes('not found') ||
                          whoisResult.toLowerCase().includes('available');

      results.push({ domain, available: isAvailable });
      
      // 添加延迟避免请求过快
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      results.push({ domain, available: true, error: error.message });
    }
  }

  res.json(results);
});

// 静态文件服务 - 直接服务根目录
app.use(express.static(WORK_DIR));

// 首页
app.get('/', (req, res) => {
  const filePath = path.join(WORK_DIR, 'domain-search.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('readFile error:', err);
      return res.status(500).send('Error loading page');
    }
    res.type('html').send(data);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 服务已启动: http://localhost:${PORT}`);
  console.log(`📱 局域网访问: http://10.200.1.161:${PORT}`);
});
