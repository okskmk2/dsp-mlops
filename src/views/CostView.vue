<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsBars from '../components/charts/DsBars.vue'
import DsDonut from '../components/charts/DsDonut.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { platformType } from '../data/labels'
import { chartColor } from '../lib/chart'
import { formatPct, formatWon } from '../lib/format'
import { canSeeOrgCostFull } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const router = useRouter()
const groupBy = ref('team')

const projects = computed(() => dsp.visibleProjects())
const records = computed(() => {
  const ids = new Set(projects.value.map((p) => p.id))
  return dsp.costRecords.filter((c) => ids.has(c.projectId))
})

const rank = computed(() => {
  const map = {}
  if (groupBy.value === 'platform') {
    for (const r of records.value) map[r.platform] = (map[r.platform] || 0) + r.amount
    const items = Object.entries(map)
      .map(([id, amount]) => ({
        id,
        label: platformType[id],
        amount,
        budget: 0,
      }))
      .sort((a, b) => b.amount - a.amount)
    const max = items[0]?.amount || 1
    return items.map((i, idx) => ({
      ...i,
      pct: Math.round((i.amount / max) * 100),
      valueLabel: formatWon(i.amount),
      color: chartColor(idx),
    }))
  }
  for (const r of records.value) map[r.projectId] = (map[r.projectId] || 0) + r.amount
  const items = Object.entries(map)
    .map(([id, amount]) => ({
      id,
      label: dsp.projectById(id)?.name || id,
      amount,
      budget: dsp.projectById(id)?.budgetAmount || 0,
    }))
    .sort((a, b) => b.amount - a.amount)
  const max = items[0]?.amount || 1
  return items.map((i, idx) => ({
    ...i,
    pct: Math.round((i.amount / max) * 100),
    valueLabel: formatWon(i.amount),
    color: i.budget && i.amount > i.budget ? 'var(--ds-danger)' : chartColor(idx),
  }))
})

const platformShare = computed(() => {
  const map = {}
  for (const r of records.value) map[r.platform] = (map[r.platform] || 0) + r.amount
  return Object.entries(map).map(([k, v]) => ({
    label: platformType[k],
    value: v,
    valueLabel: formatWon(v),
  }))
})

const idleHint = computed(() => rank.value.find((r) => r.amount < (r.budget || 1) * 0.1))

function exportCsv() {
  const header = 'project,platform,period,amount\n'
  const body = records.value
    .map((r) => `${dsp.projectById(r.projectId)?.name},${r.platform},${r.period},${r.amount}`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'dsp-cost.csv'
  a.click()
}

const columns = computed(() => [
  { key: 'label', label: groupBy.value === 'platform' ? '플랫폼' : '프로젝트', strong: true },
  { key: 'amount', label: '실적', numeric: true },
  { key: 'budget', label: '예산', numeric: true },
  { key: 'used', label: '사용률', numeric: true },
])
</script>

<template>
  <DsPageHeader
    title="비용·활용"
    :description="canSeeOrgCostFull(auth.user) ? '전사 프로젝트 비용입니다.' : '소속 프로젝트 합산입니다.'"
  >
    <template #actions>
      <DsSelect
        v-model="groupBy"
        :options="[
          { value: 'team', label: '프로젝트별' },
          { value: 'platform', label: '플랫폼별' },
        ]"
        placeholder=""
        width="sm"
      />
      <DsButton variant="secondary" @click="exportCsv">CSV</DsButton>
    </template>
  </DsPageHeader>

  <p v-if="idleHint" class="ds-meta ds-mb-section">
    유휴 힌트: {{ idleHint.label }} 실적이 예산의 10% 미만입니다.
  </p>

  <div class="grid">
    <DsCard>
      <template #title>비용 순위</template>
      <DsBars :items="rank" />
    </DsCard>
    <DsCard>
      <template #title>플랫폼 비중</template>
      <DsDonut
        :segments="platformShare"
        :center="formatWon(platformShare.reduce((s, x) => s + x.value, 0))"
        label="합계"
      />
    </DsCard>
  </div>

  <DsCard class="ds-follow">
    <template #title>예산 대비 실적</template>
    <DsTable
      :columns="columns"
      :rows="rank"
      @row-click="(r) => groupBy === 'team' && router.push(`/projects/${r.id}/cost`)"
    >
      <template #amount="{ row }">{{ formatWon(row.amount) }}</template>
      <template #budget="{ row }">{{ formatWon(row.budget) }}</template>
      <template #used="{ row }">{{ row.budget ? formatPct((row.amount / row.budget) * 100, 1) : '—' }}</template>
    </DsTable>
  </DsCard>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: 1.4fr 1fr;
}
</style>
