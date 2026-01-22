<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'outline'
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<template>
  <button
    :class="['btn', `btn-${variant}`, `btn-${size}`]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Sizes */
.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-medium {
  padding: 7px 14px;
  font-size: 13px;
}

.btn-large {
  padding: 10px 20px;
  font-size: 14px;
}

/* Variants */
.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd6;
}

.btn-secondary {
  background: #374151;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #4b5563;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}
</style>
