<script setup>
import UserMenu from './UserMenu.vue';
</script>

<template>
  <header class="app-header">
    <div class="app-name">
      <span class="app-icon">&#9670;</span>
      TaskFlow
    </div>
    <UserMenu />
  </header>
</template>

<style scoped>
.app-header {
  height: 56px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.app-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon {
  color: #6366f1;
}
</style>
