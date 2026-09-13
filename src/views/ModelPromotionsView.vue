<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import { approvalStatus, approvalStatusChip } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const rows = computed(() =>
  dsp.approvals.filter((a) => a.type === 'champion_promote' || a.type === 'champion_demote'),
)
const columns = [
  { key: 'type', label: '유형' },
  { key: 'model', label: '모델', strong: true },
  { key: 'requester', label: '요청자' },
  { key: 'createdAt', label: '상신' },
  { key: 'status', label: '상태' },
]
</script>

<template>
  <DsPageHeader title="승격 요청" description="Champion 승격·강등 품의입니다." />
  <DsTable :columns="columns" :rows="rows" @row-click="() => router.push('/approvals')">
    <template #type="{ row }">{{ row.type === 'champion_promote' ? '승격' : '강등' }}</template>
    <template #model="{ row }">
      {{ dsp.modelById(row.payloadRef)?.name }} {{ dsp.modelById(row.payloadRef)?.version }}
    </template>
    <template #requester="{ row }">{{ dsp.userById(row.requesterId)?.name }}</template>
    <template #createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
    <template #status="{ row }">
      <DsChip :tone="approvalStatusChip[row.status]">{{ approvalStatus[row.status] }}</DsChip>
    </template>
  </DsTable>
</template>
