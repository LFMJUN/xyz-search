// Netlify Functions - 简单的域名查询 API

async function whoisLookup(domain) {
  const url = `https://www.whois.com/whois/${domain}`;
  
  try {
    const res = await fetch(url);
    const text = await res.text();
    const isRegistered = text.includes('Registered On');
    return { domain, available: !isRegistered };
  } catch (e) {
    return { domain, available: null, error: e.message };
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: '{"error":"Method not allowed"}' };
  }

  try {
    const { domain } = JSON.parse(event.body || '{}');
    if (!domain) {
      return { statusCode: 400, headers, body: '{"error":"Missing domain"}' };
    }

    const fullDomain = domain.includes('.') ? domain : domain + '.xyz';
    const result = await whoisLookup(fullDomain);

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers, body: `{"error":"${e.message}"}` };
  }
};
