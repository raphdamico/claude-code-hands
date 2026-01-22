<script setup>
defineProps({
  title: {
    type: String,
    default: 'Claude Vue Viz Demo'
  }
})
</script>

<template>
  <header class="header">
    <div class="logo">
      <span class="logo-icon">👀</span>
      <span class="logo-text">{{ title }}</span>
    </div>
    <nav class="nav">
      <a href="#" class="nav-link">Dashboard</a>
      <a href="#" class="nav-link">Components</a>
      <a href="#" class="nav-link">About</a>
    </nav>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 48px;
  background: #1f2937;
  color: white;
  border-bottom: 1px solid #374151;
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
</style>
