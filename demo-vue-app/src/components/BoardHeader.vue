<script setup>
import FilterChip from './FilterChip.vue';
import { filters } from '../data/boardData';
</script>

<template>
  <div class="board-header">
    <h2 class="board-title">Website Redesign</h2>
    <div class="filters">
      <FilterChip
        v-for="f in filters"
        :key="f.id"
        :filter="f"
      />
    </div>
  </div>
</template>

<style scoped>
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.board-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filters {
  display: flex;
  gap: 8px;
}
</style>
