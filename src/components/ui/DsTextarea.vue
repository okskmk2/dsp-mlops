<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  disabled: Boolean,
  invalid: Boolean,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <textarea
    class="ds-textarea"
    :class="{ 'is-invalid': invalid }"
    :rows="rows"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<style scoped>
.ds-textarea {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  font-size: var(--ds-font-label);
  line-height: 1.45;
  min-height: 96px;
  padding: var(--ds-space-3) var(--ds-space-4);
  resize: vertical;
  width: 100%;
}

.ds-textarea::placeholder {
  color: var(--ds-text-tertiary);
}

.ds-textarea:focus {
  border-color: var(--ds-primary);
  border-width: 2px;
  outline: none;
}

.ds-textarea.is-invalid {
  border-color: var(--ds-danger);
  border-width: 2px;
}

.ds-textarea:disabled {
  background: var(--ds-surface-sunken);
  color: var(--ds-text-disabled);
}
</style>
