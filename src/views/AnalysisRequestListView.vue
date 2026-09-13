<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import {
  analysisRequestStatus,
  analysisRequestStatusChip,
  fulfillmentIntent,
} from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const router = useRouter()
const dsp = useDspStore()
const status = ref('')
const intent = ref('')

const rows = computed(() => {
  let list = dsp.visibleAnalysisRequests()
  if (status.value) list = list.filter((r) => r.status === status.value)
  if (intent.value) list = list.filter((r) => r.fulfillmentIntent === intent.value)
  return list
})

const columns = [
  { key: 'title', label: '제목', strong: true },
  { key: 'requester', label: '요청자' },
  { key: 'intent', label: '희망 경로' },
  { key: 'relatedProject', label: '관련 프로젝트' },
  { key: 'status', label: '상태' },
  { key: 'createdAt', label: '접수' },
]
</script>

<template>
  <DsPageHeader
    title="분석요청"
    description="ML 작업이 필요할 때 의뢰를 올립니다. 관리자가 기존 프로젝트에 붙이거나 새 프로젝트 생성으로 넘깁니다."
  >
    <template #actions>
      <DsButton variant="primary" to="/requests/new">요청하기</DsButton>
    </template>
  </DsPageHeader>

  <div class="filters">
    <DsSelect
      v-model="status"
      :options="Object.entries(analysisRequestStatus).map(([value, label]) => ({ value, label }))"
      placeholder="상태 전체"
      width="sm"
    />
    <DsSelect
      v-model="intent"
      :options="Object.entries(fulfillmentIntent).map(([value, label]) => ({ value, label }))"
      placeholder="경로 전체"
    />
  </div>

  <DsTable :columns="columns" :rows="rows" @row-click="(row) => router.push(`/requests/${row.id}`)">
    <template #requester="{ row }">{{ dsp.userById(row.requesterId)?.name }}</template>
    <template #intent="{ row }">{{ fulfillmentIntent[row.fulfillmentIntent] }}</template>
    <template #relatedProject="{ row }">
      {{ dsp.projectById(row.linkedProjectId || row.relatedProjectId)?.name || '—' }}
    </template>
    <template #status="{ row }">
      <DsChip :tone="analysisRequestStatusChip[row.status]">{{ analysisRequestStatus[row.status] }}</DsChip>
    </template>
    <template #createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
  </DsTable>
</template>

<style scoped>
.filters {
  display: flex;
  gap: var(--ds-space-3);
  margin-bottom: var(--ds-space-4);
}
</style>
