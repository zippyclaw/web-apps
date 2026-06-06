const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const APPS_DIR = path.join(__dirname, '../apps');

// Homepage - list all apps
app.get('/', (req, res) => {
  let apps = [];
  try {
    apps = fs.readdirSync(APPS_DIR).filter(name => {
      const stat = fs.statSync(path.join(APPS_DIR, name));
      return stat.isDirectory();
    });
  } catch (e) {
    apps = [];
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Apps</title>
  <style>
    :root {
      --wa-bg: #111113;
      --wa-surface: #18181b;
      --wa-border: #3f3f46;
      --wa-text: #f4f4f5;
      --wa-text-secondary: #a1a1aa;
    }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--wa-bg);
      color: var(--wa-text);
    }
    .topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background: var(--wa-bg);
      border-bottom: 1px solid var(--wa-border);
      z-index: 100;
    }
    .card {
      background: var(--wa-surface);
      border: 1px solid var(--wa-border);
      border-radius: 20px;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      color: inherit;
      transition: transform 0.1s ease;
    }
    .card:hover {
      transform: translateY(-1px);
    }
    .logo {
      width: 28px;
      height: 28px;
      background: var(--wa-text);
      color: var(--wa-bg);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="logo">W</div>
      <span style="font-weight:600;font-size:15px">Web Apps</span>
    </div>
  </div>

  <div style="max-width:720px;margin:80px auto 0;padding:0 24px">
    <div style="margin-bottom:32px">
      <h1 style="font-size:42px;font-weight:700;letter-spacing:-1.5px;margin:0 0 8px">Web Apps</h1>
      <p style="color:var(--wa-text-secondary);font-size:15px;margin:0">Tap any app to open it. Works great on iPhone and Mac.</p>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px">
      ${apps.length > 0 ? apps.map(app => `
        <a href="/${app}" class="card">
          <div style="display:flex;align-items:center;gap:16px">
            <div style="width:44px;height:44px;background:var(--wa-border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600">
              ${app.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-weight:600;font-size:17px">${app}</div>
              <div style="color:var(--wa-text-secondary);font-size:14px">Open app</div>
            </div>
          </div>
          <div style="color:var(--wa-text-secondary);font-size:18px">→</div>
        </a>
      `).join('') : `
        <div style="text-align:center;padding:48px 0;color:var(--wa-text-secondary)">No apps yet</div>
      `}
    </div>

    <div style="margin-top:48px;text-align:center;font-size:12px;color:var(--wa-text-secondary)">
      Accessible on your Tailnet • Mobile friendly
    </div>
  </div>
</body>
</html>`;

  res.send(html);
});

// Serve apps with a consistent top bar
app.get('/:appName', (req, res, next) => {
  const { appName } = req.params;
  if (!appName) return next();

  const appDir = path.join(APPS_DIR, appName);
  const indexPath = path.join(appDir, 'index.html');

  if (!fs.existsSync(appDir) || !fs.existsSync(indexPath)) {
    return next();
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  if (!html.includes('id="web-apps-topbar"')) {
    const topbar = `
      <div id="web-apps-topbar" style="position:fixed;top:0;left:0;right:0;z-index:99999;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.1);background:var(--wa-bg);border-bottom:1px solid var(--wa-border);">
        <a href="/" style="color:var(--wa-text-secondary);text-decoration:none;font-size:15px;display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;">
          ← <span style="font-weight:600;color:var(--wa-text);">Home</span>
        </a>
        <div style="color:var(--wa-text);font-weight:600;font-size:15px;letter-spacing:-0.2px;">${appName}</div>
        <div style="width:70px;"></div>
      </div>
      <div style="height:52px;"></div>
    `;

    if (html.includes('<body')) {
      html = html.replace(/<body[^>]*>/i, match => match + topbar);
    } else {
      html = topbar + html;
    }
  }

  res.send(html);
});

// Serve static assets
app.use(express.static(APPS_DIR, { index: false }));

app.listen(PORT, () => {
  console.log(`Web Apps server running on port ${PORT}`);
});