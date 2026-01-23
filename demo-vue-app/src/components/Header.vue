<script setup>
defineProps({
  title: {
    type: String,
    default: 'Claude Hands Demo'
  }
})
</script>

<template>
  <div class="header-wrapper">
    <header class="header">
      <div class="logo">
        <span class="logo-icon">👀</span>
        <span class="logo-text">{{ title }}</span>
        <span class="status-dot"></span>
      </div>
      <div class="header-right">
        <nav class="nav">
          <a href="#" class="nav-link">Dashboard</a>
          <a href="#" class="nav-link">Components</a>
          <a href="#" class="nav-link">About</a>
        </nav>
        <div class="avatar">RC</div>
      </div>
    </header>
    <div class="breadcrumb">
      <span class="breadcrumb-item">Home</span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-item current">Dashboard</span>
    </div>
  </div>
</template>

<style scoped>
.header-wrapper {
  background: #1f2937;
  border-bottom: 1px solid #374151;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 48px;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 16px;
}

.logo-text {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #10b981;
  border-radius: 50%;
  margin-left: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav {
  display: flex;
  gap: 6px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 5px;
  transition: all 0.15s;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.08);
}

.avatar {
  width: 30px;
  height: 30px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.breadcrumb {
  padding: 6px 20px;
  font-size: 11px;
  color: #6b7280;
  background: #1a2332;
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-sep {
  color: #4b5563;
}

.breadcrumb-item.current {
  color: #9ca3af;
}
</style>
