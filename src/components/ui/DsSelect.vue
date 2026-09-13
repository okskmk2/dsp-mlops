<script setup>
import { ChevronDown } from '@lucide/vue'
import DsIcon from './DsIcon.vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  disabled: Boolean,
  invalid: Boolean,
  width: { type: String, default: 'md' },
  placeholder: { type: String, default: '선택' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <span class="ds-select-wrap" :class="`is-${width}`">
    <select
      class="ds-select"
      :class="{ 'is-invalid': invalid }"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <DsIcon class="chev" :is="ChevronDown" :size="18" />
  </span>
</template>

<style scoped>
.ds-select-wrap {
  display: inline-block;
  position: relative;
  width: 248px;
}

.ds-select-wrap.is-sm {
  width: 144px;
}

.ds-select-wrap.is-lg {
  width: 372px;
}

.ds-select-wrap.is-full {
  width: 100%;
}

.ds-select {
  appearance: none;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  font-size: var(--ds-font-label);
  height: var(--ds-control-h);
  padding: 0 32px 0 var(--ds-space-3);
  width: 100%;
}

.ds-select:focus {
  border-color: var(--ds-primary);
  border-width: 2px;
  outline: none;
}

.ds-select.is-invalid {
  border-color: var(--ds-danger);
  border-width: 2px;
}

.ds-select:disabled {
  background: var(--ds-surface-sunken);
  color: var(--ds-text-disabled);
}

.chev {
  color: var(--ds-text-secondary);
  pointer-events: none;
  position: absolute;
  right: 10px;
  top: 11px;
}
</style>
