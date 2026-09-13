<script setup>
defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <ul class="bars">
    <li v-for="item in items" :key="item.label">
      <div class="row">
        <span class="ds-body-strong">{{ item.label }}</span>
        <span class="ds-meta tabular">{{ item.valueLabel }}</span>
      </div>
      <div class="track" aria-hidden="true">
        <div class="fill" :style="{ width: `${item.pct}%`, background: item.color || 'var(--ds-chart-1)' }" />
      </div>
    </li>
  </ul>
</template>

<style scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-4);
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--ds-space-1);
}

.track {
  background: var(--ds-surface-sunken);
  border: 1px solid var(--ds-border-subtle);
  height: 0.6667rem;
}

.fill {
  height: 100%;
}
</style>
