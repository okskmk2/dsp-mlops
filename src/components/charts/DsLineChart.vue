<script setup>
import { computed } from 'vue'
import { CHART_SERIES } from '../../lib/chart'

const props = defineProps({
  series: { type: Array, required: true },
  labels: { type: Array, required: true },
  threshold: { type: Number, default: null },
  height: { type: Number, default: 220 },
})

const colors = CHART_SERIES
const pad = { l: 36, r: 8, t: 12, b: 28 }

const bounds = computed(() => {
  const vals = props.series.flatMap((s) => s.values)
  if (props.threshold != null) vals.push(props.threshold)
  const max = Math.max(0.01, ...vals)
  return { min: 0, max: max * 1.1 }
})

function x(i) {
  const w = 640 - pad.l - pad.r
  return pad.l + (i / Math.max(1, props.labels.length - 1)) * w
}

function y(v) {
  const h = props.height - pad.t - pad.b
  return pad.t + (1 - (v - bounds.value.min) / (bounds.value.max - bounds.value.min)) * h
}

const polylines = computed(() =>
  props.series.map((s, i) => ({
    ...s,
    color: s.color || colors[i % colors.length],
    points: s.values.map((v, idx) => `${x(idx)},${y(v)}`).join(' '),
  })),
)

const thresholdY = computed(() => (props.threshold == null ? null : y(props.threshold)))
</script>

<template>
  <div>
    <svg :viewBox="`0 0 640 ${height}`" width="100%" :height="height" role="img">
      <line
        v-for="g in 4"
        :key="g"
        :x1="pad.l"
        :x2="640 - pad.r"
        :y1="pad.t + ((height - pad.t - pad.b) * g) / 4"
        :y2="pad.t + ((height - pad.t - pad.b) * g) / 4"
        stroke="var(--ds-chart-grid)"
        stroke-width="1"
      />
      <line
        v-if="thresholdY != null"
        :x1="pad.l"
        :x2="640 - pad.r"
        :y1="thresholdY"
        :y2="thresholdY"
        stroke="var(--ds-danger)"
        stroke-width="2"
      />
      <polyline
        v-for="s in polylines"
        :key="s.label"
        fill="none"
        :stroke="s.color"
        stroke-width="2"
        :points="s.points"
      />
      <text
        v-for="(lab, i) in labels"
        :key="lab"
        :x="x(i)"
        :y="height - 8"
        text-anchor="middle"
        fill="var(--ds-chart-axis)"
        font-size="12"
      >
        {{ lab }}
      </text>
    </svg>
    <ul class="legend">
      <li v-for="s in polylines" :key="s.label">
        <span class="swatch" :style="{ background: s.color }" />
        {{ s.label }}
      </li>
      <li v-if="threshold != null">
        <span class="swatch" style="background: var(--ds-danger)" />
        임계 {{ threshold }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
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
  height: 12px;
  width: 12px;
}
</style>
