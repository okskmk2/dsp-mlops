<script setup>
import { computed } from 'vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import { platformType } from '../data/labels'
import { formatWon } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const rows = computed(() => {
  const ids = new Set(dsp.visibleProjects().map((p) => p.id))
  const map = {}
  for (const r of dsp.costRecords.filter((c) => ids.has(c.projectId))) {
    const key = `${r.resourceId}|${r.platform}`
    if (!map[key]) {
      map[key] = {
        id: key,
        resourceId: r.resourceId,
        platform: r.platform,
        projectId: r.projectId,
        amount: 0,
      }
    }
    map[key].amount += r.amount
  }
  return Object.values(map).sort((a, b) => b.amount - a.amount)
})
</script>

<template>
  <DsPageHeader title="리소스별 비용" description="클라우드 리소스 단위 집계입니다." />
  <DsTable
    :columns="[
      { key: 'resourceId', label: '리소스', strong: true },
      { key: 'platform', label: '플랫폼' },
      { key: 'project', label: '프로젝트' },
      { key: 'amount', label: '금액', numeric: true },
    ]"
    :rows="rows"
  >
    <template #platform="{ row }">{{ platformType[row.platform] }}</template>
    <template #project="{ row }">{{ dsp.projectById(row.projectId)?.name }}</template>
    <template #amount="{ row }">{{ formatWon(row.amount) }}</template>
  </DsTable>
</template>
