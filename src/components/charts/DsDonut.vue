<script setup>
import { computed } from 'vue'
import { CHART_SERIES } from '../../lib/chart'

const props = defineProps({
  segments: { type: Array, required: true },
  center: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
})

const colors = CHART_SERIES
const r = 54
const c = 2 * Math.PI * r

const rings = computed(() => {
  const total = props.segments.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0
  return props.segments.map((seg, i) => {
    const len = (seg.value / total) * c
    const item = {
      ...seg,
      color: seg.color || colors[i % colors.length],
      dash: `${len} ${c - len}`,
      offset,
    }
    offset -= len
    return item
  })
})
</script>

<template>
  <div class="donut">
    <svg viewBox="0 0 140 140" width="160" height="160" aria-hidden="true">
      <circle cx="70" cy="70" :r="r" fill="none" stroke="var(--ds-chart-grid)" stroke-width="16" />
      <circle
        v-for="(seg, i) in rings"
        :key="i"
        cx="70"
        cy="70"
        :r="r"
        fill="none"
        :stroke="seg.color"
        stroke-width="16"
        :stroke-dasharray="seg.dash"
        :stroke-dashoffset="seg.offset"
        transform="rotate(-90 70 70)"
      />
    </svg>
    <div class="center">
      <p class="ds-title-lg tabular">{{ center }}</p>
      <p v-if="label" class="ds-meta">{{ label }}</p>
    </div>
  </div>
  <ul class="legend">
    <li v-for="(seg, i) in rings" :key="i">
      <span class="swatch" :style="{ background: seg.color }" />
      <span>{{ seg.label }}</span>
      <span class="tabular">{{ seg.valueLabel || seg.value }}</span>
    </li>
  </ul>
</template>

<style scoped>
.donut {
  display: grid;
  justify-items: center;
  place-items: center;
}

.donut svg,
.center {
  grid-area: 1 / 1;
}

.center {
  pointer-events: none;
  text-align: center;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  margin-top: var(--ds-space-4);
}

.legend li {
  align-items: center;
  display: grid;
  font-size: var(--ds-font-meta);
  gap: var(--ds-space-2);
  grid-template-columns: 12px 1fr auto;
}

.swatch {
  height: 12px;
  width: 12px;
}
</style>
