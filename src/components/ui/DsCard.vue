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
  --ds-card-pad: 0px;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
}

.is-pad {
  --ds-card-pad: var(--ds-space-5);
  padding: var(--ds-card-pad);
}

.ds-card :deep(.ds-table-wrap) {
  border-left: 0;
  border-radius: 0;
  border-right: 0;
  margin-inline: calc(-1 * var(--ds-card-pad));
}

.ds-card :deep(.ds-table-wrap:last-child) {
  border-bottom: 0;
  margin-bottom: calc(-1 * var(--ds-card-pad));
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

.ds-card-action :deep(.ds-btn) {
  min-height: var(--ds-control-h-sm);
  padding: 0 var(--ds-space-2);
}
</style>
