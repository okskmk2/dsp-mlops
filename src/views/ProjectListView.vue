<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { platformType, projectStatus, projectStatusChip } from '../data/labels'
import { formatDate, formatPct } from '../lib/format'
import { canListAllProjects } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const router = useRouter()

const status = ref('')
const platform = ref('')
const mineVsAll = ref(canListAllProjects(auth.user) ? 'all' : 'mine')
const sortKey = ref('endAt')
const sortDir = ref('asc')

const hasNoProjectsAtAll = computed(() => dsp.visibleProjects().length === 0)

function resetFilters() {
  status.value = ''
  platform.value = ''
}

const filtered = computed(() => {
  let list = dsp.visibleProjects()
  if (mineVsAll.value === 'mine') {
    const ids = new Set(dsp.members.filter((m) => m.userId === auth.user.id).map((m) => m.projectId))
    list = list.filter((p) => ids.has(p.id))
  }
  if (status.value) list = list.filter((p) => p.status === status.value)
  if (platform.value) list = list.filter((p) => p.platforms.includes(platform.value))
  return list.filter((p) => (status.value === 'closed' ? true : p.status !== 'closed' || status.value === 'closed'))
})

function sortValue(row, key) {
  if (key === 'budgetUsedPct') return dsp.budgetUsedPct(row)
  if (key === 'championCount') return dsp.championCount(row.id)
  return row[key]
}

const rows = computed(() => {
  const list = [...filtered.value]
  const dir = sortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    const av = sortValue(a, sortKey.value)
    const bv = sortValue(b, sortKey.value)
    if (av === bv) return a.name < b.name ? -1 : 1
    return av < bv ? -dir : dir
  })
  return list
})

const columns = [
  { key: 'name', label: '프로젝트', strong: true, sortable: true },
  { key: 'owner', label: '오너' },
  { key: 'platforms', label: '플랫폼' },
  { key: 'status', label: '상태', sortable: true },
  { key: 'endAt', label: '기한', sortable: true },
  { key: 'budgetUsedPct', label: '예산 사용', numeric: true, sortable: true },
  { key: 'championCount', label: 'Champion', numeric: true, sortable: true },
]

function onSort({ key, dir }) {
  sortKey.value = key
  sortDir.value = dir
}

function isOverdueActive(row) {
  return row.status === 'active' && row.endAt && new Date(row.endAt) < new Date()
}

function rowClass(row) {
  if (row.status === 'closed') return 'is-dimmed'
  if (isOverdueActive(row) || dsp.budgetUsedPct(row) >= 100) return 'is-warn'
  return ''
}

function open(row) {
  if (row.status === 'draft') router.push({ path: '/projects/new', query: { draft: row.id } })
  else router.push(`/projects/${row.id}`)
}
</script>

<template>
  <DsPageHeader title="프로젝트" description="권한 범위 안의 운영 상태입니다. 상태 칩은 관리 수명주기이며 프로비저닝이 아닙니다.">
    <template #actions>
      <DsButton variant="primary" to="/projects/new">생성 신청</DsButton>
    </template>
  </DsPageHeader>

  <DsEmpty
    v-if="hasNoProjectsAtAll"
    title="아직 참여한 프로젝트가 없습니다"
    description="프로젝트 생성을 신청하거나 분석 요청으로 시작하세요."
  >
    <DsButton variant="primary" to="/projects/new">생성 신청</DsButton>
    <DsButton variant="secondary" to="/requests/new">분석 요청하기</DsButton>
  </DsEmpty>

  <template v-else>
    <div class="filters">
      <DsSelect
        v-model="status"
        :options="[
          { value: 'draft', label: '임시저장' },
          { value: 'pending_approval', label: '결재 대기' },
          { value: 'active', label: '운영중' },
          { value: 'closed', label: '종료' },
        ]"
        placeholder="상태 전체"
        width="sm"
      />
      <DsSelect
        v-model="platform"
        :options="[
          { value: 'azure_ml', label: 'Azure ML' },
          { value: 'azure_databricks', label: 'Azure Databricks' },
        ]"
        placeholder="플랫폼 전체"
      />
      <DsSelect
        v-if="canListAllProjects(auth.user)"
        v-model="mineVsAll"
        :options="[
          { value: 'all', label: '전체' },
          { value: 'mine', label: '내 프로젝트' },
        ]"
        placeholder=""
        width="sm"
      />
      <DsButton v-if="status || platform" variant="ghost" @click="resetFilters">필터 초기화</DsButton>
    </div>

    <DsTable
      :columns="columns"
      :rows="rows"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      :row-class="rowClass"
      empty-title="필터 조건에 맞는 프로젝트가 없습니다"
      @row-click="open"
      @sort="onSort"
    >
      <template #owner="{ row }">{{ dsp.userById(row.ownerUserId)?.name }}</template>
      <template #platforms="{ row }">
        {{ row.platforms.map((p) => platformType[p]).join(', ') }}
      </template>
      <template #status="{ row }">
        <DsChip :tone="projectStatusChip[row.status]">{{ projectStatus[row.status] }}</DsChip>
      </template>
      <template #endAt="{ row }">{{ formatDate(row.endAt) }}</template>
      <template #budgetUsedPct="{ row }">{{ formatPct(dsp.budgetUsedPct(row)) }}</template>
      <template #championCount="{ row }">{{ dsp.championCount(row.id) }}</template>
    </DsTable>
  </template>
</template>

<style scoped>
.filters {
  align-items: center;
  display: flex;
  gap: var(--ds-space-3);
  margin-bottom: var(--ds-space-4);
}
</style>
