<script setup>
defineProps({
  project: Object,
});
</script>

<template>
  <div :class="['project-item', { active: project.active }]">
    <div class="project-dot" :style="{ background: project.color }" />
    <span class="project-name">{{ project.name }}</span>
  </div>
</template>

<style scoped>
.project-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
}

.project-item.active {
  background: rgba(99, 102, 241, 0.15);
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.project-name {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 400;
}

.project-item.active .project-name {
  color: white;
  font-weight: 500;
}
</style>
