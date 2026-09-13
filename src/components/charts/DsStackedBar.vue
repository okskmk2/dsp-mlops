<script setup>
import { computed } from 'vue'

const props = defineProps({
  series: { type: Array, required: true },
  labels: { type: Array, required: true },
})

const colors = ['var(--ds-chart-1)', 'var(--ds-chart-2)', 'var(--ds-chart-3)']
const max = computed(() => {
  const sums = props.labels.map((_, i) => props.series.reduce((s, ser) => s + (ser.values[i] || 0), 0))
  return Math.max(1, ...sums)
})
</script>

<template>
  <div class="stack">
    <div v-for="(lab, i) in labels" :key="lab" class="col">
      <div class="bar">
        <div
          v-for="(ser, si) in series"
          :key="ser.label"
          class="seg"
          :style="{
            height: `${((ser.values[i] || 0) / max) * 160}px`,
            background: ser.color || colors[si % colors.length],
          }"
          :title="`${ser.label}: ${ser.values[i]}`"
        />
      </div>
      <span class="ds-meta">{{ lab }}</span>
    </div>
  </div>
  <ul class="legend">
    <li v-for="(ser, i) in series" :key="ser.label">
      <span class="swatch" :style="{ background: ser.color || colors[i] }" />
      {{ ser.label }}
    </li>
  </ul>
</template>

<style scoped>
.stack {
  align-items: flex-end;
  display: flex;
  gap: var(--ds-space-4);
  height: 12.2222rem;
}

.col {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-space-2);
}

.bar {
  display: flex;
  flex-direction: column-reverse;
  height: 160px;
  width: 100%;
}

.seg {
  width: 100%;
}

.legend {
  display: flex;
  gap: var(--ds-space-4);
  margin-top: var(--ds-space-3);
}

.legend li {
  align-items: center;
  display: flex;
  font-size: var(--ds-font-meta);
  gap: var(--ds-space-2);
}

.swatch {
  height: 0.6667rem;
  width: 0.6667rem;
}
</style>
