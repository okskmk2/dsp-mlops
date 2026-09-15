<script setup>
import { useRoute } from 'vue-router'

const props = defineProps({
  projectId: { type: String, required: true },
})

const route = useRoute()
const items = [
  { id: 'overview', label: '대시보드', suffix: '' },
  { id: 'info', label: '기본정보', suffix: '/info' },
  { id: 'team', label: '구성원', suffix: '/team' },
  { id: 'resources', label: '리소스', suffix: '/resources' },
  { id: 'projectModels', label: '모델현황', suffix: '/models' },
  { id: 'monitoring', label: '모니터링', suffix: '/monitoring' },
]

function to(item) {
  return `/projects/${props.projectId}${item.suffix}`
}

function active(item) {
  return route.path === to(item)
}
</script>

<template>
  <nav class="sub" aria-label="프로젝트 섹션">
    <RouterLink
      v-for="item in items"
      :key="item.id"
      class="tab"
      :class="{ 'is-active': active(item) }"
      :to="to(item)"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.sub {
  border-bottom: 1px solid var(--ds-border-subtle);
  display: flex;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-space-5);
}

.tab {
  border-bottom: 2px solid transparent;
  color: var(--ds-text-secondary);
  font-size: var(--ds-font-label);
  font-weight: 600;
  height: 36px;
  padding: 0 var(--ds-space-3);
}

.tab:hover {
  color: var(--ds-text);
}

.tab.is-active {
  border-bottom-color: var(--ds-primary);
  color: var(--ds-text);
}
</style>
