<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsField from '../components/ui/DsField.vue'
import DsModal from '../components/ui/DsModal.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import DsChip from '../components/ui/DsChip.vue'
import { monitorResult, monitorResultChip } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const project = computed(() => dsp.projectById(route.params.id))
const open = ref(false)
const form = reactive({ modelId: '', metricName: '', operator: '<=', threshold: '', cron: '0 8 * * *' })
const models = computed(() => dsp.models.filter((model) => model.projectId === route.params.id))
const rules = computed(() => dsp.monitorRules.filter((rule) => rule.projectId === route.params.id && rule.enabled).map((rule) => {
  const model = dsp.modelById(rule.modelId)
  const check = dsp.latestCheck(rule.id)
  return { ...rule, target: `${model?.name} ${model?.version}`, result: check?.result || 'no_data', checkedAt: check?.checkedAt }
}))
const columns = [
  { key: 'target', label: '모니터링 대상', strong: true },
  { key: 'metricName', label: '지표' },
  { key: 'threshold', label: '기준' },
  { key: 'result', label: '최근 결과' },
  { key: 'checkedAt', label: '최근 검사' },
]
function addRule() {
  if (!form.modelId || !form.metricName || form.threshold === '') return
  dsp.saveMonitorRule({ ...form, projectId: project.value.id, threshold: Number(form.threshold), notifyChannels: ['inapp'] })
  open.value = false
  Object.assign(form, { modelId: '', metricName: '', operator: '<=', threshold: '', cron: '0 8 * * *' })
}
function metrics(modelId) {
  const model = dsp.modelById(modelId)
  return Object.keys(model?.metricsSnapshot || {}).map((metric) => ({ value: metric, label: metric }))
}
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="이 프로젝트의 모델과 ML 자산 모니터링 현황입니다.">
      <template #actions><DsButton variant="primary" @click="open = true">모니터링 추가</DsButton></template>
    </DsPageHeader>
    <ProjectSubnav :project-id="project.id" />
    <DsTable :columns="columns" :rows="rules" @row-click="(row) => router.push(`/models/${row.modelId}`)">
      <template #threshold="{ row }">{{ row.operator }} {{ row.threshold }}</template>
      <template #result="{ row }"><DsChip :tone="monitorResultChip[row.result]">{{ monitorResult[row.result] }}</DsChip></template>
      <template #checkedAt="{ row }">{{ formatDateTime(row.checkedAt) }}</template>
    </DsTable>
    <DsModal v-if="open" title="모니터링 추가" size="sm" @close="open = false">
      <DsField label="모델" required><DsSelect v-model="form.modelId" :options="models.map((model) => ({ value: model.id, label: `${model.name} ${model.version}` }))" width="full" /></DsField>
      <DsField label="지표" required><DsSelect v-model="form.metricName" :options="metrics(form.modelId)" width="full" /></DsField>
      <div class="form-row"><DsField label="연산자"><DsSelect v-model="form.operator" :options="[{ value: '<=', label: '이하' }, { value: '>=', label: '이상' }]" width="full" placeholder="" /></DsField><DsField label="기준값" required><input v-model="form.threshold" class="input" type="number" step="any" /></DsField></div>
      <DsField label="검사 주기"><DsSelect v-model="form.cron" :options="[{ value: '0 8 * * *', label: '매일 08:00' }, { value: '0 * * * *', label: '매시간' }]" width="full" placeholder="" /></DsField>
      <template #footer><DsButton variant="ghost" @click="open = false">취소</DsButton><DsButton variant="primary" :disabled="!form.modelId || !form.metricName || form.threshold === ''" @click="addRule">등록</DsButton></template>
    </DsModal>
  </div>
</template>

<style scoped>
.form-row { display: grid; gap: var(--ds-space-3); grid-template-columns: 1fr 1fr; }
.input { background: var(--ds-surface); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-md); color: var(--ds-text); height: var(--ds-control-h); padding: 0 var(--ds-space-3); width: 100%; }
</style>
