<script setup>
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsField from '../components/ui/DsField.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { fulfillmentIntent } from '../data/labels'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const dsp = useDspStore()
const ui = useUiStore()

const form = reactive({
  title: '',
  problem: '',
  businessContext: '',
  desiredOutcome: '',
  dataDescription: '',
  dueAt: '',
  relatedProjectId: '',
  fulfillmentIntent: 'undecided',
})

const errors = reactive({ title: '', problem: '', desiredOutcome: '' })

const projectOptions = computed(() =>
  dsp
    .visibleProjects()
    .filter((p) => p.status === 'active')
    .map((p) => ({ value: p.id, label: p.name })),
)

function validate() {
  const e = {}
  if (!form.title.trim()) e.title = '제목을 입력하세요.'
  if (!form.problem.trim()) e.problem = '문제를 입력하세요.'
  if (!form.desiredOutcome.trim()) e.desiredOutcome = '기대 결과를 입력하세요.'
  Object.assign(errors, { title: '', problem: '', desiredOutcome: '' }, e)
  return !Object.keys(e).length
}

function save(submit) {
  if (!validate()) {
    ui.toast('필수 항목을 확인하세요.', 'danger')
    return
  }
  const res = dsp.saveAnalysisRequest(form, undefined, { submit })
  if (res.ok) router.push(`/requests/${res.id}`)
}
</script>

<template>
  <DsPageHeader
    title="분석요청 작성"
    description="원하는 결과와 보유 데이터를 적습니다. 학습 화면이 아니며, 접수 후 관리자가 진행 경로를 정합니다."
  >
    <template #actions>
      <DsButton variant="ghost" to="/requests">취소</DsButton>
      <DsButton variant="secondary" @click="save(false)">임시저장</DsButton>
      <DsButton variant="primary" @click="save(true)">요청 제출</DsButton>
    </template>
  </DsPageHeader>

  <div class="layout">
    <DsCard>
      <template #title>의뢰</template>
      <DsField label="제목" required :error="errors.title">
        <DsInput v-model="form.title" width="full" />
      </DsField>
      <DsField label="문제" required :error="errors.problem" hint="지금 안 되는 일과 왜 ML이 필요한지">
        <DsTextarea v-model="form.problem" :rows="5" />
      </DsField>
      <DsField label="업무 배경">
        <DsTextarea v-model="form.businessContext" />
      </DsField>
      <DsField label="기대 결과" required :error="errors.desiredOutcome">
        <DsTextarea v-model="form.desiredOutcome" />
      </DsField>
      <DsField label="보유 데이터" hint="위치, 기간, 라벨 유무">
        <DsTextarea v-model="form.dataDescription" />
      </DsField>
    </DsCard>

    <DsCard>
      <template #title>진행 희망</template>
      <DsField label="희망 기한">
        <DsInput v-model="form.dueAt" type="date" width="sm" />
      </DsField>
      <DsField label="관련 기존 프로젝트" hint="이미 있는 과제에 모델을 더하고 싶으면 선택">
        <DsSelect v-model="form.relatedProjectId" :options="projectOptions" placeholder="없음" width="lg" />
      </DsField>
      <DsField label="희망 경로" required>
        <DsSelect
          v-model="form.fulfillmentIntent"
          :options="Object.entries(fulfillmentIntent).map(([value, label]) => ({ value, label }))"
          placeholder=""
          width="lg"
        />
      </DsField>
    </DsCard>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  gap: var(--ds-section-gap);
}
</style>
