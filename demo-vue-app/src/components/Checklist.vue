<script setup>
import { computed } from 'vue';
import ChecklistItem from './ChecklistItem.vue';

const props = defineProps({
  checklist: Object,
});

const done = computed(() => props.checklist.items.filter(i => i.done).length);
const total = computed(() => props.checklist.items.length);
const pct = computed(() => Math.round((done.value / total.value) * 100));
</script>

<template>
  <div class="checklist">
    <div class="checklist-header">
      <span class="checklist-title">{{ checklist.title }}</span>
      <span class="checklist-count">{{ done }}/{{ total }}</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :class="{ complete: pct === 100 }"
        :style="{ width: pct + '%' }"
      />
    </div>
    <ChecklistItem
      v-for="item in checklist.items"
      :key="item.id"
      :item="item"
    />
  </div>
</template>

<style scoped>
.checklist {
  margin-top: 10px;
}

.checklist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.checklist-title {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.checklist-count {
  font-size: 11px;
  color: #9ca3af;
}

.progress-bar {
  height: 3px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-bottom: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #6366f1;
  border-radius: 2px;
  transition: width 0.2s;
}

.progress-fill.complete {
  background: #10b981;
}
</style>
