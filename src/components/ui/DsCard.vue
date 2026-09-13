<script setup>
defineProps({
  padding: { type: Boolean, default: true },
})
</script>

<template>
  <section class="ds-card" :class="{ 'is-pad': padding }">
    <header v-if="$slots.title || $slots.action" class="ds-card-head">
      <h2 v-if="$slots.title" class="ds-title-sm"><slot name="title" /></h2>
      <div v-if="$slots.action" class="ds-card-action"><slot name="action" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.ds-card {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
}

.is-pad {
  padding: var(--ds-space-6);
}

.ds-card-head {
  align-items: center;
  display: flex;
  gap: var(--ds-space-4);
  justify-content: space-between;
}

.ds-card-action {
  align-items: center;
  display: flex;
  gap: var(--ds-space-2);
}
</style>
