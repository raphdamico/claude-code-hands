<script setup>
import BoardHeader from './BoardHeader.vue';
import Column from './Column.vue';
import { columns } from '../data/boardData';
</script>

<template>
  <div class="board-view">
    <BoardHeader />
    <div class="columns">
      <Column
        v-for="col in columns"
        :key="col.id"
        :column="col"
      />
    </div>
  </div>
</template>

<style scoped>
.board-view {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.columns {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
</style>
