const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APPS_DIR = path.join(__dirname, '../apps');

// Serve static files for each app
app.use(express.static(APPS_DIR, { index: 'index.html' }));

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

app.listen(PORT, () => {
  console.log(`Web Apps server running on port ${PORT}`);
  console.log(`→ http://localhost:${PORT}`);
});