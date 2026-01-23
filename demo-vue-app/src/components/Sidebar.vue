<script setup>
import ProjectItem from './ProjectItem.vue';
import { projects } from '../data/boardData';
</script>

<template>
  <aside class="sidebar">
    <div class="section-label">Projects</div>
    <ProjectItem
      v-for="p in projects"
      :key="p.id"
      :project="p"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  background: #1b1f2e;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 12px;
  margin-bottom: 8px;
}
</style>
