<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSearch from '../components/ui/DsSearch.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import {
  guideCategory,
  noticeSeverity,
  noticeSeverityChip,
  postStatus,
  postStatusChip,
} from '../data/labels'
import { formatDateTime } from '../lib/format'
import { canManageSupport } from '../lib/permissions'
import { boardMeta, postPath } from '../lib/support'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dsp = useDspStore()
const q = ref('')
const filter = ref('')

const board = computed(() => (route.meta.board === 'notice' ? 'notice' : 'guide'))
const meta = computed(() => boardMeta(board.value))
const isAdmin = computed(() => canManageSupport(auth.user))

const categoryOptions = Object.entries(guideCategory).map(([value, label]) => ({ value, label }))
const severityOptions = Object.entries(noticeSeverity).map(([value, label]) => ({ value, label }))

const rows = computed(() => {
  let list = dsp.visibleSupportPosts(board.value)
  if (filter.value) {
    list = list.filter((p) => (board.value === 'guide' ? p.category === filter.value : p.severity === filter.value))
  }
  const needle = q.value.trim().toLowerCase()
  if (needle) list = list.filter((p) => `${p.title} ${p.body}`.toLowerCase().includes(needle))
  return list
})

const columns = computed(() => {
  if (board.value === 'notice') {
    return [
      { key: 'title', label: '제목', strong: true },
      { key: 'severity', label: '중요도' },
      { key: 'publishedAt', label: '게시' },
      { key: 'author', label: '작성' },
      { key: 'status', label: '상태' },
    ]
  }
  return [
    { key: 'title', label: '제목', strong: true },
    { key: 'category', label: '분류' },
    { key: 'updatedAt', label: '수정' },
    { key: 'author', label: '작성' },
    { key: 'status', label: '상태' },
  ]
})
</script>

<template>
  <DsPageHeader :title="meta.label" :description="meta.description">
    <template #actions>
      <DsButton v-if="isAdmin" variant="primary" :to="`${meta.listPath}/new`">글쓰기</DsButton>
    </template>
  </DsPageHeader>

  <div class="filters">
    <DsSearch v-model="q" :placeholder="board === 'notice' ? '공지 검색' : '사용법 검색'" />
    <DsSelect
      v-if="board === 'guide'"
      v-model="filter"
      :options="categoryOptions"
      placeholder="분류 전체"
      width="sm"
    />
    <DsSelect
      v-else
      v-model="filter"
      :options="severityOptions"
      placeholder="중요도 전체"
      width="sm"
    />
  </div>

  <DsTable :columns="columns" :rows="rows" @row-click="(row) => router.push(postPath(row))">
    <template #title="{ row }">
      <span v-if="row.pinned" class="pin">고정</span>
      {{ row.title }}
    </template>
    <template #category="{ row }">{{ guideCategory[row.category] || '—' }}</template>
    <template #severity="{ row }">
      <DsChip :tone="noticeSeverityChip[row.severity]">{{ noticeSeverity[row.severity] }}</DsChip>
    </template>
    <template #updatedAt="{ row }">{{ formatDateTime(row.updatedAt) }}</template>
    <template #publishedAt="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
    <template #author="{ row }">{{ dsp.userById(row.authorId)?.name }}</template>
    <template #status="{ row }">
      <DsChip :tone="postStatusChip[row.status]">{{ postStatus[row.status] }}</DsChip>
    </template>
  </DsTable>
</template>

<style scoped>
.filters {
  display: flex;
  gap: var(--ds-space-3);
  margin-bottom: var(--ds-space-4);
}

.pin {
  color: var(--ds-primary);
  font-size: var(--ds-font-meta);
  font-weight: 600;
  margin-right: var(--ds-space-2);
}
</style>
