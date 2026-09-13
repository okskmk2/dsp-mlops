<script setup>
import { computed, ref } from 'vue'
import DsLineChart from '../components/charts/DsLineChart.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { championHealth, championHealthChip } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const dsp = useDspStore()
const ui = useUiStore()
const modelId = ref(dsp.visibleModels().find((m) => m.stage === 'champion')?.id || '')
const feature = ref('all')

const model = computed(() => dsp.modelById(modelId.value))
const seriesRows = computed(() => dsp.driftSeries.filter((d) => d.modelId === modelId.value))
const events = computed(() =>
  dsp.driftSnapshots.filter((d) => d.modelId === modelId.value && d.score >= d.threshold),
)

const chartSeries = computed(() => {
  const rows = seriesRows.value
  const all = [
    { label: '입력 드리프트', key: 'inputDrift' },
    { label: '예측 드리프트', key: 'predictionDrift' },
    { label: '라벨 드리프트', key: 'labelOrLabDrift' },
  ]
  const picked = feature.value === 'all' ? all : all.filter((s) => s.key === feature.value)
  return picked.map((s) => ({ label: s.label, values: rows.map((r) => r[s.key]) }))
})
</script>

<template>
  <DsPageHeader title="드리프트" description="Champion 자격 경고와 추이입니다.">
    <template #actions>
      <DsSelect
        v-model="modelId"
        :options="dsp.visibleModels().map((m) => ({ value: m.id, label: `${m.name} ${m.version}` }))"
        placeholder=""
        width="lg"
      />
      <DsButton v-if="model" variant="secondary" @click="ui.retrainModelId = model.id">재학습</DsButton>
    </template>
  </DsPageHeader>

  <DsCard v-if="model?.championHealth === 'at_risk'" style="margin-bottom: 24px">
    <template #title>Champion 위험</template>
    <p class="ds-body">{{ model.name }} {{ model.version }} 자격이 위험입니다. 강등 또는 재학습을 검토하세요.</p>
  </DsCard>

  <div class="toolbar">
    <DsSelect
      v-model="feature"
      :options="[
        { value: 'all', label: '모든 시리즈' },
        { value: 'inputDrift', label: '입력' },
        { value: 'predictionDrift', label: '예측' },
        { value: 'labelOrLabDrift', label: '라벨' },
      ]"
      placeholder=""
    />
  </div>

  <DsCard>
    <template #title>추이</template>
    <DsLineChart
      v-if="seriesRows.length"
      :labels="seriesRows.map((s) => s.capturedAt.slice(5))"
      :series="chartSeries"
      :threshold="0.25"
    />
    <p v-else class="ds-meta">선택한 모델의 시리즈가 없습니다.</p>
  </DsCard>

  <DsCard style="margin-top: 32px">
    <template #title>이벤트</template>
    <DsTable
      :columns="[
        { key: 'featureOrSignal', label: '신호' },
        { key: 'score', label: '점수', numeric: true },
        { key: 'threshold', label: '임계', numeric: true },
        { key: 'capturedAt', label: '시각' },
        { key: 'health', label: '건강' },
      ]"
      :rows="events"
    >
      <template #capturedAt="{ row }">{{ formatDateTime(row.capturedAt) }}</template>
      <template #health>
        <DsChip v-if="model?.championHealth" :tone="championHealthChip[model.championHealth]">
          {{ championHealth[model.championHealth] }}
        </DsChip>
      </template>
    </DsTable>
  </DsCard>
</template>

<style scoped>
.toolbar {
  margin-bottom: var(--ds-space-4);
}
</style>
