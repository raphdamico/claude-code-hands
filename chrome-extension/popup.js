// Popup script for Claude Hands

const statusEl = document.getElementById('status');
const statusText = document.getElementById('status-text');
const operationsList = document.getElementById('operations-list');
const reconnectBtn = document.getElementById('reconnect');

function updateUI(state) {
  // Update connection status
  if (state.connected) {
    statusEl.className = 'status connected';
    statusText.textContent = 'Connected to relay';
    reconnectBtn.style.display = 'none';
  } else {
    statusEl.className = 'status disconnected';
    statusText.textContent = 'Disconnected';
    reconnectBtn.style.display = 'block';
  }

  // Update operations list
  if (state.operations && state.operations.length > 0) {
    operationsList.innerHTML = state.operations.map(op => {
      const icon = op.operation === 'read' ? '👀' : '✍️';
      const typeClass = op.operation;
      const fileName = op.normalizedPath || op.filePath.split('/').pop();
      return `
        <div class="operation">
          <span class="operation-icon">${icon}</span>
          <span class="operation-file" title="${op.filePath}">${fileName}</span>
          <span class="operation-type ${typeClass}">${op.operation}</span>
        </div>
      `;
    }).join('');
  } else {
    operationsList.innerHTML = '<div class="empty">No active operations</div>';
  }
}

// Get initial state
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
  if (response) {
    updateUI(response);
  }
});

// Listen for updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (response) {
      updateUI(response);
    }
  });
});

// Reconnect button
reconnectBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RECONNECT' }, (response) => {
    statusText.textContent = 'Reconnecting...';
  });
});

// Speech bubble toggle
const speechBubbleToggle = document.getElementById('speech-bubble-toggle');

// Load saved preference
chrome.storage.local.get('speechBubbleEnabled', (result) => {
  speechBubbleToggle.checked = result.speechBubbleEnabled !== false; // default true
});

// Save preference on change
speechBubbleToggle.addEventListener('change', () => {
  chrome.storage.local.set({ speechBubbleEnabled: speechBubbleToggle.checked });
});

// Refresh every second to keep operations list updated
setInterval(() => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (response) {
      updateUI(response);
    }
  });
}, 1000);

// ============================================
// Demo Mode
// ============================================

const demoBtn = document.getElementById('demo-btn');
let demoRunning = false;
let demoTimeouts = [];

const demoFiles = [
  { filePath: 'src/components/Card.vue', operation: 'read', selector: '.card', description: 'Reading component...' },
  { filePath: 'src/assets/styles.css', operation: 'edit', description: 'Editing: .card { border-radius: 8px;...' },
  { filePath: 'src/components/Header.vue', operation: 'read', selector: '.header', description: 'Reading component...' },
  { filePath: 'src/utils/helpers.js', operation: 'read', description: 'Reading script...' },
  { filePath: 'src/components/Sidebar.vue', operation: 'edit', selector: '.sidebar', description: 'Editing: <template>\\n  <aside class...' },
  { filePath: 'src/components/Button.vue', operation: 'edit', selector: '.btn', description: 'Editing: <button :class="btnClass...' },
  { filePath: 'index.html', operation: 'read', description: 'Reading template...' },
  { filePath: 'src/App.vue', operation: 'read', selector: '.app', description: 'Reading component...' },
];

function sendToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message);
}

function runDemo(tabId) {
  demoRunning = true;
  demoBtn.textContent = '⏹ Stop Demo';
  demoBtn.classList.add('active');

  let delay = 0;
  const stagger = 1500;
  const holdDuration = 3000;

  demoFiles.forEach((file, i) => {
    // Start operation
    const startTimeout = setTimeout(() => {
      sendToContentScript(tabId, {
        type: 'FILE_OPERATION_START',
        filePath: file.filePath,
        normalizedPath: file.filePath,
        operation: file.operation,
        selector: file.selector,
        description: file.description,
      });
    }, delay);
    demoTimeouts.push(startTimeout);

    // End operation
    const endTimeout = setTimeout(() => {
      sendToContentScript(tabId, {
        type: 'FILE_OPERATION_END',
        filePath: file.filePath,
        normalizedPath: file.filePath,
        operation: file.operation,
        selector: file.selector,
      });
    }, delay + holdDuration);
    demoTimeouts.push(endTimeout);

    delay += stagger;
  });

  // Reset button after all operations finish
  const resetTimeout = setTimeout(() => {
    stopDemo();
  }, delay + holdDuration + 500);
  demoTimeouts.push(resetTimeout);
}

function stopDemo() {
  demoTimeouts.forEach(t => clearTimeout(t));
  demoTimeouts = [];
  demoRunning = false;
  demoBtn.textContent = '▶ Run Demo';
  demoBtn.classList.remove('active');

  // Clear all overlays on the active tab by syncing empty state
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      sendToContentScript(tabs[0].id, {
        type: 'SYNC_STATE',
        operations: [],
      });
    }
  });
}

demoBtn.addEventListener('click', () => {
  if (demoRunning) {
    stopDemo();
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      runDemo(tabs[0].id);
    }
  });
});
