<script setup>
defineProps({
  item: Object,
});
</script>

<template>
  <div class="checklist-item">
    <input
      type="checkbox"
      :checked="item.done"
      class="checkbox"
      readonly
    />
    <span :class="['item-text', { done: item.done }]">
      {{ item.text }}
    </span>
  </div>
</template>

<style scoped>
.checklist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.checkbox {
  width: 14px;
  height: 14px;
  accent-color: #6366f1;
  cursor: pointer;
}

.item-text {
  font-size: 12px;
  color: #374151;
}

.item-text.done {
  color: #9ca3af;
  text-decoration: line-through;
}
</style>
