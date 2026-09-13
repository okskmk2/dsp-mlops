<script setup>
import { computed, reactive, ref } from 'vue'
import DsButton from '../components/ui/DsButton.vue'
import DsField from '../components/ui/DsField.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsModal from '../components/ui/DsModal.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { formatDateTime } from '../lib/format'
import { hasProjectRole } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const auth = useAuthStore()
const dsp = useDspStore()
const ui = useUiStore()
const open = ref(false)
const form = reactive({
  projectId: '',
  tagId: '',
  tsFrom: '',
  tsTo: '',
  reason: '',
  impactedModelIds: '',
})

const rows = computed(() =>
  dsp.contaminations.filter((c) => dsp.visibleProjects().some((p) => p.id === c.projectId)),
)

function declare() {
  dsp.declareContamination({
    projectId: form.projectId,
    tagId: form.tagId,
    tsFrom: form.tsFrom,
    tsTo: form.tsTo,
    reason: form.reason,
    impactedModelIds: form.impactedModelIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  })
  open.value = false
}

const canDeclare = (projectId) =>
  hasProjectRole(auth.user, projectId, dsp.members, ['owner', 'coordinator', 'member'])
</script>

<template>
  <DsPageHeader title="오염 구간" description="태그+시간 구간과 영향 모델을 기록합니다.">
    <template #actions>
      <DsButton variant="primary" @click="open = true">선언</DsButton>
    </template>
  </DsPageHeader>
  <DsTable
    :columns="[
      { key: 'tagId', label: '태그', strong: true },
      { key: 'range', label: '구간' },
      { key: 'reason', label: '사유' },
      { key: 'status', label: '상태' },
      { key: 'impactedModels', label: '영향 모델' },
      { key: 'actions', label: '' },
    ]"
    :rows="rows"
  >
    <template #range="{ row }">{{ formatDateTime(row.tsFrom) }} – {{ formatDateTime(row.tsTo) }}</template>
    <template #impactedModels="{ row }">
      {{ row.impactedModelIds.map((id) => `${dsp.modelById(id)?.name || id}`).join(', ') }}
    </template>
    <template #actions="{ row }">
      <DsButton v-if="row.status === 'open'" variant="ghost" @click="dsp.closeContamination(row.id)">닫기</DsButton>
      <DsButton
        v-if="row.impactedModelIds[0]"
        variant="ghost"
        @click="ui.retrainModelId = row.impactedModelIds[0]"
      >
        재학습
      </DsButton>
    </template>
  </DsTable>

  <DsModal v-if="open" title="오염 선언" @close="open = false">
    <DsField label="프로젝트">
      <DsSelect
        v-model="form.projectId"
        width="full"
        :options="dsp.visibleProjects().filter((p) => canDeclare(p.id)).map((p) => ({ value: p.id, label: p.name }))"
      />
    </DsField>
    <DsField label="태그 ID">
      <DsInput v-model="form.tagId" width="full" />
    </DsField>
    <DsField label="시작">
      <DsInput v-model="form.tsFrom" type="datetime-local" width="full" />
    </DsField>
    <DsField label="종료">
      <DsInput v-model="form.tsTo" type="datetime-local" width="full" />
    </DsField>
    <DsField label="사유">
      <DsTextarea v-model="form.reason" />
    </DsField>
    <DsField label="영향 모델 ID" hint="쉼표 구분">
      <DsInput v-model="form.impactedModelIds" width="full" />
    </DsField>
    <template #footer>
      <DsButton variant="ghost" @click="open = false">취소</DsButton>
      <DsButton variant="primary" :disabled="!form.projectId || !form.tagId" @click="declare">선언</DsButton>
    </template>
  </DsModal>
</template>
