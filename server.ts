import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy route for Football API
  app.all('/api/football/*', async (req, res) => {
    const apiKey = process.env.FOOTBALL_API_KEY;
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_FOOTBALL_API_KEY') {
      console.warn('FOOTBALL_API_KEY is not configured');
      return res.status(200).json({ 
        warning: 'FOOTBALL_API_KEY is not configured',
        response: [],
        results: 0
      });
    }

    // Extract target path relative to /api/football/
    // originalUrl is the full path from the root, e.g., /api/football/fixtures?live=all
    const parts = req.originalUrl.split('/api/football/');
    const targetPath = parts.length > 1 ? parts[1] : null;

    if (!targetPath) {
      console.warn('No target path found in originalUrl:', req.originalUrl);
      return res.status(400).json({ error: 'No endpoint specified' });
    }

    const url = `https://v3.football.api-sports.io/${targetPath}`;

    try {
      console.log(`[Proxy] ${req.method} ${req.originalUrl} -> ${url}`);
      const response = await fetch(url, {
        method: req.method,
        headers: {
          'x-rapidapi-key': apiKey.trim(),
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'Accept': 'application/json'
        },
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined
      });

      console.log(`[Proxy] Received ${response.status} from Football API`);
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        console.error(`Non-JSON response from Football API (${response.status}):`, text.slice(0, 200));
        res.status(response.status).json({ 
          error: 'External API returned non-JSON response',
          status: response.status,
          received: text.slice(0, 100)
        });
      }
    } catch (error) {
      console.error('Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch from Football API' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
