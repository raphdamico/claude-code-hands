<script setup>
import ColumnHeader from './ColumnHeader.vue';
import TaskCard from './TaskCard.vue';

defineProps({
  column: Object,
});
</script>

<template>
  <div class="column">
    <ColumnHeader :title="column.title" :count="column.cards.length" />
    <TaskCard
      v-for="card in column.cards"
      :key="card.id"
      :card="card"
    />
  </div>
</template>

<style scoped>
.column {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px;
  min-width: 280px;
  max-width: 300px;
  flex: 1;
}
</style>
