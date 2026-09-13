<script setup>
import { Search } from '@lucide/vue'
import DsIcon from './DsIcon.vue'

defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색' },
})

defineEmits(['update:modelValue', 'submit'])
</script>

<template>
  <form class="ds-search" role="search" @submit.prevent="$emit('submit')">
    <DsIcon :is="Search" :size="18" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      type="search"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </form>
</template>

<style scoped>
.ds-search {
  align-items: center;
  background: var(--ds-surface-sunken);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text-secondary);
  display: flex;
  gap: var(--ds-space-2);
  height: var(--ds-control-h);
  max-width: 496px;
  padding: 0 var(--ds-space-3);
  width: 100%;
}

.ds-search:focus-within {
  border-color: var(--ds-primary);
  border-width: 2px;
  padding: 0 calc(var(--ds-space-3) - 1px);
}

.ds-search input {
  background: transparent;
  border: 0;
  color: var(--ds-text);
  flex: 1;
  font-size: var(--ds-font-label);
  height: 100%;
  min-width: 0;
  outline: none;
}

.ds-search input::placeholder {
  color: var(--ds-text-tertiary);
}
</style>
