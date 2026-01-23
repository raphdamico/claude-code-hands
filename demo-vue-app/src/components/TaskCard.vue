<script setup>
import CardLabel from './CardLabel.vue';
import Checklist from './Checklist.vue';
import CardFooter from './CardFooter.vue';

defineProps({
  card: Object,
});
</script>

<template>
  <div class="task-card">
    <div class="labels">
      <CardLabel
        v-for="label in card.labels"
        :key="label.id"
        :label="label"
      />
    </div>
    <div class="card-title">{{ card.title }}</div>
    <Checklist :checklist="card.checklist" />
    <CardFooter :assignees="card.assignees" :due-date="card.dueDate" />
  </div>
</template>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: 10px;
}

.labels {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.card-title {
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}
</style>
