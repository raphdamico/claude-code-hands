// Claude Hands - Service Worker
// Maintains WebSocket connection to relay server and broadcasts to content scripts

const WS_URL = 'ws://localhost:9528';
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

let ws = null;
let reconnectAttempt = 0;
let isConnected = false;
let keepAliveInterval = null;

// Store active operations
const activeOperations = new Map();

// Connect to WebSocket server
function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  console.log('[Claude Hands] Connecting to relay server...');

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[Claude Hands] Connected to relay server');
      isConnected = true;
      reconnectAttempt = 0;
      startKeepAlive();
      broadcastConnectionStatus(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (err) {
        console.error('[Claude Hands] Error parsing message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[Claude Hands] Disconnected from relay server');
      isConnected = false;
      stopKeepAlive();
      broadcastConnectionStatus(false);
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error('[Claude Hands] WebSocket error:', err);
    };
  } catch (err) {
    console.error('[Claude Hands] Failed to create WebSocket:', err);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  const delay = RECONNECT_DELAYS[Math.min(reconnectAttempt, RECONNECT_DELAYS.length - 1)];
  reconnectAttempt++;
  console.log(`[Claude Hands] Reconnecting in ${delay}ms (attempt ${reconnectAttempt})`);
  setTimeout(connect, delay);
}

// Keep service worker alive
function startKeepAlive() {
  stopKeepAlive();
  keepAliveInterval = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Send a ping to keep connection alive
      ws.send(JSON.stringify({ type: 'PING' }));
    }
  }, 20000);
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// Handle messages from relay server
function handleMessage(message) {
  console.log('[Claude Hands] Received:', message.type, message.filePath || '');

  switch (message.type) {
    case 'SYNC_STATE':
      // Sync active operations on reconnect
      activeOperations.clear();
      if (message.activeOperations) {
        for (const op of message.activeOperations) {
          activeOperations.set(`${op.normalizedPath}:${op.operation}`, op);
        }
      }
      broadcastToContentScripts({
        type: 'SYNC_STATE',
        operations: Array.from(activeOperations.values())
      });
      break;

    case 'FILE_OPERATION_START':
      activeOperations.set(`${message.normalizedPath}:${message.operation}`, message);
      broadcastToContentScripts(message);
      break;

    case 'FILE_OPERATION_END':
      activeOperations.delete(`${message.normalizedPath}:${message.operation}`);
      broadcastToContentScripts(message);
      break;
  }
}

// Broadcast to all content scripts
async function broadcastToContentScripts(message) {
  try {
    const tabs = await chrome.tabs.query({
      url: ['http://localhost:*/*', 'http://127.0.0.1:*/*']
    });

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch (err) {
        // Tab might not have content script loaded yet
      }
    }
  } catch (err) {
    console.error('[Claude Hands] Error broadcasting to tabs:', err);
  }
}

// Broadcast connection status
function broadcastConnectionStatus(connected) {
  broadcastToContentScripts({
    type: 'CONNECTION_STATUS',
    connected
  });

  // Update badge
  chrome.action.setBadgeText({ text: connected ? '' : '!' });
  chrome.action.setBadgeBackgroundColor({ color: connected ? '#10B981' : '#EF4444' });
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STATE') {
    sendResponse({
      connected: isConnected,
      operations: Array.from(activeOperations.values())
    });
  } else if (message.type === 'RECONNECT') {
    reconnectAttempt = 0;
    connect();
    sendResponse({ success: true });
  }
  return true;
});

// Handle extension icon click to show connection status
chrome.action.onClicked.addListener((tab) => {
  console.log('[Claude Hands] Extension icon clicked, connected:', isConnected);
});

// Start connection on service worker load
connect();

// Keep service worker alive by setting an alarm
chrome.alarms.create('keepAlive', { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // This just keeps the service worker from being terminated
    console.log('[Claude Hands] Keepalive ping, connected:', isConnected);
    if (!isConnected) {
      connect();
    }
  }
});
