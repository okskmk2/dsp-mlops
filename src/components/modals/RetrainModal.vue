<script setup>
import { computed, reactive } from 'vue'
import DsButton from '../ui/DsButton.vue'
import DsField from '../ui/DsField.vue'
import DsInput from '../ui/DsInput.vue'
import DsModal from '../ui/DsModal.vue'
import DsSelect from '../ui/DsSelect.vue'
import DsTextarea from '../ui/DsTextarea.vue'
import { useDspStore } from '../../stores/dsp'
import { useUiStore } from '../../stores/ui'

const dsp = useDspStore()
const ui = useUiStore()
const model = computed(() => dsp.modelById(ui.retrainModelId))
const jobs = computed(() => dsp.jobs.filter((j) => j.projectId === model.value?.projectId))
const datasets = computed(() => {
  const jobIds = new Set(jobs.value.map((j) => j.id))
  const datasetIds = new Set(dsp.lineageEdges.filter((e) => jobIds.has(e.to)).map((e) => e.from))
  return dsp.datasets.filter((d) => datasetIds.has(d.id))
})

const form = reactive({
  reason: '',
  datasetRef: datasets.value[0]?.ref || '',
  existingJobId: jobs.value[0]?.id || '',
})

function close() {
  ui.retrainModelId = null
}

function submit() {
  if (!form.reason.trim() || !form.existingJobId) return
  dsp.requestRetrain({
    modelId: ui.retrainModelId,
    reason: form.reason.trim(),
    datasetRef: form.datasetRef,
    existingJobId: form.existingJobId,
  })
  close()
}
</script>

<template>
  <DsModal v-if="model" title="재학습 요청" @close="close">
    <p class="ds-meta">{{ model.name }} {{ model.version }} · 기존 Job을 다시 실행합니다. 클러스터 설계는 하지 않습니다.</p>
    <DsField label="사유" required>
      <DsTextarea v-model="form.reason" placeholder="재학습이 필요한 이유" />
    </DsField>
    <DsField label="데이터셋 참조">
      <DsSelect
        v-model="form.datasetRef"
        width="full"
        :options="datasets.map((d) => ({ value: d.ref, label: `${d.name} (${d.ref})` }))"
      />
    </DsField>
    <DsField label="기존 Job ID" required>
      <DsSelect
        v-model="form.existingJobId"
        width="full"
        :options="jobs.map((j) => ({ value: j.id, label: `${j.name} (${j.id})` }))"
      />
    </DsField>
    <DsField v-if="!jobs.length" label="Job ID 직접 입력">
      <DsInput v-model="form.existingJobId" width="full" placeholder="기존 Job ID" />
    </DsField>
    <template #footer>
      <DsButton variant="ghost" @click="close">취소</DsButton>
      <DsButton variant="primary" :disabled="!form.reason.trim() || !form.existingJobId" @click="submit">요청</DsButton>
    </template>
  </DsModal>
</template>
