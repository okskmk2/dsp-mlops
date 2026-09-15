<script setup>
import { useRoute } from 'vue-router'

const props = defineProps({ modelId: { type: String, required: true } })
const route = useRoute()
const items = [
  { label: '모델 기본정보', suffix: '' },
  { label: '데이터 계보', suffix: '/lineage' },
  { label: '이해 관계자', suffix: '/stakeholders' },
  { label: '이력', suffix: '/history' },
]
function to(item) { return `/models/${props.modelId}${item.suffix}` }
function active(item) { return route.path === to(item) }
</script>

<template>
  <nav class="sub" aria-label="모델 섹션">
    <RouterLink v-for="item in items" :key="item.label" class="tab" :class="{ 'is-active': active(item) }" :to="to(item)">{{ item.label }}</RouterLink>
  </nav>
</template>

<style scoped>
.sub { border-bottom: 1px solid var(--ds-border-subtle); display: flex; gap: var(--ds-space-2); margin-bottom: var(--ds-space-5); }
.tab { border-bottom: 2px solid transparent; color: var(--ds-text-secondary); font-size: var(--ds-font-label); font-weight: 600; height: 36px; padding: 0 var(--ds-space-3); }
.tab:hover, .tab.is-active { color: var(--ds-text); }
.tab.is-active { border-bottom-color: var(--ds-primary); }
</style>
