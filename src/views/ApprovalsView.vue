<script setup>
import { computed, ref } from 'vue'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsDrawer from '../components/ui/DsDrawer.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { approvalStatus, approvalStatusChip, approvalType } from '../data/labels'
import { formatDateTime, formatWon } from '../lib/format'
import { isApprover } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const status = ref('pending')
const selected = ref(null)
const reason = ref('')

const rows = computed(() => {
  let list = dsp.approvals.filter((a) => {
    if (isApprover(auth.user) && a.approverId === auth.user.id) return true
    if (a.requesterId === auth.user.id) return true
    if (auth.user.platformRole === 'dsp_admin') return true
    return false
  })
  if (status.value) list = list.filter((a) => a.status === status.value)
  return list
})

function targetName(row) {
  return dsp.projectById(row.payloadRef)?.name || `${dsp.modelById(row.payloadRef)?.name || ''} ${dsp.modelById(row.payloadRef)?.version || ''}`.trim() || row.payloadRef
}

function targetHref(row) {
  if (dsp.projectById(row.payloadRef)) return `/projects/${row.payloadRef}`
  if (dsp.modelById(row.payloadRef)) return `/models/${row.payloadRef}`
  return ''
}

function decide(decision) {
  const ok = dsp.decideApproval(selected.value.id, decision, reason.value)
  if (ok.ok) {
    selected.value = dsp.approvalById(selected.value.id)
    reason.value = ''
  }
}

const columns = [
  { key: 'type', label: '유형' },
  { key: 'requester', label: '요청자' },
  { key: 'amountOrModel', label: '금액/모델' },
  { key: 'due', label: '상신' },
  { key: 'status', label: '상태' },
]
</script>

<template>
  <DsPageHeader title="결재함" description="전자결재 승인·반려. 승인권자만 처리할 수 있습니다.">
    <template #actions>
      <DsSelect
        v-model="status"
        :options="[
          { value: 'pending', label: '대기' },
          { value: 'approved', label: '승인' },
          { value: 'rejected', label: '반려' },
        ]"
        placeholder="상태 전체"
        width="sm"
      />
    </template>
  </DsPageHeader>
  <DsTable :columns="columns" :rows="rows" @row-click="(r) => (selected = r)">
    <template #type="{ row }">{{ approvalType[row.type] }}</template>
    <template #requester="{ row }">{{ dsp.userById(row.requesterId)?.name }}</template>
    <template #amountOrModel="{ row }">
      {{ row.amount ? formatWon(row.amount) : targetName(row) }}
    </template>
    <template #due="{ row }">{{ formatDateTime(row.createdAt) }}</template>
    <template #status="{ row }">
      <DsChip :tone="approvalStatusChip[row.status]">{{ approvalStatus[row.status] }}</DsChip>
    </template>
  </DsTable>

  <DsDrawer v-if="selected" :title="approvalType[selected.type]" @close="selected = null">
    <p class="ds-body-strong">{{ targetName(selected) }}</p>
    <p class="ds-meta">요청 {{ dsp.userById(selected.requesterId)?.name }} · 승인 {{ dsp.userById(selected.approverId)?.name }}</p>
    <DsChip :tone="approvalStatusChip[selected.status]">{{ approvalStatus[selected.status] }}</DsChip>
    <p v-if="selected.comment" class="ds-body">{{ selected.comment }}</p>
    <DsField v-if="selected.status === 'pending' && isApprover(auth.user) && selected.approverId === auth.user.id" label="반려 사유">
      <DsTextarea v-model="reason" />
    </DsField>
    <template #footer>
      <DsButton v-if="targetHref(selected)" variant="ghost" :to="targetHref(selected)">대상 열기</DsButton>
      <template v-if="selected.status === 'pending' && isApprover(auth.user) && selected.approverId === auth.user.id">
        <DsButton variant="danger" @click="decide('rejected')">반려</DsButton>
        <DsButton variant="primary" @click="decide('approved')">승인</DsButton>
      </template>
    </template>
  </DsDrawer>
</template>
