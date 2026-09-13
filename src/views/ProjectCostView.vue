<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DsDonut from '../components/charts/DsDonut.vue'
import DsStackedBar from '../components/charts/DsStackedBar.vue'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { platformType } from '../data/labels'
import { formatWon } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const dsp = useDspStore()
const project = computed(() => dsp.projectById(route.params.id))
const range = ref('all')

const records = computed(() => {
  const all = dsp.costRecords.filter((c) => c.projectId === route.params.id)
  if (range.value === 'all') return all
  return all.filter((c) => c.period === range.value)
})

const actual = computed(() => records.value.reduce((s, r) => s + r.amount, 0))
const pct = computed(() => {
  if (!project.value?.budgetAmount) return 0
  return Math.round((actual.value / project.value.budgetAmount) * 1000) / 10
})

const byPlatform = computed(() => {
  const map = {}
  for (const r of records.value) {
    map[r.platform] = (map[r.platform] || 0) + r.amount
  }
  return Object.entries(map).map(([k, v]) => ({
    label: platformType[k],
    value: v,
    valueLabel: formatWon(v),
  }))
})

const periods = computed(() => [...new Set(dsp.costRecords.filter((c) => c.projectId === route.params.id).map((c) => c.period))].sort())

const stacked = computed(() => {
  const labels = periods.value
  const plats = ['azure_ml', 'azure_databricks']
  return {
    labels,
    series: plats.map((p) => ({
      label: platformType[p],
      values: labels.map((per) =>
        dsp.costRecords
          .filter((c) => c.projectId === route.params.id && c.platform === p && c.period === per)
          .reduce((s, c) => s + c.amount, 0),
      ),
    })),
  }
})

function exportCsv() {
  const header = 'period,platform,resourceId,amount\n'
  const body = records.value.map((r) => `${r.period},${r.platform},${r.resourceId},${r.amount}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${route.params.id}-cost.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const columns = [
  { key: 'period', label: '기간' },
  { key: 'platform', label: '플랫폼' },
  { key: 'resourceId', label: '리소스' },
  { key: 'amount', label: '금액', numeric: true },
]
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="예산 대비 실적입니다.">
      <template #actions>
        <DsSelect
          v-model="range"
          :options="[{ value: 'all', label: '전체 기간' }, ...periods.map((p) => ({ value: p, label: p }))]"
          placeholder=""
          width="sm"
        />
        <DsButton variant="secondary" @click="exportCsv">CSV</DsButton>
      </template>
    </DsPageHeader>
    <ProjectSubnav :project-id="project.id" />
    <div class="grid">
      <DsCard>
        <template #title>예산 대비</template>
        <DsDonut
          :center="`${pct}%`"
          label="사용률"
          :segments="[
            { label: '실적', value: actual, valueLabel: formatWon(actual) },
            { label: '잔여', value: Math.max(0, project.budgetAmount - actual), valueLabel: formatWon(Math.max(0, project.budgetAmount - actual)) },
          ]"
        />
        <p class="ds-meta">예산 {{ formatWon(project.budgetAmount) }}</p>
      </DsCard>
      <DsCard>
        <template #title>월별 · 플랫폼</template>
        <DsStackedBar :labels="stacked.labels" :series="stacked.series" />
      </DsCard>
    </div>
    <DsCard style="margin-top: 32px">
      <template #title>내역</template>
      <DsTable :columns="columns" :rows="records.map((r, i) => ({ ...r, id: i }))">
        <template #platform="{ row }">{{ platformType[row.platform] }}</template>
        <template #amount="{ row }">{{ formatWon(row.amount) }}</template>
      </DsTable>
    </DsCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--ds-space-6);
  grid-template-columns: 22rem 1fr;
}
</style>
