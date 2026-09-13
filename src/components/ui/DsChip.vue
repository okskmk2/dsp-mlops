<script setup>
defineProps({
  tone: { type: String, default: 'neutral' },
})
</script>

<template>
  <span class="ds-chip" :class="`is-${tone}`">
    <slot />
  </span>
</template>

<style scoped>
.ds-chip {
  align-items: center;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  display: inline-flex;
  font-size: var(--ds-font-meta);
  font-weight: 400;
  height: 24px;
  line-height: 1.35;
  padding: 0 8px;
  white-space: nowrap;
}

.is-neutral {
  background: var(--ds-neutral-subtle);
  border-color: var(--ds-border);
  color: var(--ds-text);
}

.is-info {
  background: var(--ds-info-subtle);
  border-color: var(--ds-border);
  color: var(--ds-text);
}

.is-success {
  background: var(--ds-success-subtle);
  border-color: var(--ds-success);
  color: var(--ds-success);
}

.is-warning {
  background: var(--ds-warning-subtle);
  border-color: var(--ds-warning);
  color: var(--ds-warning);
}

.is-danger {
  background: var(--ds-danger-subtle);
  border-color: var(--ds-danger);
  color: var(--ds-danger);
}
</style>
