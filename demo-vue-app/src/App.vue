<script setup>
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Card from './components/Card.vue'
import Button from './components/Button.vue'
</script>

<template>
  <div class="app">
    <Header title="Claude Vue Viz Demo" />
    <div class="app-body">
      <Sidebar />
      <main class="main-content">
        <div class="content-header">
          <h1>Dashboard</h1>
          <p>Edit any .vue file to see the visualization in action!</p>
        </div>

        <div class="cards-grid">
          <Card
            title="Components"
            icon="🧩"
            value="5"
            trend="up"
            trend-value="+2 new"
          />
          <Card
            title="Read Operations"
            icon="👀"
            value="0"
            trend="neutral"
            trend-value="watching"
          />
          <Card
            title="Edit Operations"
            icon="✍️"
            value="0"
            trend="neutral"
            trend-value="ready"
          />
          <Card
            title="Connection"
            icon="🔌"
            value="Active"
            trend="up"
            trend-value="ws://localhost:9528"
          />
        </div>

        <div class="actions-section">
          <h2>Test Components</h2>
          <p>These components are available for testing:</p>

          <div class="component-list">
            <div class="component-item">
              <span class="component-file">Header.vue</span>
              <span class="component-desc">Navigation header with logo</span>
            </div>
            <div class="component-item">
              <span class="component-file">Sidebar.vue</span>
              <span class="component-desc">Side navigation menu</span>
            </div>
            <div class="component-item">
              <span class="component-file">Card.vue</span>
              <span class="component-desc">Stats/info cards</span>
            </div>
            <div class="component-item">
              <span class="component-file">Button.vue</span>
              <span class="component-desc">Action buttons</span>
            </div>
          </div>

          <div class="button-row">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </div>

        <div class="instructions">
          <h2>How to Test</h2>
          <ol>
            <li>Start the relay server: <code>cd relay-server && npm start</code></li>
            <li>Load the Chrome extension in developer mode</li>
            <li>Open this page in Chrome</li>
            <li>Use Claude Code to read or edit any .vue file in this project</li>
            <li>Watch the visual indicators appear on matching components!</li>
          </ol>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f3f4f6;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  background: #f8f9fb;
}

.content-header {
  margin-bottom: 20px;
}

.content-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.content-header p {
  color: #9ca3af;
  font-size: 13px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.actions-section {
  background: white;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 14px;
  border: 1px solid #e5e7eb;
}

.actions-section h2 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.actions-section p {
  color: #9ca3af;
  font-size: 13px;
  margin-bottom: 14px;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 10px;
  background: #f8f9fb;
  border-radius: 6px;
}

.component-file {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  min-width: 110px;
}

.component-desc {
  color: #6b7280;
  font-size: 12px;
}

.button-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.instructions {
  background: white;
  border-radius: 10px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
}

.instructions h2 {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.instructions ol {
  padding-left: 18px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.9;
}

.instructions code {
  background: #f0f1f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
  color: #667eea;
}
</style>
