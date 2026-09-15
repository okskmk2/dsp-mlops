<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import { platformType, projectStatus, projectStatusChip, provisionRollup, provisionStatusChip } from '../data/labels'
import { formatWon } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const projects = computed(() => dsp.visibleProjects())
const rows = computed(() => projects.value.map((project) => {
  const resources = dsp.provisions.filter((item) => item.projectId === project.id)
  return {
    ...project,
    resourceCount: resources.length,
    resourceStatus: dsp.provisionRollup(project.id),
    modelCount: dsp.models.filter((model) => model.projectId === project.id).length,
    amount: dsp.spentOf(project.id),
  }
}))
const columns = [
  { key: 'name', label: '프로젝트', strong: true },
  { key: 'platforms', label: '플랫폼' },
  { key: 'status', label: '프로젝트 상태' },
  { key: 'resourceStatus', label: '리소스 상태' },
  { key: 'resourceCount', label: '리소스', numeric: true },
  { key: 'modelCount', label: '모델', numeric: true },
  { key: 'amount', label: '누적 비용', numeric: true },
]
</script>

<template>
  <div>
    <DsPageHeader title="ML운영" description="내가 속한 프로젝트의 리소스와 비용을 확인합니다." />
    <DsTable :columns="columns" :rows="rows" empty-title="운영 중인 프로젝트가 없습니다" @row-click="(r) => router.push(`/projects/${r.id}/resources`)">
      <template #platforms="{ row }">{{ row.platforms.map((platform) => platformType[platform]).join(', ') }}</template>
      <template #status="{ row }"><DsChip :tone="projectStatusChip[row.status]">{{ projectStatus[row.status] }}</DsChip></template>
      <template #resourceStatus="{ row }"><DsChip :tone="provisionStatusChip[row.resourceStatus === 'succeeded' ? 'succeeded' : row.resourceStatus === 'failed' ? 'failed' : row.resourceStatus === 'in_progress' ? 'running' : 'queued']">{{ provisionRollup[row.resourceStatus] }}</DsChip></template>
      <template #amount="{ row }">{{ formatWon(row.amount) }}</template>
    </DsTable>
  </div>
</template>

<style scoped>
.ds-table-wrap { margin-top: var(--ds-space-4); }
</style>
