// Claude Hands - Content Script
// Scans components and displays visual indicators (Vue + React)

(function() {
  'use strict';

  // ============================================
  // Component Scanner
  // ============================================

  const ComponentScanner = {
    knownComponents: [],
    lastScanTime: 0,
    SCAN_DEBOUNCE: 500,

    /**
     * Normalize a file path for matching
     * Extracts src-relative path or just filename
     */
    normalizePath(filePath) {
      if (!filePath) return '';

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
    },

    /**
     * Request a fresh scan from the MAIN-world script.
     * The MAIN-world script marks elements with data-claude-hands-component attributes.
     */
    requestScan() {
      const now = Date.now();
      if (now - this.lastScanTime < this.SCAN_DEBOUNCE) {
        return;
      }
      this.lastScanTime = now;
      window.dispatchEvent(new CustomEvent('claude-hands-scan-request'));
    },

    /**
     * Find elements matching a file path using data attributes set by the MAIN-world script.
     * Falls back to CSS selector if provided.
     */
    findElements(targetPath, selector) {
      // Request a fresh scan from the page-context script
      this.requestScan();

      const normalizedTarget = this.normalizePath(targetPath);
      const targetFilename = targetPath.split('/').pop();

      // Query elements by exact normalized path
      let elements = Array.from(
        document.querySelectorAll(`[data-claude-hands-component="${normalizedTarget}"]`)
      );
      if (elements.length > 0) {
        console.log('[Claude Hands] Found elements via exact path:', normalizedTarget, elements.length);
        return elements;
      }

      // Try filename-only match
      const filenameSelector = targetFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      elements = Array.from(
        document.querySelectorAll('[data-claude-hands-component]')
      ).filter(el => {
        const comp = el.getAttribute('data-claude-hands-component');
        return comp && comp.split('/').pop() === targetFilename;
      });
      if (elements.length > 0) {
        console.log('[Claude Hands] Found elements via filename match:', targetFilename, elements.length);
        return elements;
      }

      // Partial path match
      elements = Array.from(
        document.querySelectorAll('[data-claude-hands-component]')
      ).filter(el => {
        const comp = el.getAttribute('data-claude-hands-component');
        return comp && (comp.endsWith(normalizedTarget) || normalizedTarget.endsWith(comp));
      });
      if (elements.length > 0) {
        console.log('[Claude Hands] Found elements via partial path match:', normalizedTarget, elements.length);
        return elements;
      }

      // Fallback: use CSS selector if provided (used by demo mode)
      if (selector) {
        const els = document.querySelectorAll(selector);
        if (els.length > 0) {
          console.log('[Claude Hands] Found elements via selector fallback:', selector);
          return Array.from(els);
        }
      }

      console.log('[Claude Hands] No elements found for:', targetPath, '(normalized:', normalizedTarget + ')');
      return [];
    }
  };

  // ============================================
  // Visual Overlay Manager
  // ============================================

  const VisualOverlay = {
    // Map<normalizedPath, { highlights[], indicator, emojiContainer, label, speechBubble, emojis[], elements[] }>
    overlays: new Map(),
    container: null,
    speechBubbleEnabled: false,

    init() {
      // Create overlay container
      this.container = document.createElement('div');
      this.container.id = 'claude-hands-overlay-container';
      this.container.style.cssText = 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 999998;';
      document.body.appendChild(this.container);

      // Load speech bubble preference
      chrome.storage.local.get('speechBubbleEnabled', (result) => {
        this.speechBubbleEnabled = result.speechBubbleEnabled !== false; // default true
      });

      // Listen for preference changes
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.speechBubbleEnabled) {
          this.speechBubbleEnabled = changes.speechBubbleEnabled.newValue;
          // Hide existing speech bubbles if disabled
          if (!this.speechBubbleEnabled) {
            for (const [, entry] of this.overlays) {
              if (entry.speechBubble) {
                entry.speechBubble.remove();
                entry.speechBubble = null;
              }
            }
            // Hide global overlay descriptions too
            for (const [, entry] of GlobalOverlay.entries) {
              if (entry.descEl) {
                entry.descEl.style.display = 'none';
              }
            }
          } else {
            // Re-show global overlay descriptions
            for (const [, entry] of GlobalOverlay.entries) {
              if (entry.descEl) {
                entry.descEl.style.display = '';
              }
            }
          }
        }
      });

      // Update positions on scroll/resize
      window.addEventListener('scroll', () => this.updateAllPositions(), { passive: true });
      window.addEventListener('resize', () => this.updateAllPositions(), { passive: true });

      console.log('[Claude Hands] Overlay initialized');
    },

    /**
     * Show indicator for a file operation — accumulates emoji per file
     */
    show(operation) {
      const { filePath, normalizedPath, operation: opType, selector, description, visual } = operation;

      // Resolve visual metadata from event, with fallback defaults
      const emoji = (visual && visual.emoji) || (opType === 'read' ? '\u{1F441}\uFE0F' : '\u{1F91A}');
      const cssClass = (visual && visual.cssClass) || (opType === 'read' ? 'reading' : 'editing');

      const existing = this.overlays.get(normalizedPath);

      if (existing) {
        // Add another emoji to the existing overlay
        this.addEmoji(normalizedPath, existing, emoji, cssClass);
        // Update speech bubble with new description
        if (description && this.speechBubbleEnabled) {
          this.updateSpeechBubble(existing, description);
        }
        console.log('[Claude Hands] Added emoji for:', filePath, opType);
        return;
      }

      // Find matching DOM elements
      const elements = ComponentScanner.findElements(filePath, selector);
      if (elements.length === 0) {
        // No matching DOM elements — show in global overlay instead
        GlobalOverlay.show(operation);
        return;
      }

      // Create highlights for ALL matching elements
      const highlightClass = cssClass;
      const highlights = elements.map(el => {
        const rect = el.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = `claude-hands-highlight ${highlightClass}`;
        this.positionHighlight(highlight, rect);
        this.container.appendChild(highlight);
        return highlight;
      });

      // Position indicator on first element only
      const primaryRect = elements[0].getBoundingClientRect();
      const { indicator, emojiContainer, label } = this.createIndicator(filePath);
      this.positionIndicator(indicator, primaryRect);
      this.container.appendChild(indicator);

      // Create speech bubble if enabled and description exists
      let speechBubble = null;
      if (description && this.speechBubbleEnabled) {
        speechBubble = this.createSpeechBubble(description);
        this.positionSpeechBubble(speechBubble, primaryRect);
        this.container.appendChild(speechBubble);
      }

      // Store overlay entry
      const entry = {
        highlights,
        indicator,
        emojiContainer,
        label,
        speechBubble,
        emojis: [],
        elements
      };
      this.overlays.set(normalizedPath, entry);

      // Add the first emoji
      this.addEmoji(normalizedPath, entry, emoji, cssClass);

      console.log('[Claude Hands] Showing indicator for:', filePath, opType, `(${elements.length} elements)`);
    },

    /**
     * Add an emoji to an existing overlay entry
     */
    addEmoji(normalizedPath, entry, emoji, cssClass) {
      const span = document.createElement('span');
      span.className = 'claude-hands-emoji';
      span.textContent = emoji;
      entry.emojiContainer.appendChild(span);

      // Start 4s removal timeout
      const timeoutId = setTimeout(() => {
        this.removeEmoji(normalizedPath, emojiEntry);
      }, 4000);

      const emojiEntry = { element: span, timeoutId };
      entry.emojis.push(emojiEntry);

      // Update highlight class on ALL highlights based on latest operation
      entry.highlights.forEach(h => { h.className = `claude-hands-highlight ${cssClass}`; });
    },

    /**
     * Remove a single emoji with fade-out; if last emoji, remove the whole overlay
     */
    removeEmoji(normalizedPath, emojiEntry) {
      const entry = this.overlays.get(normalizedPath);
      if (!entry) return;

      // Fade out the emoji
      emojiEntry.element.classList.add('exiting');

      setTimeout(() => {
        emojiEntry.element.remove();

        // Remove from the emojis array
        const idx = entry.emojis.indexOf(emojiEntry);
        if (idx !== -1) entry.emojis.splice(idx, 1);

        // If no emojis left, remove the whole overlay
        if (entry.emojis.length === 0) {
          entry.indicator.classList.add('exiting');
          entry.highlights.forEach(h => { h.style.opacity = '0'; });

          // Fade out speech bubble
          if (entry.speechBubble) {
            entry.speechBubble.classList.add('exiting');
          }

          setTimeout(() => {
            entry.highlights.forEach(h => h.remove());
            entry.indicator.remove();
            if (entry.speechBubble) {
              entry.speechBubble.remove();
            }
            this.overlays.delete(normalizedPath);
          }, 300);
        }
      }, 300);
    },

    /**
     * Hide — ignored, timeout handles emoji removal
     */
    hide(operation) {
      // Intentionally empty: emoji auto-fade via timeouts
    },

    /**
     * Create the indicator element (emoji container + label)
     */
    createIndicator(filePath) {
      const indicator = document.createElement('div');
      indicator.className = 'claude-hands-indicator';

      const emojiContainer = document.createElement('div');
      emojiContainer.className = 'claude-hands-emoji-container';
      indicator.appendChild(emojiContainer);

      const label = document.createElement('div');
      label.className = 'claude-hands-label';
      label.textContent = filePath.split('/').pop();
      indicator.appendChild(label);

      return { indicator, emojiContainer, label };
    },

    positionHighlight(highlight, rect) {
      highlight.style.cssText = `
        position: absolute;
        top: ${rect.top + window.scrollY}px;
        left: ${rect.left + window.scrollX}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        pointer-events: none;
        border-radius: 8px;
        z-index: 999998;
      `;
    },

    positionIndicator(indicator, rect) {
      indicator.style.cssText = `
        position: absolute;
        top: ${rect.top + window.scrollY - 56}px;
        left: ${rect.left + window.scrollX + rect.width / 2}px;
        transform: translateX(-50%);
        z-index: 999999;
      `;
    },

    createSpeechBubble(text) {
      const bubble = document.createElement('div');
      bubble.className = 'claude-hands-speech-bubble';
      bubble.textContent = text;
      return bubble;
    },

    updateSpeechBubble(entry, text) {
      if (!entry.speechBubble) {
        // Create new speech bubble if it doesn't exist yet
        if (entry.elements.length === 0) return;
        const rect = entry.elements[0].getBoundingClientRect();
        entry.speechBubble = this.createSpeechBubble(text);
        this.positionSpeechBubble(entry.speechBubble, rect);
        this.container.appendChild(entry.speechBubble);
      } else {
        // Update existing bubble text
        entry.speechBubble.textContent = text;
      }
    },

    positionSpeechBubble(bubble, rect) {
      bubble.style.cssText = `
        position: absolute;
        top: ${rect.top + window.scrollY + rect.height + 8}px;
        left: ${rect.left + window.scrollX + rect.width / 2}px;
        transform: translateX(-50%);
        z-index: 999999;
      `;
    },

    updateAllPositions() {
      for (const [normalizedPath, entry] of this.overlays) {
        if (entry.elements.length === 0) continue;

        // Update all highlights
        entry.elements.forEach((el, i) => {
          if (entry.highlights[i]) {
            const rect = el.getBoundingClientRect();
            this.positionHighlight(entry.highlights[i], rect);
          }
        });

        // Update indicator and speech bubble on first element
        const primaryRect = entry.elements[0].getBoundingClientRect();
        this.positionIndicator(entry.indicator, primaryRect);
        if (entry.speechBubble) {
          this.positionSpeechBubble(entry.speechBubble, primaryRect);
        }
      }
    },

    /**
     * Sync state with multiple operations
     */
    syncState(operations) {
      // Clear all existing overlays
      for (const [key, entry] of this.overlays) {
        entry.emojis.forEach(e => clearTimeout(e.timeoutId));
        entry.highlights.forEach(h => h.remove());
        entry.indicator.remove();
        if (entry.speechBubble) entry.speechBubble.remove();
      }
      this.overlays.clear();
      GlobalOverlay.clear();

      // Show all current operations
      for (const op of operations) {
        this.show(op);
      }
    }
  };

  // ============================================
  // Global Overlay (non-component files)
  // ============================================

  const GlobalOverlay = {
    // Map<normalizedPath, { fileEntry, descEl, timeoutId }>
    entries: new Map(),
    container: null,
    highlight: null,
    panel: null,

    init() {
      this.container = document.createElement('div');
      this.container.id = 'claude-hands-global-container';
      this.container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 999997;';
      document.body.appendChild(this.container);
    },

    show(operation) {
      const { filePath, normalizedPath, operation: opType, description, visual } = operation;

      // Resolve visual metadata from event, with fallback defaults
      const emoji = (visual && visual.emoji) || (opType === 'read' ? '\u{1F441}\uFE0F' : '\u{1F91A}');
      const cssClass = (visual && visual.cssClass) || (opType === 'read' ? 'reading' : 'editing');

      const existing = this.entries.get(normalizedPath);
      if (existing) {
        // Reset timeout
        clearTimeout(existing.timeoutId);
        existing.timeoutId = setTimeout(() => this.removeEntry(normalizedPath), 5000);
        // Update description if provided and bubbles enabled
        if (description && existing.descEl && VisualOverlay.speechBubbleEnabled) {
          existing.descEl.textContent = description;
        }
        return;
      }

      // Show page-wide highlight if first entry
      if (this.entries.size === 0) {
        this.showHighlight(cssClass);
      } else if (this.highlight) {
        // Update highlight class to latest operation
        this.highlight.className = `claude-hands-global-highlight ${cssClass}`;
      }

      // Create panel if not visible
      if (!this.panel) {
        this.panel = document.createElement('div');
        this.panel.className = 'claude-hands-global-panel';
        this.container.appendChild(this.panel);
      }

      // Add file entry
      const fileEntry = document.createElement('div');
      fileEntry.className = 'claude-hands-global-file-entry';
      const filename = filePath.split('/').pop();
      fileEntry.innerHTML = `<span class="claude-hands-global-emoji">${emoji}</span><span class="claude-hands-global-filename">${filename}</span>`;

      let descEl = null;
      if (description && VisualOverlay.speechBubbleEnabled) {
        descEl = document.createElement('div');
        descEl.className = 'claude-hands-global-description';
        descEl.textContent = description;
        fileEntry.appendChild(descEl);
      }

      this.panel.appendChild(fileEntry);

      const timeoutId = setTimeout(() => this.removeEntry(normalizedPath), 5000);
      this.entries.set(normalizedPath, { fileEntry, descEl, timeoutId });

      console.log('[Claude Hands] Global overlay for:', filePath, opType);
    },

    removeEntry(normalizedPath) {
      const entry = this.entries.get(normalizedPath);
      if (!entry) return;

      entry.fileEntry.classList.add('exiting');
      setTimeout(() => {
        entry.fileEntry.remove();
        this.entries.delete(normalizedPath);

        // If no more entries, remove panel and highlight
        if (this.entries.size === 0) {
          this.hideAll();
        }
      }, 300);
    },

    showHighlight(cssClass) {
      this.highlight = document.createElement('div');
      this.highlight.className = `claude-hands-global-highlight ${cssClass}`;
      this.container.appendChild(this.highlight);
    },

    hideAll() {
      if (this.highlight) {
        this.highlight.classList.add('exiting');
        const h = this.highlight;
        setTimeout(() => { h.remove(); }, 300);
        this.highlight = null;
      }
      if (this.panel) {
        this.panel.classList.add('exiting');
        const p = this.panel;
        setTimeout(() => { p.remove(); }, 300);
        this.panel = null;
      }
    },

    clear() {
      for (const [, entry] of this.entries) {
        clearTimeout(entry.timeoutId);
        entry.fileEntry.remove();
      }
      this.entries.clear();
      if (this.highlight) { this.highlight.remove(); this.highlight = null; }
      if (this.panel) { this.panel.remove(); this.panel = null; }
    }
  };

  // ============================================
  // Connection Status Badge
  // ============================================

  const ConnectionBadge = {
    badge: null,
    hideTimeout: null,

    init() {
      this.badge = document.createElement('div');
      this.badge.className = 'claude-hands-connection-badge';
      this.badge.style.display = 'none';
      document.body.appendChild(this.badge);
    },

    show(connected) {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }

      this.badge.className = `claude-hands-connection-badge ${connected ? 'connected' : 'disconnected'}`;
      this.badge.innerHTML = `
        <span class="claude-hands-connection-dot"></span>
        ${connected ? 'Claude Hands Connected' : 'Claude Hands Disconnected'}
      `;
      this.badge.style.display = 'flex';

      // Auto-hide after 3 seconds if connected
      if (connected) {
        this.hideTimeout = setTimeout(() => {
          this.badge.style.display = 'none';
        }, 3000);
      }
    }
  };

  // ============================================
  // Message Handler
  // ============================================

  function handleMessage(message) {
    console.log('[Claude Hands] Received message:', message.type);

    switch (message.type) {
      case 'FILE_OPERATION_START':
        VisualOverlay.show(message);
        break;

      case 'FILE_OPERATION_END':
        VisualOverlay.hide(message);
        break;

      case 'SYNC_STATE':
        VisualOverlay.syncState(message.operations || []);
        break;

      case 'CONNECTION_STATUS':
        ConnectionBadge.show(message.connected);
        break;
    }
  }

  // ============================================
  // Initialization
  // ============================================

  function init() {
    console.log('[Claude Hands] Content script initializing...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  function onReady() {
    // Initialize overlay system
    VisualOverlay.init();
    GlobalOverlay.init();
    ConnectionBadge.init();

    // Listen for component scan results from the MAIN-world script
    window.addEventListener('claude-hands-components-scanned', (event) => {
      const { components } = event.detail;
      ComponentScanner.knownComponents = components;
      console.log('[Claude Hands] Components available:', components.length, components);
    });

    // Request initial scan from the MAIN-world script
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('claude-hands-scan-request'));
    }, 2000);

    // Listen for messages from service worker
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      handleMessage(message);
      sendResponse({ received: true });
      return true;
    });

    // Get initial state
    chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
      if (response) {
        ConnectionBadge.show(response.connected);
        if (response.operations && response.operations.length > 0) {
          VisualOverlay.syncState(response.operations);
        }
      }
    });

    console.log('[Claude Hands] Content script ready');
  }

  init();
})();
