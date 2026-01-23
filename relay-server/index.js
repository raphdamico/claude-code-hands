import http from 'http';
import { WebSocketServer } from 'ws';
import config from '../lib/config.js';

const HTTP_PORT = config.relay.httpPort;
const WS_PORT = config.relay.wsPort;

// Track active operations and connected clients
const activeOperations = new Map();
const wsClients = new Set();

// Create HTTP server for receiving hook events
const httpServer = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/event') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        handleEvent(event);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error parsing event:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/clear') {
    // Clear all active operations (for conversation interruption cleanup)
    const count = activeOperations.size;
    const now = Date.now();
    for (const [key, op] of activeOperations.entries()) {
      activeOperations.delete(key);
      broadcast({ type: 'FILE_OPERATION_END', ...op, endTime: now, stale: true });
    }
    console.log(`[${new Date().toISOString()}] Cleared ${count} stale operations`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, cleared: count }));
  } else if (req.method === 'GET' && req.url === '/status') {
    // Status endpoint for debugging
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      wsClients: wsClients.size,
      activeOperations: Array.from(activeOperations.entries())
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server for Chrome extension
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('Chrome extension connected');
  wsClients.add(ws);

  // Send current state on connection
  ws.send(JSON.stringify({
    type: 'SYNC_STATE',
    activeOperations: Array.from(activeOperations.values())
  }));

  ws.on('close', () => {
    console.log('Chrome extension disconnected');
    wsClients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    wsClients.delete(ws);
  });

  // Handle ping/pong for keepalive
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// Keepalive check every 30 seconds
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      wsClients.delete(ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

function handleEvent(event) {
  const { type, filePath, operation, tool, sessionId, description, visual, timestamp } = event;

  // Normalize the file path for consistent matching
  const normalizedPath = normalizePath(filePath);
  const operationKey = `${normalizedPath}:${operation}`;

  console.log(`[${new Date().toISOString()}] ${type}: ${filePath} (${operation})${description ? ' - ' + description : ''}`);

  if (type === 'FILE_OPERATION_START') {
    const opData = {
      filePath,
      normalizedPath,
      operation,
      tool,
      sessionId,
      description,
      visual,
      startTime: timestamp || Date.now()
    };
    activeOperations.set(operationKey, opData);
    broadcast({ type: 'FILE_OPERATION_START', ...opData });
  } else if (type === 'FILE_OPERATION_END') {
    const opData = activeOperations.get(operationKey);
    if (opData) {
      activeOperations.delete(operationKey);
      broadcast({
        type: 'FILE_OPERATION_END',
        ...opData,
        endTime: timestamp || Date.now(),
        duration: (timestamp || Date.now()) - opData.startTime
      });
    }
  }

  // Auto-cleanup stale operations after 30 seconds
  const now = Date.now();
  for (const [key, op] of activeOperations.entries()) {
    if (now - op.startTime > 30000) {
      activeOperations.delete(key);
      broadcast({ type: 'FILE_OPERATION_END', ...op, endTime: now, stale: true });
    }
  }
}

function normalizePath(filePath) {
  if (!filePath) return '';

  // Extract the filename or src-relative path
  const parts = filePath.split('/');

  // Try to find 'src' in the path
  const srcIndex = parts.indexOf('src');
  if (srcIndex !== -1) {
    return parts.slice(srcIndex).join('/');
  }

  // Try to find 'components' in the path
  const componentsIndex = parts.indexOf('components');
  if (componentsIndex !== -1) {
    return parts.slice(componentsIndex).join('/');
  }

  // Fall back to just the filename
  return parts[parts.length - 1];
}

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of wsClients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(data);
    }
  }
}

// Start servers
httpServer.listen(HTTP_PORT, () => {
  const W = 48;
  const bar = '═'.repeat(W);
  const pad = (s) => '║' + s.padEnd(W) + '║';
  console.log(`
╔${bar}╗
${pad('       Claude Hands - Relay Server')}
╠${bar}╣
${pad(`  HTTP endpoint: http://localhost:${HTTP_PORT}/event`)}
${pad(`  WebSocket:     ws://localhost:${WS_PORT}`)}
${pad(`  Status:        http://localhost:${HTTP_PORT}/status`)}
╚${bar}╝
`);
});

// Periodic cleanup of stale operations (runs independently of incoming events)
setInterval(() => {
  const now = Date.now();
  for (const [key, op] of activeOperations.entries()) {
    if (now - op.startTime > 30000) {
      activeOperations.delete(key);
      broadcast({ type: 'FILE_OPERATION_END', ...op, endTime: now, stale: true });
      console.log(`[${new Date().toISOString()}] Auto-cleared stale operation: ${key}`);
    }
  }
}, 5000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  wss.close();
  httpServer.close();
  process.exit(0);
});
