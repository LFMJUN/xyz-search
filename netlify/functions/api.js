// Netlify Functions - 域名查询 API

// 使用 whois.com API 方式查询
async function whoisLookup(domain) {
  try {
    // 方法1: 通过 whois.com 查询页面
    const response = await fetch(`https://www.whois.com/whois/${domain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const text = await response.text();
    
    // whois.com 页面中包含 "is available!" 表示未注册
    // 包含 "Domain Name:" 表示已注册
    const isAvailable = text.toLowerCase().includes('is available!') && 
                       !text.toLowerCase().includes('domain name:');
    
    return { domain, available: isAvailable };
  } catch (error) {
    return { domain, available: null, error: error.message };
  }
}

exports.handler = async function(event, context) {
  // 设置 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { domain } = JSON.parse(event.body);
    
    if (!domain) {
      return { 
        statusCode: 400, 
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing domain' }) 
      };
    }

    // 自动添加 .xyz 后缀
    let fullDomain = domain;
    if (!domain.includes('.')) {
      fullDomain = domain + '.xyz';
    }

    const result = await whoisLookup(fullDomain);

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
