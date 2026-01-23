<script setup>
import { currentUser } from '../data/boardData';
</script>

<template>
  <div class="user-menu">
    <span class="user-name">{{ currentUser.name }}</span>
    <div class="user-avatar">{{ currentUser.initials }}</div>
  </div>
</template>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-name {
  font-size: 13px;
  color: #6b7280;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
