<script setup>
import DsIcon from './DsIcon.vue'

defineProps({
  icon: { type: [Object, Function], required: true },
  label: { type: String, required: true },
  disabled: Boolean,
})
</script>

<template>
  <button class="ds-icon-btn" type="button" :aria-label="label" :disabled="disabled">
    <DsIcon :is="icon" :size="18" />
  </button>
</template>

<style scoped>
.ds-icon-btn {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  display: inline-flex;
  height: 36px;
  justify-content: center;
  transition: background-color var(--ds-duration) var(--ds-easing);
  width: 36px;
}

.ds-icon-btn:hover {
  background: var(--ds-canvas-subtle);
}

.ds-icon-btn:disabled {
  color: var(--ds-text-disabled);
  pointer-events: none;
}
</style>
