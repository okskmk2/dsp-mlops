<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { monitorResult, monitorResultChip } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const result = ref('')

const rows = computed(() => {
  const vis = new Set(dsp.visibleModels().map((m) => m.id))
  let list = dsp.monitorRules
    .filter((r) => vis.has(r.modelId))
    .map((r) => {
      const check = dsp.latestCheck(r.id)
      const model = dsp.modelById(r.modelId)
      return {
        id: r.id,
        target: `${model?.name} ${model?.version}`,
        modelId: r.modelId,
        lastCheckAt: check?.checkedAt,
        result: check?.result || 'no_data',
        failedRule: check?.result === 'fail' ? `${r.metricName} ${r.operator} ${r.threshold} (실측 ${check.actualValue})` : '—',
      }
    })
  if (result.value) list = list.filter((r) => r.result === result.value)
  return list
})

const columns = [
  { key: 'target', label: '대상', strong: true },
  { key: 'lastCheckAt', label: '최근 검사' },
  { key: 'result', label: '결과' },
  { key: 'failedRule', label: '실패 규칙' },
]
</script>

<template>
  <DsPageHeader title="모니터 현황" description="주기 검사 결과입니다. 색만으로 구분하지 않고 정상/실패 텍스트를 붙입니다.">
    <template #actions>
      <DsSelect
        v-model="result"
        :options="[
          { value: 'pass', label: '정상' },
          { value: 'fail', label: '실패' },
          { value: 'no_data', label: '데이터 없음' },
        ]"
        placeholder="결과 전체"
        width="sm"
      />
      <DsButton variant="secondary" to="/monitoring/thresholds">기준치</DsButton>
    </template>
  </DsPageHeader>
  <DsTable :columns="columns" :rows="rows" @row-click="(r) => router.push(`/models/${r.modelId}`)">
    <template #lastCheckAt="{ row }">{{ formatDateTime(row.lastCheckAt) }}</template>
    <template #result="{ row }">
      <DsChip :tone="monitorResultChip[row.result]">{{ monitorResult[row.result] }}</DsChip>
    </template>
  </DsTable>
</template>
