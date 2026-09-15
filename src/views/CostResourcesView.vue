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

const projectGroups = computed(() => dsp.visibleProjects().map((project) => ({
  project,
  rows: rows.value.filter((row) => row.projectId === project.id),
})).filter((group) => group.rows.length))
</script>

<template>
  <DsPageHeader title="리소스별 비용" description="클라우드 리소스 단위 집계입니다." />
  <section v-for="group in projectGroups" :key="group.project.id" class="project-group">
    <header class="project-header"><div><h2>{{ group.project.name }}</h2><span>{{ group.project.status === 'active' ? '운영중' : group.project.status }}</span></div><strong>{{ group.rows.length }}개 리소스</strong></header>
    <DsTable
      :columns="[
        { key: 'resourceId', label: '리소스', strong: true },
        { key: 'platform', label: '플랫폼' },
        { key: 'amount', label: '금액', numeric: true },
      ]"
      :rows="group.rows"
    >
      <template #platform="{ row }">{{ platformType[row.platform] }}</template>
      <template #amount="{ row }">{{ formatWon(row.amount) }}</template>
    </DsTable>
  </section>
  <p v-if="!projectGroups.length" class="empty">표시할 리소스 비용이 없습니다.</p>
</template>

<style scoped>
.project-group { border-top: 1px solid var(--ds-border); margin-bottom: var(--ds-section-gap); padding-top: var(--ds-space-4); }
.project-header { align-items: baseline; display: flex; justify-content: space-between; margin-bottom: var(--ds-space-3); }
.project-header div { align-items: baseline; display: flex; gap: var(--ds-space-3); }
.project-header h2 { font-size: var(--ds-font-title-sm); margin: 0; }
.project-header span, .project-header strong, .empty { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); font-weight: 400; }
.empty { border-top: 1px solid var(--ds-border); margin: 0; padding: var(--ds-space-5) 0; }
</style>
