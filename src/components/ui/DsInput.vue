<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  disabled: Boolean,
  invalid: Boolean,
  width: { type: String, default: 'md' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <input
    class="ds-input"
    :class="[`is-${width}`, { 'is-invalid': invalid }]"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<style scoped>
.ds-input {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  font-size: var(--ds-font-body);
  height: var(--ds-control-h);
  padding: 0 var(--ds-space-4);
  width: 15.5556rem;
}

.ds-input.is-sm {
  width: 8.8889rem;
}

.ds-input.is-lg {
  width: 23.3333rem;
}

.ds-input.is-full {
  width: 100%;
}

.ds-input::placeholder {
  color: var(--ds-text-tertiary);
}

.ds-input:focus {
  border-color: var(--ds-primary);
  border-width: 2px;
  outline: none;
  padding: 0 calc(var(--ds-space-4) - 1px);
}

.ds-input.is-invalid {
  border-color: var(--ds-danger);
  border-width: 2px;
  padding: 0 calc(var(--ds-space-4) - 1px);
}

.ds-input:disabled {
  background: var(--ds-surface-sunken);
  color: var(--ds-text-disabled);
}
</style>
