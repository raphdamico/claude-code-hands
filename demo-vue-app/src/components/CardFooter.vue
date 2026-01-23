<script setup>
defineProps({
  assignees: Array,
  dueDate: String,
});
</script>

<template>
  <div class="card-footer">
    <div class="avatars">
      <div
        v-for="(a, i) in assignees"
        :key="i"
        class="avatar"
        :style="{
          background: a.color,
          marginLeft: i > 0 ? '-6px' : '0',
        }"
      >
        {{ a.initials }}
      </div>
    </div>
    <span class="due-date">{{ dueDate }}</span>
  </div>
</template>

<style scoped>
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.avatars {
  display: flex;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.due-date {
  font-size: 11px;
  color: #9ca3af;
}
</style>
