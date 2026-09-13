<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DsIcon from './DsIcon.vue'

const props = defineProps({
  variant: { type: String, default: 'secondary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: Boolean,
  loading: Boolean,
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  icon: { type: [Object, Function], default: null },
})

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'button'
})

const bind = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href, target: '_blank', rel: 'noreferrer' }
  return { type: props.type }
})
</script>

<template>
  <component
    :is="tag"
    class="ds-btn"
    :class="[`is-${variant}`, `is-${size}`, { 'is-disabled': disabled || loading }]"
    :disabled="!to && !href ? disabled || loading : undefined"
    :aria-disabled="disabled || loading ? 'true' : undefined"
    v-bind="bind"
  >
    <template v-if="loading">처리 중</template>
    <template v-else>
      <DsIcon v-if="icon" :is="icon" :size="18" />
      <slot />
    </template>
  </component>
</template>

<style scoped>
.ds-btn {
  align-items: center;
  align-self: flex-start;
  border-radius: var(--ds-radius-md);
  border-style: solid;
  border-width: 1px;
  display: inline-flex;
  flex: none;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  justify-content: center;
  line-height: 1.35;
  min-height: var(--ds-control-h);
  padding: 0 var(--ds-space-4);
  width: auto;
  transition:
    background-color var(--ds-duration) var(--ds-easing),
    border-color var(--ds-duration) var(--ds-easing),
    color var(--ds-duration) var(--ds-easing);
  white-space: nowrap;
}

.ds-btn.is-sm {
  min-height: var(--ds-control-h-sm);
  padding: 0 var(--ds-space-2);
}

.ds-btn.is-lg {
  min-height: var(--ds-control-h-lg);
  padding: 0 var(--ds-space-5);
}

.ds-btn.is-primary {
  background: var(--ds-primary);
  border-color: var(--ds-primary);
  color: var(--ds-on-primary);
}

.ds-btn.is-primary:hover {
  background: var(--ds-primary-hover);
  border-color: var(--ds-primary-hover);
  color: var(--ds-on-primary);
}

.ds-btn.is-primary:active {
  background: var(--ds-primary-active);
  border-color: var(--ds-primary-active);
}

.ds-btn.is-secondary {
  background: var(--ds-surface);
  border-color: var(--ds-border-strong);
  color: var(--ds-text);
}

.ds-btn.is-secondary:hover {
  background: var(--ds-canvas-subtle);
  color: var(--ds-text);
}

.ds-btn.is-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--ds-text);
}

.ds-btn.is-ghost:hover {
  background: var(--ds-canvas-subtle);
  color: var(--ds-text);
}

.ds-btn.is-danger {
  background: var(--ds-surface);
  border-color: var(--ds-danger);
  color: var(--ds-danger);
}

.ds-btn.is-danger:hover {
  background: var(--ds-danger-subtle);
  color: var(--ds-danger);
}

.ds-btn.is-dangerFilled {
  background: var(--ds-danger);
  border-color: var(--ds-danger);
  color: var(--ds-on-danger);
}

.ds-btn.is-dangerFilled:hover {
  background: var(--ds-primary-hover);
  border-color: var(--ds-primary-hover);
  color: var(--ds-on-danger);
}

.ds-btn.is-disabled {
  background: var(--ds-neutral-subtle);
  border-color: var(--ds-border);
  color: var(--ds-text-disabled);
  pointer-events: none;
}
</style>
