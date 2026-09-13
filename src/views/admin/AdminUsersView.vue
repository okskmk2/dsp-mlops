<script setup>
import { computed, reactive, ref } from 'vue'
import DsButton from '../../components/ui/DsButton.vue'
import DsCheckbox from '../../components/ui/DsCheckbox.vue'
import DsChip from '../../components/ui/DsChip.vue'
import DsField from '../../components/ui/DsField.vue'
import DsInput from '../../components/ui/DsInput.vue'
import DsModal from '../../components/ui/DsModal.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsSelect from '../../components/ui/DsSelect.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { platformRole } from '../../data/labels'
import { useAuthStore } from '../../stores/auth'
import { useDspStore } from '../../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const open = ref(false)
const form = reactive({
  id: '',
  name: '',
  email: '',
  title: '',
  platformRole: 'general',
  isApprover: false,
})

const roleOptions = [
  { value: 'dsp_admin', label: platformRole.dsp_admin },
  { value: 'officer', label: platformRole.officer },
  { value: 'general', label: platformRole.general },
]

const rows = computed(() => dsp.users)
const columns = [
  { key: 'name', label: '이름', strong: true },
  { key: 'email', label: '메일' },
  { key: 'title', label: '직함' },
  { key: 'platformRole', label: '플랫폼 역할' },
  { key: 'isApprover', label: '승인권자' },
  { key: 'enabled', label: '상태' },
  { key: 'actions', label: '' },
]

function startNew() {
  Object.assign(form, { id: '', name: '', email: '', title: '', platformRole: 'general', isApprover: false })
  open.value = true
}

function startEdit(row) {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    email: row.email,
    title: row.title,
    platformRole: row.platformRole,
    isApprover: row.isApprover,
  })
  open.value = true
}

function save() {
  const res = dsp.saveUser({ ...form })
  if (res.ok) open.value = false
}
</script>

<template>
  <DsPageHeader title="사용자 관리" description="플랫폼 계정을 등록하고 비활성합니다. 프로젝트 역할은 각 프로젝트 팀에서 다룹니다.">
    <template #actions>
      <DsButton variant="primary" @click="startNew">사용자 추가</DsButton>
    </template>
  </DsPageHeader>
  <DsTable :columns="columns" :rows="rows">
    <template #platformRole="{ row }">{{ platformRole[row.platformRole] }}</template>
    <template #isApprover="{ row }">{{ row.isApprover ? '예' : '아니오' }}</template>
    <template #enabled="{ row }">
      <DsChip :tone="row.enabled === false ? 'neutral' : 'success'">
        {{ row.enabled === false ? '비활성' : '활성' }}
      </DsChip>
    </template>
    <template #actions="{ row }">
      <DsButton variant="ghost" @click="startEdit(row)">편집</DsButton>
      <DsButton
        v-if="row.enabled !== false && row.id !== auth.user.id"
        variant="ghost"
        @click="dsp.setUserEnabled(row.id, false)"
      >
        비활성
      </DsButton>
      <DsButton v-else-if="row.enabled === false" variant="ghost" @click="dsp.setUserEnabled(row.id, true)">
        활성
      </DsButton>
    </template>
  </DsTable>

  <DsModal :title="form.id ? '사용자 편집' : '사용자 추가'" v-if="open" @close="open = false">
    <DsField label="이름" required>
      <DsInput v-model="form.name" width="full" />
    </DsField>
    <DsField label="메일" required>
      <DsInput v-model="form.email" type="email" width="full" />
    </DsField>
    <DsField label="직함">
      <DsInput v-model="form.title" width="full" />
    </DsField>
    <DsField label="플랫폼 역할">
      <DsSelect v-model="form.platformRole" :options="roleOptions" width="full" placeholder="" />
    </DsField>
    <DsCheckbox v-model="form.isApprover" label="승인권자" />
    <template #footer>
      <DsButton variant="ghost" @click="open = false">취소</DsButton>
      <DsButton variant="primary" @click="save">저장</DsButton>
    </template>
  </DsModal>
</template>
