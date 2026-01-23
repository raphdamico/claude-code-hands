<script setup>
import { ref } from 'vue'

const activeItem = ref('dashboard')
const searchQuery = ref('')

const mainItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'components', icon: '🧩', label: 'Components' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
  { id: 'notifications', icon: '🔔', label: 'Notifications', badge: 3 },
]

const systemItems = [
  { id: 'users', icon: '👥', label: 'Users' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <span>Menu</span>
    </div>
    <nav class="sidebar-nav">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="search-input"
        />
      </div>
      <div class="section-label">Main</div>
      <button
        v-for="item in mainItems"
        :key="item.id"
        :class="['sidebar-item', { active: activeItem === item.id }]"
        @click="activeItem = item.id"
      >
        <span class="item-icon">{{ item.icon }}</span>
        <span class="item-label">{{ item.label }}</span>
        <span v-if="item.badge" class="item-badge">{{ item.badge }}</span>
      </button>
      <div class="section-label">System</div>
      <button
        v-for="item in systemItems"
        :key="item.id"
        :class="['sidebar-item', { active: activeItem === item.id }]"
        @click="activeItem = item.id"
      >
        <span class="item-icon">{{ item.icon }}</span>
        <span class="item-label">{{ item.label }}</span>
      </button>
    </nav>
    <div class="sidebar-footer">
      <div class="status-dot"></div>
      <span>Claude Hands Active</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 200px;
  background: #111827;
  color: white;
  display: flex;
  flex-direction: column;
  min-height: 0;
  align-self: stretch;
  border-right: 1px solid #1f2937;
}

.sidebar-header {
  padding: 14px 14px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #6b7280;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.search-box {
  padding: 0 2px 8px;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 5px;
  color: #e5e7eb;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input::placeholder {
  color: #6b7280;
}

.search-input:focus {
  border-color: #667eea;
}

.section-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #4b5563;
  font-weight: 600;
  padding: 10px 10px 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: #9ca3af;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;
  font-size: 13px;
  text-align: left;
}

.sidebar-item:hover {
  background: #1f2937;
  color: #e5e7eb;
}

.sidebar-item.active {
  background: rgba(102, 126, 234, 0.15);
  color: #a5b4fc;
}

.item-icon {
  font-size: 14px;
}

.item-label {
  flex: 1;
}

.item-badge {
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid #1f2937;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
