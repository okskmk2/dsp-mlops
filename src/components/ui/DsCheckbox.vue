<script setup>
import { Check } from '@lucide/vue'
import DsIcon from './DsIcon.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: Boolean,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="ds-check" :class="{ 'is-disabled': disabled }">
    <input
      class="sr"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="box" :class="{ 'is-on': modelValue }">
      <DsIcon v-if="modelValue" :is="Check" :size="14" />
    </span>
    <span class="check-label">{{ label }}<slot /></span>
  </label>
</template>

<style scoped>
.ds-check {
  align-items: center;
  cursor: pointer;
  display: inline-flex;
  gap: var(--ds-space-2);
  min-height: 36px;
}

.sr {
  height: 1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
  clip: rect(0 0 0 0);
}

.box {
  align-items: center;
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-sm);
  color: var(--ds-on-primary);
  display: inline-flex;
  height: 18px;
  justify-content: center;
  width: 18px;
}

.box.is-on {
  background: var(--ds-primary);
  border-color: var(--ds-primary);
}

.check-label {
  font-size: var(--ds-font-label);
  font-weight: 400;
  line-height: 1.3;
}

.is-disabled {
  color: var(--ds-text-disabled);
  pointer-events: none;
}
</style>
