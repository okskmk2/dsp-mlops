<script setup>
import { CircleAlert, Info, TriangleAlert } from '@lucide/vue'
import DsIcon from './DsIcon.vue'

const props = defineProps({
  tone: { type: String, default: 'info' },
})

const iconMap = {
  danger: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  success: Info,
}
</script>

<template>
  <div class="ds-banner" :class="`is-${tone}`" role="status">
    <DsIcon :is="iconMap[tone] || Info" :size="20" />
    <div class="ds-banner-body">
      <slot />
    </div>
    <div v-if="$slots.action" class="ds-banner-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.ds-banner {
  align-items: center;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  display: flex;
  font-size: var(--ds-font-label);
  gap: var(--ds-space-3);
  line-height: 1.4;
  padding: var(--ds-space-4);
}

.is-danger {
  background: var(--ds-danger-subtle);
  border-color: var(--ds-danger);
  color: var(--ds-text);
}

.is-warning {
  background: var(--ds-warning-subtle);
  border-color: var(--ds-warning);
}

.is-info {
  background: var(--ds-info-subtle);
  border-color: var(--ds-border);
}

.is-success {
  background: var(--ds-success-subtle);
  border-color: var(--ds-success);
}

.ds-banner-body {
  flex: 1;
}

.ds-banner-action {
  align-items: center;
  display: flex;
}

.ds-banner-action :deep(.ds-btn) {
  min-height: var(--ds-control-h-sm);
  padding: 0 var(--ds-space-2);
}
</style>
