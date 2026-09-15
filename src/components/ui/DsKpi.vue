<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: '' },
  alert: Boolean,
  to: { type: [String, Object], default: '' },
})
</script>

<template>
  <component :is="to ? 'RouterLink' : 'article'" class="ds-kpi" :class="{ 'is-link': to }" :to="to || undefined">
    <p class="ds-meta">{{ label }}</p>
    <p class="ds-title-lg tabular" :class="{ 'is-alert': alert }">{{ value }}</p>
    <p v-if="hint" class="ds-meta">{{ hint }}</p>
  </component>
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

.ds-kpi.is-link {
  color: inherit;
  text-decoration: none;
}

.ds-kpi.is-link:hover {
  border-color: var(--ds-text-secondary);
}

.is-alert {
  color: var(--ds-danger);
}
</style>
