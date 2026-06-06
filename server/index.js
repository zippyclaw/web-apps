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
  </style>
</head>
<body class="bg-zinc-950 text-white">
  <div class="max-w-2xl mx-auto px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
        <span class="text-zinc-950 font-bold text-xl">W</span>
      </div>
      <h1 class="text-3xl font-semibold tracking-tight">Web Apps</h1>
    </div>

    <p class="text-zinc-400 mb-8">Tap any app to open it. Works great on iPhone and Mac.</p>

    <div class="grid grid-cols-1 gap-3">
      ${apps.length > 0 ? apps.map(app => `
        <a href="/${app}" 
           class="group flex items-center justify-between bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-800 border border-zinc-800 rounded-2xl px-5 py-4 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-zinc-800 group-hover:bg-zinc-700 rounded-2xl flex items-center justify-center text-xl">
              ${app.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-medium text-lg">${app}</div>
              <div class="text-sm text-zinc-500">Open app</div>
            </div>
          </div>
          <div class="text-zinc-600 group-hover:text-white transition-colors">→</div>
        </a>
      `).join('') : `
        <div class="text-center py-12 text-zinc-500">
          No apps yet. Add folders to <code class="bg-zinc-900 px-1.5 py-0.5 rounded">apps/</code>
        </div>
      `}
    </div>

    <div class="mt-12 text-center text-xs text-zinc-600">
      Accessible on your Tailnet • Mobile friendly
    </div>
  </div>
</body>
</html>
  `;

  res.send(html);
});

// Serve apps with a consistent top bar
app.use((req, res, next) => {
  const appName = req.path.split('/')[1];
  const appPath = path.join(APPS_DIR, appName);

  if (!appName || !fs.existsSync(appPath)) {
    return next();
  }

  const indexPath = path.join(appPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return next();
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  // Inject top bar if not already present
  if (!html.includes('web-apps-topbar')) {
    const topbar = `
      <div id="web-apps-topbar" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#18181b;border-bottom:1px solid #27272a;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;font-family:system-ui,-apple-system,sans-serif;">
        <a href="/" style="color:#a1a1aa;text-decoration:none;font-size:15px;display:flex;align-items:center;gap:6px;">
          ← <span style="font-weight:500;color:#e4e4e7;">Home</span>
        </a>
        <div style="color:#e4e4e7;font-weight:600;font-size:15px;">${appName}</div>
        <div style="width:60px;"></div>
      </div>
      <div style="height:52px;"></div>
    `;

    // Try to inject after <body>
    if (html.includes('<body')) {
      html = html.replace(/<body[^>]*>/i, match => match + topbar);
    } else {
      html = topbar + html;
    }
  }

  res.send(html);
});

// Fallback static serving
app.use(express.static(APPS_DIR, { index: 'index.html' }));

app.listen(PORT, () => {
  console.log(`Web Apps server running on port ${PORT}`);
});