<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { approvalStatus, approvalStatusChip, approvalType } from '../data/labels'
import { formatDateTime, formatWon } from '../lib/format'
import { isApprover } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const router = useRouter()
const auth = useAuthStore()
const dsp = useDspStore()
const status = ref('pending')

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
  return dsp.approvalTarget(row).name || row.payloadRef
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
  <DsTable :columns="columns" :rows="rows" @row-click="(r) => router.push(`/approvals/${r.id}`)">
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
</template>
