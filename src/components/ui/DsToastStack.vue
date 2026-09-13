<script setup>
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="ds-toasts" aria-live="polite">
    <div v-for="t in ui.toasts" :key="t.id" class="ds-toast" :class="`is-${t.tone}`">
      {{ t.message }}
    </div>
  </div>
</template>

<style scoped>
.ds-toasts {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  left: 50%;
  margin-left: -214px;
  position: fixed;
  top: var(--ds-space-4);
  width: 428px;
  z-index: var(--ds-z-toast);
}

.ds-toast {
  background: var(--ds-surface-raised);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-font-label);
  padding: var(--ds-space-4);
  transition: opacity var(--ds-duration-fast) var(--ds-easing);
}

.ds-toast.is-danger {
  border-color: var(--ds-danger);
  background: var(--ds-danger-subtle);
}

.ds-toast.is-warning {
  border-color: var(--ds-warning);
  background: var(--ds-warning-subtle);
}

.ds-toast.is-success {
  border-color: var(--ds-success);
  background: var(--ds-success-subtle);
}
</style>
