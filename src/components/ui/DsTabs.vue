<script setup>
defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="ds-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="ds-tab"
      :class="{ 'is-active': modelValue === tab.id }"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.id"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.ds-tabs {
  border-bottom: 1px solid var(--ds-border-subtle);
  display: flex;
  gap: var(--ds-space-2);
}

.ds-tab {
  border-bottom: 2px solid transparent;
  color: var(--ds-text-secondary);
  font-size: var(--ds-font-label);
  font-weight: 600;
  height: 2.4444rem;
  padding: 0 var(--ds-space-3);
}

.ds-tab.is-active {
  border-bottom-color: var(--ds-primary);
  color: var(--ds-text);
}
</style>
