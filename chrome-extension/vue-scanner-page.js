// Vue Scanner - Page Context Script (runs in MAIN world)
// This script has access to Vue's JS properties on DOM elements
// and communicates component data back to the content script via CustomEvent.
// Part of Claude Hands — works alongside react-scanner-page.js.

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
   * Walk the Vue 3 component tree from an instance
   * Returns a map of normalizedPath -> array of element identifiers
   */
  function walkComponentTree(instance, results) {
    if (!instance) return;

    const file = instance.type?.__file;
    if (file && instance.vnode?.el) {
      const el = instance.vnode.el;
      if (el.nodeType === 1) {
        const normalizedPath = normalizePath(file);
        if (!results.has(normalizedPath)) {
          results.set(normalizedPath, []);
        }
        // Mark the element with a data attribute so the content script can find it
        const marker = `claude-hands-${normalizedPath.replace(/[^a-zA-Z0-9]/g, '-')}`;
        el.setAttribute('data-claude-hands-component', normalizedPath);
        results.get(normalizedPath).push(normalizedPath);
      }
    }

    if (instance.subTree) {
      walkVNode(instance.subTree, results);
    }
  }

  function walkVNode(vnode, results) {
    if (!vnode) return;
    if (vnode.component) {
      walkComponentTree(vnode.component, results);
    }
    if (vnode.children && Array.isArray(vnode.children)) {
      for (const child of vnode.children) {
        if (child && typeof child === 'object') {
          walkVNode(child, results);
        }
      }
    }
    if (vnode.dynamicChildren) {
      for (const child of vnode.dynamicChildren) {
        walkVNode(child, results);
      }
    }
  }

  function scanAllElements(results) {
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      let filePath = null;

      // Vue 3: __vueParentComponent
      if (el.__vueParentComponent) {
        const component = el.__vueParentComponent;
        filePath = component.type?.__file;
        if (!filePath) {
          let parent = component.parent;
          while (parent) {
            if (parent.type?.__file) {
              filePath = parent.type.__file;
              break;
            }
            parent = parent.parent;
          }
        }
      }

      // Vue 2: __vue__
      if (!filePath && el.__vue__) {
        const vm = el.__vue__;
        filePath = vm.$options?.__file || (vm.$options?._componentTag ? vm.$options._componentTag + '.vue' : null);
      }

      if (filePath) {
        const normalizedPath = normalizePath(filePath);
        el.setAttribute('data-claude-hands-component', normalizedPath);
        if (!results.has(normalizedPath)) {
          results.set(normalizedPath, []);
        }
        results.get(normalizedPath).push(normalizedPath);
      }
    }
  }

  function scan() {
    const now = Date.now();
    if (now - lastScanTime < SCAN_DEBOUNCE && cachedResult) {
      return cachedResult;
    }
    lastScanTime = now;

    const results = new Map();

    // Try Vue 3 app root first
    const appEl = document.querySelector('#app');
    if (appEl && appEl.__vue_app__) {
      const rootInstance = appEl.__vue_app__._instance;
      if (rootInstance) {
        walkComponentTree(rootInstance, results);
      }
    }

    // Fallback: scan all elements
    if (results.size === 0) {
      scanAllElements(results);
    }

    cachedResult = results;

    // Dispatch event with component paths so content script knows what's available
    const componentPaths = Array.from(results.keys());
    window.dispatchEvent(new CustomEvent('claude-hands-components-scanned', {
      detail: { components: componentPaths }
    }));

    return results;
  }

  // Listen for scan requests from the content script
  window.addEventListener('claude-hands-scan-request', () => {
    scan();
  });

  // Initial scan after a delay to let Vue mount
  setTimeout(() => {
    scan();
  }, 1500);

  // Re-scan periodically in case components change (e.g., route changes)
  setInterval(() => {
    scan();
  }, 5000);
})();
