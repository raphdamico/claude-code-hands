<script setup>
defineProps({
  filter: Object,
});
</script>

<template>
  <span :class="['filter-chip', { active: filter.active }]">
    {{ filter.label }}
  </span>
</template>

<style scoped>
.filter-chip {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.filter-chip.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}
</style>
