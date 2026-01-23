<script setup>
defineProps({
  label: Object,
});
</script>

<template>
  <span
    class="card-label"
    :style="{
      color: label.color,
      background: label.color + '18',
    }"
  >
    {{ label.text }}
  </span>
</template>

<style scoped>
.card-label {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
}
</style>
