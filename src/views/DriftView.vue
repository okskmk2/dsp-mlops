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
const firstModel = dsp.visibleModels().find((m) => m.stage === 'champion') || dsp.visibleModels()[0]
const projectId = ref(firstModel?.projectId || '')
const modelId = ref(firstModel?.id || '')
const feature = ref('all')

const projectOptions = computed(() => dsp.visibleProjects().map((project) => ({ value: project.id, label: project.name })))
const projectModels = computed(() => dsp.visibleModels().filter((modelItem) => modelItem.projectId === projectId.value))
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

function selectProject(id) {
  projectId.value = id
  modelId.value = projectModels.value.find((modelItem) => modelItem.stage === 'champion')?.id || projectModels.value[0]?.id || ''
}
</script>

<template>
  <DsPageHeader title="드리프트" description="Champion 자격 경고와 추이입니다.">
    <template #actions>
      <DsSelect
        :model-value="projectId"
        :options="projectOptions"
        placeholder="프로젝트 선택"
        width="lg"
        @update:model-value="selectProject"
      />
      <DsSelect
        v-model="modelId"
        :options="projectModels.map((m) => ({ value: m.id, label: `${m.name} ${m.version}` }))"
        placeholder=""
        width="lg"
      />
      <DsButton v-if="model" variant="secondary" @click="ui.retrainModelId = model.id">재학습</DsButton>
    </template>
  </DsPageHeader>

  <header class="project-context" v-if="model">
    <div><h2>{{ dsp.projectById(model.projectId)?.name }}</h2><span>선택한 프로젝트의 모델 드리프트</span></div>
    <strong>{{ projectModels.length }}개 모델</strong>
  </header>

  <DsCard v-if="model?.championHealth === 'at_risk'" class="ds-mb-section">
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

  <DsCard class="ds-follow">
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

.project-context {
  align-items: baseline;
  border-top: 1px solid var(--ds-border);
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--ds-space-4);
  padding-top: var(--ds-space-4);
}

.project-context div {
  align-items: baseline;
  display: flex;
  gap: var(--ds-space-3);
}

.project-context h2 {
  font-size: var(--ds-font-title-sm);
  margin: 0;
}

.project-context span, .project-context strong {
  color: var(--ds-text-secondary);
  font-size: var(--ds-font-meta);
  font-weight: 400;
}
</style>
