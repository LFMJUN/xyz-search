// Netlify Functions - 域名查询 API

async function whoisLookup(domain) {
  try {
    const response = await fetch(`https://www.whois.com/whois/${domain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const text = await response.text();
    
    // 只需要检查 "Registered On" - 有则表示已注册，无则表示未注册
    const isRegistered = text.includes('Registered On');
    
    return { domain, available: !isRegistered };
  } catch (error) {
    return { domain, available: null, error: error.message };
  }
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

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
