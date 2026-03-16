// Netlify Functions - 域名查询 API

// 方案1: IANA WHOIS 查询
async function whoisLookup(domain) {
  try {
    const response = await fetch(`https://whois.iana.org/${domain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const text = await response.text();
    
    // 如果返回的是"No match"或"NOT FOUND"表示未注册
    // 如果返回的是域名信息表示已注册
    const isAvailable = text.toLowerCase().includes('no match') || 
                       text.toLowerCase().includes('not found') ||
                       text.toLowerCase().includes('query status: no match');
    
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
