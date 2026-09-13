<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import DsBreadcrumb from '../../components/ui/DsBreadcrumb.vue'
import DsButton from '../../components/ui/DsButton.vue'
import DsChip from '../../components/ui/DsChip.vue'
import DsField from '../../components/ui/DsField.vue'
import DsInput from '../../components/ui/DsInput.vue'
import DsModal from '../../components/ui/DsModal.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { useDspStore } from '../../stores/dsp'

const route = useRoute()
const dsp = useDspStore()
const open = ref(false)
const form = reactive({ id: '', group: '', code: '', label: '', sort: 1 })

const selectedGroup = computed(() => String(route.params.group || ''))

const groupLabel = computed(() => {
  const row = dsp.codes.find((c) => c.group === selectedGroup.value)
  return row?.groupLabel || selectedGroup.value
})

const rows = computed(() =>
  dsp.codes.filter((c) => c.group === selectedGroup.value).slice().sort((a, b) => a.sort - b.sort),
)

function startNew() {
  Object.assign(form, {
    id: '',
    group: selectedGroup.value,
    code: '',
    label: '',
    sort: (rows.value.at(-1)?.sort || 0) + 1,
  })
  open.value = true
}

function startEdit(row) {
  Object.assign(form, { id: row.id, group: row.group, code: row.code, label: row.label, sort: row.sort })
  open.value = true
}

function save() {
  const res = dsp.saveCode({ ...form })
  if (res.ok) open.value = false
}
</script>

<template>
  <DsBreadcrumb
    :items="[
      { label: '코드 관리', to: '/admin/codes' },
      { label: groupLabel },
    ]"
  />
  <DsPageHeader :title="groupLabel" description="시스템 식별자(code)는 기존 값을 유지하는 것이 안전합니다.">
    <template #actions>
      <DsButton variant="ghost" to="/admin/codes">그룹 목록</DsButton>
      <DsButton variant="primary" @click="startNew">코드 추가</DsButton>
    </template>
  </DsPageHeader>

  <DsTable
    :columns="[
      { key: 'code', label: '코드', strong: true },
      { key: 'label', label: '표시명' },
      { key: 'sort', label: '순서', numeric: true },
      { key: 'enabled', label: '상태' },
      { key: 'actions', label: '' },
    ]"
    :rows="rows"
  >
    <template #code="{ row }"><span class="mono">{{ row.code }}</span></template>
    <template #enabled="{ row }">
      <DsChip :tone="row.enabled ? 'success' : 'neutral'">{{ row.enabled ? '활성' : '비활성' }}</DsChip>
    </template>
    <template #actions="{ row }">
      <DsButton variant="ghost" @click="startEdit(row)">편집</DsButton>
      <DsButton v-if="row.enabled" variant="ghost" @click="dsp.setCodeEnabled(row.id, false)">비활성</DsButton>
      <DsButton v-else variant="ghost" @click="dsp.setCodeEnabled(row.id, true)">활성</DsButton>
    </template>
  </DsTable>

  <DsModal v-if="open" :title="form.id ? '코드 편집' : '코드 추가'" size="sm" @close="open = false">
    <DsField label="코드" required hint="영문·숫자 식별자">
      <DsInput v-model="form.code" width="full" class="mono" :disabled="Boolean(form.id)" />
    </DsField>
    <DsField label="표시명" required>
      <DsInput v-model="form.label" width="full" />
    </DsField>
    <DsField label="순서">
      <DsInput v-model="form.sort" type="number" width="sm" />
    </DsField>
    <template #footer>
      <DsButton variant="ghost" @click="open = false">취소</DsButton>
      <DsButton variant="primary" @click="save">저장</DsButton>
    </template>
  </DsModal>
</template>
