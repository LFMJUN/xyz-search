// Cloudflare Workers - 域名查询 API + 前端页面

const DEFAULT_TLD = 'xyz';
const API_BASE = 'https://xyz-search.lfmjun.workers.dev';

async function whoisLookup(domain) {
  try {
    const response = await fetch(`https://www.whois.com/whois/${domain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const text = await response.text();
    const isRegistered = text.includes('Registered On');
    
    return { domain, available: !isRegistered };
  } catch (error) {
    return { domain, available: null, error: error.message };
  }
}

const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>6位数字XYZ域名靓号批量搜索</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #2563eb; --primary-dark: #1d4ed8; --accent: #f59e0b; --danger: #ef4444; --bg-main: #f8fafc; --bg-card: #ffffff; --bg-input: #f1f5f9; --text-main: #1e293b; --text-muted: #64748b; --border: #e2e8f0; --shadow-sm: 0 1px 3px rgba(0,0,0,0.05); --shadow-md: 0 4px 12px rgba(0,0,0,0.08); --shadow-lg: 0 8px 30px rgba(0,0,0,0.12); --radius: 12px; --radius-lg: 20px; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Outfit', sans-serif; background: var(--bg-main); color: var(--text-main); min-height: 100vh; line-height: 1.6; }
    .bg-pattern { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; background: radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 50%); }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; position: relative; z-index: 1; }
    .header { position: relative; text-align: center; margin-bottom: 48px; }
    .header h1 { font-size: 2.5rem; font-weight: 700; background: linear-gradient(135deg, var(--text-main) 0%, var(--primary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 12px; letter-spacing: -0.02em; }
    .header .subtitle { color: var(--text-muted); font-size: 1.1rem; font-weight: 400; }
    .header .github-link { position: absolute; top: 20px; right: 20px; display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text-main); text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: all 0.2s ease; }
    .header .github-link:hover { border-color: var(--primary); background: rgba(37, 99, 235, 0.05); }
    .search-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-lg); margin-bottom: 32px; border: 1px solid var(--border); }
    .input-group { display: flex; flex-direction: column; gap: 16px; }
    .input-label { font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 8px; }
    .input-label .icon { width: 20px; height: 20px; background: var(--primary); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
    textarea { width: 100%; min-height: 120px; padding: 16px; border: 2px solid var(--border); border-radius: var(--radius); font-family: 'JetBrains Mono', monospace; font-size: 15px; resize: vertical; transition: all 0.3s ease; background: var(--bg-input); }
    textarea:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
    textarea::placeholder { color: var(--text-muted); }
    .input-hint { font-size: 0.875rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
    .input-hint code { background: var(--bg-input); padding: 2px 8px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    .search-actions { display: flex; gap: 12px; margin-top: 20px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 32px; border-radius: var(--radius); font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; border: none; }
    .btn-primary { background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: white; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5); }
    .btn-secondary { background: var(--bg-input); color: var(--text-main); border: 2px solid var(--border); }
    .btn-secondary:hover { border-color: var(--primary); background: white; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .btn .spinner { width: 18px; height: 18px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .stats-bar { display: flex; gap: 24px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
    .stat-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); }
    .stat-item .dot { width: 8px; height: 8px; border-radius: 50%; }
    .stat-item .dot.green { background: #22c55e; }
    .stat-item .dot.red { background: var(--danger); }
    .stat-item .dot.blue { background: var(--primary); }
    .stat-item .value { font-weight: 600; color: var(--text-main); }
    .stat-item .label { color: var(--text-muted); font-size: 0.875rem; }
    .filter-section { margin-bottom: 24px; }
    .filter-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .filter-title { font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 8px; }
    .filter-count { background: var(--primary); color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.875rem; font-weight: 500; }
    .filter-tags { display: flex; flex-wrap: wrap; gap: 10px; }
    .filter-tag { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 24px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
    .filter-tag:hover { border-color: var(--primary); background: rgba(37, 99, 235, 0.05); }
    .filter-tag.active { background: var(--primary); color: white; border-color: var(--primary); }
    .filter-tag .count { background: rgba(0,0,0,0.1); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }
    .filter-tag.active .count { background: rgba(255,255,255,0.2); }
    .results-section { margin-top: 32px; }
    .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .results-title { font-weight: 600; color: var(--text-main); }
    .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .domain-card { background: var(--bg-card); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border); transition: all 0.3s ease; position: relative; overflow: hidden; }
    .domain-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #22c55e; opacity: 0; transition: opacity 0.3s ease; }
    .domain-card.registered::before { background: var(--danger); opacity: 1; }
    .domain-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .domain-card.registered { opacity: 0.7; }
    .domain-number { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 600; color: var(--text-main); text-align: center; margin-bottom: 8px; letter-spacing: 0.05em; }
    .domain-card.registered .domain-number { text-decoration: line-through; color: var(--text-muted); }
    .domain-suffix { color: var(--primary); font-weight: 700; }
    .domain-status { text-align: center; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .domain-status.available { color: #22c55e; }
    .domain-status.registered { color: var(--danger); }
    .domain-tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
    .domain-tag { font-size: 0.7rem; padding: 4px 8px; border-radius: 6px; font-weight: 500; }
    .domain-tag.pattern { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
    .domain-tag.rare { background: rgba(245, 158, 11, 0.15); color: #d97706; }
    .domain-tag.aaa { background: rgba(245, 158, 11, 0.2); color: #b45309; font-weight: 600; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state .icon { font-size: 4rem; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
    @media (max-width: 768px) { .header h1 { font-size: 1.75rem; } .search-card { padding: 20px; } .results-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; } .domain-card { padding: 14px; } .domain-number { font-size: 1.2rem; } .search-actions { flex-direction: column; } .btn { width: 100%; } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .domain-card { animation: fadeInUp 0.4s ease forwards; }
  </style>
</head>
<body>
  <div class="bg-pattern"></div>
  <div class="container">
    <header class="header">
      <a href="https://github.com/LFMJUN/xyz-search" target="_blank" class="github-link">
        <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        GitHub
      </a>
      <h1>🔍 6位数字XYZ域名靓号批量搜索</h1>
      <p class="subtitle">输入号码批量查询，一键查找未注册的优质域名</p>
    </header>
    <div class="search-card">
      <div class="input-group">
        <label class="input-label"><span class="icon">#</span>输入靓号号码</label>
        <textarea id="domainInput" placeholder="支持批量输入，用逗号，空格或换行分隔"></textarea>
        <div class="input-hint">💡 输入格式：支持 <code>逗号</code>、<code>空格</code>、<code>换行</code> 分隔</div>
        <div class="search-actions">
          <button class="btn btn-primary" id="searchBtn" onclick="searchDomains()"><span>🔎</span>批量查询</button>
          <button class="btn btn-secondary" onclick="clearInput()"><span>🗑️</span>清空</button>
        </div>
      </div>
    </div>
    <div class="stats-bar" id="statsBar" style="display: none;">
      <div class="stat-item"><span class="dot green"></span><span class="value" id="availableCount">0</span><span class="label">可注册</span></div>
      <div class="stat-item"><span class="dot red"></span><span class="value" id="registeredCount">0</span><span class="label">已注册</span></div>
      <div class="stat-item"><span class="dot blue"></span><span class="value" id="totalCount">0</span><span class="label">总计</span></div>
    </div>
    <div class="filter-section" id="filterSection" style="display: none;">
      <div class="filter-header">
        <div class="filter-title"><span>🏷️</span>按规律筛选<span class="filter-count" id="filterCount">0</span></div>
      </div>
      <div class="filter-tags" id="filterTags"></div>
    </div>
    <div class="results-section" id="resultsSection" style="display: none;">
      <div class="results-header"><div class="results-title">📋查询结果</div></div>
      <div class="results-grid" id="resultsGrid"></div>
    </div>
    <div class="empty-state" id="emptyState">
      <div class="icon">📭</div>
      <h3>暂无查询结果</h3><p>在上方输入靓号号码，点击"批量查询"开始搜索</p>
    </div>
  </div>
  <script>
    const API_URL = '` + API_BASE + `/api';
    
    // 规律检测
    function detectPatterns(num) {
      const detected = [];
      const uniqueDigits = [...new Set(num.split(''))].length;
      
      // 顺子检测
      let isAscending = true;
      let isDescending = true;
      for (let i = 0; i < num.length - 1; i++) {
        if (parseInt(num[i+1]) !== parseInt(num[i]) + 1) isAscending = false;
        if (parseInt(num[i+1]) !== parseInt(num[i]) - 1) isDescending = false;
      }
      if (isAscending) detected.push({ name: '顺子ABCDEF', rare: true });
      if (isDescending) detected.push({ name: '倒序FEDCBA', rare: true });
      
      // 数字种类
      if (uniqueDigits === 2) detected.push({ name: '两个数字', rare: false });
      else if (uniqueDigits === 3) detected.push({ name: '三个数字', rare: false });
      
      // 三连
      if (/(\\d)\\1{2}/.test(num)) detected.push({ name: '三连AAA', rare: true });
      // AABB
      if (/(\\d)\\1(\\d)\\2/.test(num)) detected.push({ name: 'AABB', rare: true });
      // ABAB
      if (/(\\d)(\\d)\\1\\2/.test(num)) detected.push({ name: 'ABAB', rare: true });
      // ABBA
      if (/(\\d)(\\d)\\2\\1/.test(num)) detected.push({ name: 'ABBA', rare: true });
      // AAB
      if (/(\\d)\\1/.test(num) && !/(\\d)\\1{2}/.test(num)) detected.push({ name: 'AAB', rare: false });
      // ABA
      if (/(\\d).\\1/.test(num)) detected.push({ name: 'ABA', rare: false });
      // ABB
      if (/\\d(\\d)\\1/.test(num) && !/(\\d)\\1{2}/.test(num)) detected.push({ name: 'ABB', rare: false });
      // 回文
      if (num === num.split('').reverse().join('')) detected.push({ name: '回文', rare: true });
      // ABCABC
      if (/^(\\d)(\\d)(\\d)\\1\\2\\3$/.test(num)) detected.push({ name: 'ABCABC', rare: true });
      
      return detected;
    }
    
    async function checkDomainStatus(domain) {
      if (!domain.includes('.')) domain = domain + '.xyz';
      try {
        const response = await fetch(API_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ domain }) 
        });
        const data = await response.json();
        return data.available;
      } catch (error) { 
        console.error('查询失败:', error); 
        return true; 
      }
    }
    
    function parseInput(input) { 
      return [...new Set(input.split(/[,\\s\\n]+/).map(s => s.trim().replace(/\\.xyz$/i, '')).filter(s => /^\\d{6}$/.test(s)))]; 
    }
    
    async function searchDomains() {
      const input = document.getElementById('domainInput').value;
      const numbers = parseInput(input);
      if (numbers.length === 0) { alert('请输入有效的6位数字号码'); return; }
      const searchBtn = document.getElementById('searchBtn');
      searchBtn.disabled = true;
      searchBtn.innerHTML = '<span class="spinner"></span>查询中...';
      const results = [];
      for (let i = 0; i < numbers.length; i++) {
        const num = numbers[i];
        const isAvailable = await checkDomainStatus(num);
        const patternTags = detectPatterns(num);
        results.push({ number: num, domain: num + '.xyz', available: isAvailable, patterns: patternTags });
        if (i < numbers.length - 1) await new Promise(r => setTimeout(r, 1200));
      }
      currentResults = results;
      const available = results.filter(r => r.available).length;
      const registered = results.filter(r => !r.available).length;
      document.getElementById('availableCount').textContent = available;
      document.getElementById('registeredCount').textContent = registered;
      document.getElementById('totalCount').textContent = results.length;
      document.getElementById('statsBar').style.display = 'flex';
      updateFilters(results);
      renderResults(results);
      saveToStorage(results);
      searchBtn.disabled = false;
      searchBtn.innerHTML = '<span>🔎</span>批量查询';
    }
    
    function updateFilters(results) {
      const filterTags = document.getElementById('filterTags');
      const filterSection = document.getElementById('filterSection');
      filterSection.style.display = 'block';
      const patternCount = {};
      for (const r of results) { for (const p of r.patterns) { patternCount[p.name] = (patternCount[p.name] || 0) + 1; } }
      const tags = Object.entries(patternCount).sort((a, b) => b[1] - a[1]).map(([name, count]) => '<div class="filter-tag" onclick="filterByPattern(\\'' + name + '\\')">' + name + '<span class="count">' + count + '</span></div>').join('');
      filterTags.innerHTML = '<div class="filter-tag active" onclick="filterByPattern(\\'\\')">全部<span class="count">' + results.length + '</span></div><div class="filter-tag" onclick="filterByStatus(\\'available\\')">✅可注册<span class="count">' + results.filter(r => r.available).length + '</span></div><div class="filter-tag" onclick="filterByStatus(\\'registered\\')">❌已注册<span class="count">' + results.filter(r => !r.available).length + '</span></div>' + tags;
      document.getElementById('filterCount').textContent = results.length;
      const availableCount = results.filter(r => r.available).length;
      if (availableCount > 0) { document.getElementById('statsBar').innerHTML += '<button class="btn btn-download" id="downloadBtn" onclick="downloadAvailable()" style="background:linear-gradient(135deg,#22c55e,#16a34a);color:white;padding:10px 20px;font-size:0.9rem;border-radius:12px;border:none;cursor:pointer;">📥下载可注册域名 (' + availableCount + ')</button>'; }
    }
    
    function filterByPattern(pattern) {
      document.querySelectorAll('.domain-card').forEach(card => { card.style.display = (!pattern || (card.dataset.patterns || '').includes(pattern)) ? '' : 'none'; });
      document.querySelectorAll('.filter-tag').forEach(tag => { tag.classList.remove('active'); if (tag.textContent.includes(pattern) || (!pattern && tag.textContent.includes('全部'))) tag.classList.add('active'); });
    }
    
    function filterByStatus(status) {
      document.querySelectorAll('.domain-card').forEach(card => {
        const isAvailable = !card.classList.contains('registered');
        if (status === 'available' && isAvailable) card.style.display = '';
        else if (status === 'registered' && !isAvailable) card.style.display = '';
        else if (!status) card.style.display = '';
        else card.style.display = 'none';
      });
      document.querySelectorAll('.filter-tag').forEach(tag => { tag.classList.remove('active'); if (tag.textContent.includes(status === 'available' ? '可注册' : status === 'registered' ? '已注册' : '全部')) tag.classList.add('active'); });
    }
    
    function downloadAvailable() {
      const available = currentResults.filter(r => r.available).map(r => r.domain);
      if (available.length === 0) { alert('没有可注册的域名'); return; }
      const blob = new Blob([available.join('\\n')], { type: 'text/plain' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'available-domains.txt'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }
    
    function renderResults(results) {
      const grid = document.getElementById('resultsGrid');
      const resultsSection = document.getElementById('resultsSection');
      const emptyState = document.getElementById('emptyState');
      if (results.length === 0) { resultsSection.style.display = 'none'; emptyState.style.display = 'block'; return; }
      resultsSection.style.display = 'block';
      emptyState.style.display = 'none';
      grid.innerHTML = results.map((r, i) => {
        const patternStr = r.patterns.map(p => p.name).join(',');
        const tagsHtml = r.patterns.map(p => '<span class="domain-tag ' + (p.rare ? 'rare' : 'pattern') + '">' + p.name + '</span>').join('');
        return '<div class="domain-card ' + (r.available ? '' : 'registered') + '" data-patterns="' + patternStr + '" style="animation-delay:' + (i * 0.02) + 's"><div class="domain-number">' + r.number + '<span class="domain-suffix">.xyz</span></div><div class="domain-status ' + (r.available ? 'available' : 'registered') + '">' + (r.available ? '✓可注册' : '✗已注册') + '</div><div class="domain-tags">' + (tagsHtml || '<span class="domain-tag pattern">普通号码</span>') + '</div></div>';
      }).join('');
    }
    
    function loadFromStorage() {
      const saved = localStorage.getItem('domainSearchResults');
      if (saved) {
        try {
          const results = JSON.parse(saved);
          if (results && results.length > 0) {
            currentResults = results;
            document.getElementById('availableCount').textContent = results.filter(r => r.available).length;
            document.getElementById('registeredCount').textContent = results.filter(r => !r.available).length;
            document.getElementById('totalCount').textContent = results.length;
            document.getElementById('statsBar').style.display = 'flex';
            updateFilters(results);
            renderResults(results);
            document.getElementById('domainInput').value = results.map(r => r.number).join('\\n');
          }
        } catch (e) { console.error('恢复失败:', e); }
      }
    }
    
    function saveToStorage(results) { localStorage.setItem('domainSearchResults', JSON.stringify(results)); }
    function clearInput() { document.getElementById('domainInput').value = ''; document.getElementById('statsBar').style.display = 'none'; document.getElementById('filterSection').style.display = 'none'; document.getElementById('resultsSection').style.display = 'none'; document.getElementById('emptyState').style.display = 'block'; localStorage.removeItem('domainSearchResults'); currentResults = []; }
    let currentResults = [];
    window.addEventListener('load', loadFromStorage);
    document.getElementById('domainInput').addEventListener('keydown', function(e) { if (e.key === 'Enter' && e.ctrlKey) searchDomains(); });
  </script>
</body>
</html>`;

async function handleRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(HTML_PAGE, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  }
  
  if (url.pathname === '/api' && request.method === 'POST') {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { domain } = await request.json();
      if (!domain) {
        return new Response(JSON.stringify({ error: 'Missing domain' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const fullDomain = domain.includes('.') ? domain : domain + '.' + DEFAULT_TLD;
      const result = await whoisLookup(fullDomain);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(HTML_PAGE, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
