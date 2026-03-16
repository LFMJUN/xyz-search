# 🔍 XYZ 域名靓号批量搜索

6位数字 XYZ 域名靓号批量搜索工具

## 🚀 部署

### 方式1：Cloudflare Workers（推荐 - 国内访问快）

1. 登录 https://dash.cloudflare.com
2. **Workers 和 Pages** → **创建应用程序**
3. 选择 **部署 GitHub 仓库**
4. 连接 GitHub，选择 `xyz-search` 仓库
5. 部署后得到 Workers URL（如 `xyz-search.xxx.workers.dev`）
6. 打开 `domain-search.html`，修改 `API_BASE` 为你的 Workers URL

### 方式2：Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/LFMJUN/xyz-search&site_name=xyz-search)

## 📖 功能特性

- 🔍 批量查询 - 支持多个号码同时查询
- 📊 规律筛选 - 按AAB、ABA、ABB、AAA等规律筛选
- 📥 下载导出 - 一键导出可注册域名
- 💾 数据持久化 - 自动保存查询结果

## 📝 License

MIT
