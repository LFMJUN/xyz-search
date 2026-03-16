// Netlify Functions - RDAP 免费域名查询 API

const RDAP_SERVERS = {
  'xyz': 'https://rdap.verisign.com/domain/v1/',
  'com': 'https://rdap.verisign.com/domain/v1/',
  'net': 'https://rdap.verisign.com/domain/v1/',
  'org': 'https://rdap.verisign.com/domain/v1/',
  'info': 'https://rdap.verisign.com/domain/v1/',
};

async function rdapLookup(domain) {
  const tld = domain.split('.').pop().toLowerCase();
  const server = RDAP_SERVERS[tld] || RDAP_SERVERS['xyz'];
  
  try {
    const response = await fetch(`${server}${domain}`, {
      headers: {
        'User-Agent': 'RDAP-Client/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (response.status === 404 || response.status === 400) {
      return { domain, available: true };
    }
    
    if (response.status === 200) {
      return { domain, available: false };
    }
    
    return { domain, available: null, status: response.status };
    
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

    const result = await rdapLookup(fullDomain);

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
