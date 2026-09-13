<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <nav class="ds-crumb" aria-label="경로">
    <template v-for="(item, i) in items" :key="item.label">
      <span v-if="i > 0" class="sep">/</span>
      <RouterLink v-if="item.to && i < items.length - 1" class="link" :to="item.to">
        {{ item.label }}
      </RouterLink>
      <span v-else class="current">{{ item.label }}</span>
    </template>
  </nav>
</template>

<style scoped>
.ds-crumb {
  align-items: center;
  color: var(--ds-text-secondary);
  display: flex;
  flex-wrap: wrap;
  font-size: var(--ds-font-meta);
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-space-3);
}

.sep {
  color: var(--ds-text-tertiary);
}

.link {
  color: var(--ds-text-secondary);
}

.link:hover {
  color: var(--ds-link-hover);
}

.current {
  color: var(--ds-text);
  font-weight: 600;
}
</style>
