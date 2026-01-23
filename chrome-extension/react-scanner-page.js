// React Scanner - Page Context Script (runs in MAIN world)
// This script has access to React's fiber nodes on DOM elements
// and communicates component data back to the content script via CustomEvent.
// Part of Claude Hands — works alongside vue-scanner-page.js.

(function() {
  'use strict';

  const SCAN_DEBOUNCE = 500;
  let lastScanTime = 0;
  let cachedResult = null;

  function normalizePath(filePath) {
    if (!filePath) return '';
    const parts = filePath.split('/');
    const srcIndex = parts.indexOf('src');
    if (srcIndex !== -1) return parts.slice(srcIndex).join('/');
    const componentsIndex = parts.indexOf('components');
    if (componentsIndex !== -1) return parts.slice(componentsIndex).join('/');
    return parts[parts.length - 1];
  }

  /**
   * Find the React fiber key prefix on a DOM element.
   * React 17+ uses __reactFiber$<key>, React 16 uses __reactInternalInstance$<key>.
   */
  function getFiberFromElement(el) {
    const keys = Object.keys(el);
    for (const key of keys) {
      if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
        return el[key];
      }
    }
    return null;
  }

  /**
   * Extract the source file path from a fiber node.
   * React dev mode attaches _debugSource with { fileName, lineNumber, columnNumber }.
   * We walk up the fiber tree to find the nearest component with _debugSource.
   */
  function getSourceFromFiber(fiber) {
    let current = fiber;
    while (current) {
      if (current._debugSource && current._debugSource.fileName) {
        return current._debugSource.fileName;
      }
      // Also check the fiber's type for function/class components
      if (current.type && current.type.__debugSource) {
        return current.type.__debugSource.fileName;
      }
      current = current.return;
    }
    return null;
  }

  function scanAllElements(results) {
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      const fiber = getFiberFromElement(el);
      if (!fiber) continue;

      const filePath = getSourceFromFiber(fiber);
      if (!filePath) continue;

      const normalizedPath = normalizePath(filePath);
      el.setAttribute('data-claude-hands-component', normalizedPath);
      if (!results.has(normalizedPath)) {
        results.set(normalizedPath, []);
      }
      results.get(normalizedPath).push(normalizedPath);
    }
  }

  function scan() {
    const now = Date.now();
    if (now - lastScanTime < SCAN_DEBOUNCE && cachedResult) {
      return cachedResult;
    }
    lastScanTime = now;

    const results = new Map();
    scanAllElements(results);
    cachedResult = results;

    // Dispatch event with component paths so content script knows what's available
    const componentPaths = Array.from(results.keys());
    if (componentPaths.length > 0) {
      window.dispatchEvent(new CustomEvent('claude-hands-components-scanned', {
        detail: { components: componentPaths }
      }));
    }

    return results;
  }

  // Listen for scan requests from the content script
  window.addEventListener('claude-hands-scan-request', () => {
    scan();
  });

  // Initial scan after a delay to let React mount
  setTimeout(() => {
    scan();
  }, 1500);

  // Re-scan periodically in case components change (e.g., route changes)
  setInterval(() => {
    scan();
  }, 5000);
})();
