<script setup>
import { computed, reactive, ref } from 'vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsCheckbox from '../components/ui/DsCheckbox.vue'
import DsField from '../components/ui/DsField.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { canManageDspSettings, hasProjectRole } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const editing = ref(null)

const canWrite = (projectId) =>
  canManageDspSettings(auth.user) || hasProjectRole(auth.user, projectId, dsp.members, ['owner', 'coordinator'])

const rows = computed(() =>
  dsp.monitorRules.filter((r) => dsp.visibleModels().some((m) => m.id === r.modelId)),
)

const form = reactive({
  id: null,
  projectId: '',
  modelId: '',
  metricName: 'f1',
  operator: '>=',
  threshold: 0.8,
  cron: '0 8 * * *',
  notifyEmail: false,
})

const projectOptions = computed(() =>
  dsp.visibleProjects().map((p) => ({ value: p.id, label: p.name })),
)
const modelOptions = computed(() =>
  dsp.models
    .filter((m) => m.projectId === form.projectId)
    .map((m) => ({ value: m.id, label: `${m.name} ${m.version}` })),
)

function startNew() {
  editing.value = 'new'
  Object.assign(form, {
    id: null,
    projectId: projectOptions.value[0]?.value || '',
    modelId: '',
    metricName: 'f1',
    operator: '>=',
    threshold: 0.8,
    cron: '0 8 * * *',
    notifyEmail: false,
  })
}

function startEdit(row) {
  editing.value = row.id
  Object.assign(form, {
    ...row,
    notifyEmail: (row.notifyChannels || []).includes('email'),
  })
}

function save() {
  dsp.saveMonitorRule({
    id: form.id,
    projectId: form.projectId,
    modelId: form.modelId,
    metricName: form.metricName,
    operator: form.operator,
    threshold: Number(form.threshold),
    cron: form.cron,
    notifyChannels: form.notifyEmail ? ['inapp', 'email'] : ['inapp'],
    enabled: true,
  })
  editing.value = null
}

const columns = [
  { key: 'project', label: '프로젝트' },
  { key: 'model', label: '모델', strong: true },
  { key: 'metricName', label: '지표' },
  { key: 'rule', label: '조건' },
  { key: 'cron', label: '주기' },
  { key: 'enabled', label: '사용' },
  { key: 'actions', label: '' },
]
</script>

<template>
  <DsPageHeader title="모니터 기준치" description="오너·코디네이터·관리자가 규칙을 관리합니다.">
    <template #actions>
      <DsButton variant="primary" @click="startNew">추가</DsButton>
    </template>
  </DsPageHeader>
  <div class="layout">
    <DsTable :columns="columns" :rows="rows">
      <template #project="{ row }">{{ dsp.projectById(row.projectId)?.name }}</template>
      <template #model="{ row }">
        {{ dsp.modelById(row.modelId)?.name }} {{ dsp.modelById(row.modelId)?.version }}
      </template>
      <template #rule="{ row }">{{ row.operator }} {{ row.threshold }}</template>
      <template #enabled="{ row }">{{ row.enabled ? '사용' : '중지' }}</template>
      <template #actions="{ row }">
        <DsButton v-if="canWrite(row.projectId)" variant="ghost" @click="startEdit(row)">편집</DsButton>
        <DsButton v-if="canWrite(row.projectId) && row.enabled" variant="ghost" @click="dsp.disableMonitorRule(row.id)">
          비활성
        </DsButton>
      </template>
    </DsTable>
    <DsCard v-if="editing">
      <template #title>{{ form.id ? '규칙 편집' : '규칙 추가' }}</template>
      <DsField label="프로젝트">
        <DsSelect v-model="form.projectId" :options="projectOptions" width="full" placeholder="" />
      </DsField>
      <DsField label="모델">
        <DsSelect v-model="form.modelId" :options="modelOptions" width="full" />
      </DsField>
      <DsField label="지표">
        <DsInput v-model="form.metricName" width="full" />
      </DsField>
      <DsField label="연산자">
        <DsSelect
          v-model="form.operator"
          :options="['>=', '<=', '>', '<'].map((v) => ({ value: v, label: v }))"
          width="full"
          placeholder=""
        />
      </DsField>
      <DsField label="임계">
        <DsInput v-model="form.threshold" type="number" width="full" />
      </DsField>
      <DsField label="주기 (cron)">
        <DsInput v-model="form.cron" width="full" class="mono" />
      </DsField>
      <DsCheckbox v-model="form.notifyEmail" label="이메일 알림" />
      <DsField v-if="canManageDspSettings(auth.user)" label="템플릿 적용">
        <DsSelect
          :model-value="''"
          :options="dsp.thresholdTemplates.map((t) => ({ value: t.id, label: t.name }))"
          width="full"
          placeholder="템플릿 선택"
          @update:model-value="(v) => form.id && dsp.applyTemplate(form.id, v)"
        />
      </DsField>
      <div class="row">
        <DsButton variant="ghost" @click="editing = null">취소</DsButton>
        <DsButton variant="primary" :disabled="!form.projectId || !form.modelId" @click="save">저장</DsButton>
      </div>
    </DsCard>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: minmax(0, 1fr) 356px;
}

.row {
  display: flex;
  gap: var(--ds-space-2);
  justify-content: flex-end;
}
</style>
