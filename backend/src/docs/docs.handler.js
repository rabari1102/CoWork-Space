import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read openapi.json
let openApiSpec = {};
const possiblePaths = [
  path.resolve(__dirname, '../../../openapi.json'),
  path.resolve(__dirname, '../../openapi.json'),
  path.resolve(process.cwd(), 'openapi.json'),
  path.resolve(process.cwd(), '../openapi.json'),
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      openApiSpec = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    } catch {
      // ignore
    }
  }
}

export function docsRouter(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CoWork Space Booking API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    body { margin: 0; padding: 0; background: #fafafa; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`);
}

export function openApiJsonHandler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'co-work-space-three.vercel.app';
  const currentUrl = `${proto}://${host}/api`;

  const servers = [
    {
      url: currentUrl,
      description: host.includes('localhost') ? 'Local Development Server' : 'Current Live Server',
    },
    {
      url: 'https://co-work-space-three.vercel.app/api',
      description: 'Production Live Server (Vercel)',
    },
    {
      url: 'http://localhost:4000/api',
      description: 'Local Development Server',
    },
  ];

  const seen = new Set();
  const uniqueServers = servers.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });

  res.json({
    ...openApiSpec,
    servers: uniqueServers,
  });
}
