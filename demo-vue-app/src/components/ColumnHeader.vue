<script setup>
defineProps({
  title: String,
  count: Number,
});
</script>

<template>
  <div class="column-header">
    <span class="column-title">{{ title }}</span>
    <span class="column-count">{{ count }}</span>
  </div>
</template>

<style scoped>
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 0 4px;
}

.column-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.column-count {
  font-size: 12px;
  color: #9ca3af;
  background: #e5e7eb;
  border-radius: 10px;
  padding: 1px 8px;
  font-weight: 500;
}
</style>
