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

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Web Apps</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
    :root {
      --wa-bg: #f8f8f9;
      --wa-card: #fff;
      --wa-border: #e5e5e7;
      --wa-text: #1c1c1e;
      --wa-text-secondary: #6c6c70;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --wa-bg: #111113;
        --wa-card: #18181b;
        --wa-border: #3f3f46;
        --wa-text: #f4f4f5;
        --wa-text-secondary: #a1a1aa;
      }
    }
    .app-card {
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .app-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  </style>
</head>
<body class="bg-[var(--wa-bg)] text-[var(--wa-text)]">
  <div class="max-w-2xl mx-auto px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
        <span class="text-zinc-950 font-bold text-xl">W</span>
      </div>
      <h1 class="text-3xl font-semibold tracking-tight">Web Apps</h1>
    </div>

    <p class="text-[var(--wa-text-secondary)] mb-8">Tap any app to open it. Works great on iPhone and Mac.</p>

    <div class="grid grid-cols-1 gap-3">
      ${apps.length > 0 ? apps.map(app => `
        <a href="/${app}" 
           class="app-card group flex items-center justify-between bg-[var(--wa-card)] border border-[var(--wa-border)] rounded-2xl px-5 py-4">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-[var(--wa-border)] rounded-2xl flex items-center justify-center text-xl">
              ${app.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-medium text-lg">${app}</div>
              <div class="text-sm text-zinc-500">Open app</div>
            </div>
          </div>
          <div class="text-[var(--wa-text-secondary)] group-hover:text-[var(--wa-text)] transition-colors transition-colors">→</div>
        </a>
      `).join('') : `
        <div class="text-center py-12 text-zinc-500">
          No apps yet. Add folders to <code class="bg-zinc-900 px-1.5 py-0.5 rounded">apps/</code>
        </div>
      `}
    </div>

    <div class="mt-12 text-center text-xs text-[var(--wa-text-secondary)]">
      Accessible on your Tailnet • Mobile friendly
    </div>
  </div>
</body>
</html>
  `;

  res.send(html);
});

// Inject top bar for app roots (must come before static)
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
      <div id="web-apps-topbar" style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#111113;border-bottom:1px solid #3f3f46;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.4);">
        <a href="/" style="color:#a1a1aa;text-decoration:none;font-size:15px;display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:8px;">
          ← <span style="font-weight:600;color:#e4e4e7;">Home</span>
        </a>
        <div style="color:#f4f4f5;font-weight:600;font-size:15px;letter-spacing:-0.2px;">${appName}</div>
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

// Serve static assets (js, css, images, etc.)
app.use(express.static(APPS_DIR, { index: false }));

app.listen(PORT, () => {
  console.log(`Web Apps server running on port ${PORT}`);
});