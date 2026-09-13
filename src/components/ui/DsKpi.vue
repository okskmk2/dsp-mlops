<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  alert: Boolean,
})
</script>

<template>
  <article class="ds-kpi">
    <p class="ds-meta">{{ label }}</p>
    <p class="ds-title-lg tabular" :class="{ 'is-alert': alert }">{{ value }}</p>
    <p v-if="hint" class="ds-meta">{{ hint }}</p>
  </article>
</template>

<style scoped>
.ds-kpi {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
  min-width: 0;
  padding: var(--ds-space-5);
}

.is-alert {
  color: var(--ds-danger);
}
</style>
