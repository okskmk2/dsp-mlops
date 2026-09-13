<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <header class="ds-page-header">
    <div>
      <h1 class="ds-display">{{ title }}</h1>
      <p v-if="description" class="ds-meta">{{ description }}</p>
    </div>
    <div class="ds-page-actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.ds-page-header {
  align-items: flex-start;
  display: flex;
  gap: var(--ds-space-6);
  justify-content: space-between;
  margin-bottom: var(--ds-space-7);
}

.ds-display {
  margin-bottom: var(--ds-space-3);
}

.ds-page-actions {
  align-items: center;
  display: flex;
  gap: var(--ds-space-2);
}
</style>
