<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '📦'
  },
  value: {
    type: [String, Number],
    default: ''
  },
  trend: {
    type: String,
    default: 'neutral', // 'up', 'down', 'neutral'
  },
  trendValue: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="card">
    <div class="card-body">
      <div class="card-value">{{ value }}</div>
      <div v-if="trendValue" :class="['card-trend', trend]">
        <span class="trend-icon">
          {{ trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→' }}
        </span>
        {{ trendValue }}
      </div>
    </div>
    <div class="card-header">
      <span class="card-icon">{{ icon }}</span>
      <span class="card-title">{{ title }}</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  transition: border-color 0.15s;
}

.card:hover {
  border-color: #d1d5db;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.card-icon {
  font-size: 13px;
}

.card-title {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.card-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}

.card-value {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: -0.5px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-trend.up {
  background: #ecfdf5;
  color: #059669;
}

.card-trend.down {
  background: #fef2f2;
  color: #dc2626;
}

.card-trend.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.trend-icon {
  font-weight: 700;
}
</style>
