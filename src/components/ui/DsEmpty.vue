<script setup>
defineProps({
  title: { type: String, default: '표시할 항목이 없습니다' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="ds-empty">
    <p class="ds-body-strong">{{ title }}</p>
    <p v-if="description" class="ds-meta">{{ description }}</p>
    <div v-if="$slots.default" class="ds-empty-action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-empty {
  align-items: center;
  color: var(--ds-text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  justify-content: center;
  padding: var(--ds-space-10) var(--ds-space-6);
  text-align: center;
}

.ds-empty-action {
  margin-top: var(--ds-space-3);
}
</style>
