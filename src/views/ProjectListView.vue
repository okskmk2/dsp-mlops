<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
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

const rows = computed(() => {
  let list = dsp.visibleProjects()
  if (mineVsAll.value === 'mine') {
    const ids = new Set(dsp.members.filter((m) => m.userId === auth.user.id).map((m) => m.projectId))
    list = list.filter((p) => ids.has(p.id))
  }
  if (status.value) list = list.filter((p) => p.status === status.value)
  if (platform.value) list = list.filter((p) => p.platforms.includes(platform.value))
  return list.filter((p) => (status.value === 'closed' ? true : p.status !== 'closed' || status.value === 'closed'))
})

const columns = [
  { key: 'name', label: '프로젝트', strong: true },
  { key: 'owner', label: '오너' },
  { key: 'platforms', label: '플랫폼' },
  { key: 'status', label: '상태' },
  { key: 'endAt', label: '기한' },
  { key: 'budgetUsedPct', label: '예산 사용', numeric: true },
  { key: 'championCount', label: 'Champion', numeric: true },
]

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
  </div>

  <DsTable :columns="columns" :rows="rows" @row-click="open">
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

<style scoped>
.filters {
  display: flex;
  gap: var(--ds-space-3);
  margin-bottom: var(--ds-space-4);
}
</style>
