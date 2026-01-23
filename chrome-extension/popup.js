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
      const icon = (op.visual && op.visual.emoji) || (op.operation === 'read' ? '\u{1F441}\uFE0F' : '\u{1F91A}');
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

const demoVueBtn = document.getElementById('demo-vue-btn');
const demoReactBtn = document.getElementById('demo-react-btn');
let demoRunning = false;
let demoActiveBtn = null;
let demoTimeouts = [];

const demoVueFiles = [
  { filePath: 'src/components/Card.vue', operation: 'read', selector: '.card', description: 'Reading component...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/assets/styles.css', operation: 'edit', description: 'Editing: .card { border-radius: 8px;...', visual: { emoji: '\u{1F91A}', cssClass: 'editing' } },
  { filePath: 'src/components/Header.vue', operation: 'read', selector: '.header', description: 'Reading component...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/utils/helpers.js', operation: 'read', description: 'Reading script...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/components/Sidebar.vue', operation: 'edit', selector: '.sidebar', description: 'Editing: <template>\\n  <aside class...', visual: { emoji: '\u{1F91A}', cssClass: 'editing' } },
  { filePath: 'src/components/Button.vue', operation: 'edit', selector: '.btn', description: 'Editing: <button :class="btnClass...', visual: { emoji: '\u{1F91A}', cssClass: 'editing' } },
  { filePath: 'index.html', operation: 'read', description: 'Reading template...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/App.vue', operation: 'read', selector: '.app', description: 'Reading component...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
];

const demoReactFiles = [
  { filePath: 'src/components/Header.jsx', operation: 'read', selector: 'header', description: 'Reading component...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/components/Card.jsx', operation: 'edit', selector: 'main > div', description: 'Editing: <h3>{title}</h3>...', visual: { emoji: '\u{1F91A}', cssClass: 'editing' } },
  { filePath: 'src/components/Sidebar.jsx', operation: 'read', selector: 'aside', description: 'Reading component...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/App.jsx', operation: 'read', selector: '#root > div', description: 'Reading component...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/main.jsx', operation: 'read', description: 'Reading script...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
  { filePath: 'src/components/Card.jsx', operation: 'edit', selector: 'main > div', description: 'Editing: style={{ borderRadius...', visual: { emoji: '\u{1F91A}', cssClass: 'editing' } },
  { filePath: 'src/components/Header.jsx', operation: 'edit', selector: 'header', description: 'Editing: <nav style={{ marginLeft...', visual: { emoji: '\u{1F91A}', cssClass: 'editing' } },
  { filePath: 'vite.config.js', operation: 'read', description: 'Reading config...', visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' } },
];

function sendToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message);
}

function runDemo(tabId, files, btn) {
  demoRunning = true;
  demoActiveBtn = btn;
  btn.textContent = '\u23F9 Stop';
  btn.classList.add('active');

  let delay = 0;
  const stagger = 1500;
  const holdDuration = 3000;

  files.forEach((file) => {
    // Start operation
    const startTimeout = setTimeout(() => {
      sendToContentScript(tabId, {
        type: 'FILE_OPERATION_START',
        filePath: file.filePath,
        normalizedPath: file.filePath,
        operation: file.operation,
        selector: file.selector,
        description: file.description,
        visual: file.visual,
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
        visual: file.visual,
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

  if (demoActiveBtn) {
    const isVue = demoActiveBtn === demoVueBtn;
    demoActiveBtn.textContent = isVue ? '\u25B6 Vue Demo' : '\u25B6 React Demo';
    demoActiveBtn.classList.remove('active');
    demoActiveBtn = null;
  }

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

function handleDemoClick(btn, files) {
  if (demoRunning) {
    stopDemo();
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      runDemo(tabs[0].id, files, btn);
    }
  });
}

demoVueBtn.addEventListener('click', () => handleDemoClick(demoVueBtn, demoVueFiles));
demoReactBtn.addEventListener('click', () => handleDemoClick(demoReactBtn, demoReactFiles));
