<script setup>
import { computed, ref } from 'vue'
import DsButton from '../../components/ui/DsButton.vue'
import DsChip from '../../components/ui/DsChip.vue'
import DsEmpty from '../../components/ui/DsEmpty.vue'
import DsModal from '../../components/ui/DsModal.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { provisionStatus, provisionStatusChip } from '../../data/labels'
import { formatDateTime } from '../../lib/format'
import { useDspStore } from '../../stores/dsp'

const dsp = useDspStore()
const historyJobId = ref('')

const rows = computed(() => dsp.batchJobs)
const historyJob = computed(() => (historyJobId.value ? dsp.batchJobById(historyJobId.value) : null))
const historyRuns = computed(() => (historyJobId.value ? dsp.batchRunsFor(historyJobId.value) : []))

const columns = [
  { key: 'name', label: '배치', strong: true },
  { key: 'schedule', label: '주기' },
  { key: 'lastRunAt', label: '마지막 실행' },
  { key: 'lastStatus', label: '상태' },
  { key: 'lastDurationSec', label: '소요', numeric: true },
  { key: 'enabled', label: '활성' },
  { key: 'actions', label: '' },
]

function durationLabel(sec) {
  if (sec == null) return '—'
  return sec >= 60 ? `${Math.floor(sec / 60)}분 ${sec % 60}초` : `${sec}초`
}

function openHistory(jobId) {
  historyJobId.value = jobId
}
</script>

<template>
  <DsPageHeader title="배치관리" description="플랫폼 정기 배치 작업의 실행 상태를 확인하고 실패 건을 재실행합니다." />

  <DsTable :columns="columns" :rows="rows" row-key="id" empty-title="등록된 배치가 없습니다" @row-click="(row) => openHistory(row.id)">
    <template #schedule="{ row }"><span class="mono">{{ row.schedule }}</span></template>
    <template #lastRunAt="{ row }">{{ row.lastRunAt ? formatDateTime(row.lastRunAt) : '—' }}</template>
    <template #lastStatus="{ row }">
      <DsChip :tone="provisionStatusChip[row.lastStatus]">{{ provisionStatus[row.lastStatus] }}</DsChip>
    </template>
    <template #lastDurationSec="{ row }">{{ durationLabel(row.lastDurationSec) }}</template>
    <template #enabled="{ row }">
      <DsChip :tone="row.enabled ? 'success' : 'neutral'">{{ row.enabled ? '활성' : '비활성' }}</DsChip>
    </template>
    <template #actions="{ row }">
      <div class="row-actions" @click.stop>
        <DsButton
          v-if="row.lastStatus === 'failed'"
          variant="secondary"
          @click="dsp.retryBatchJob(row.id)"
        >
          재실행
        </DsButton>
        <DsButton
          v-if="row.enabled"
          variant="ghost"
          @click="dsp.setBatchJobEnabled(row.id, false)"
        >
          비활성화
        </DsButton>
        <DsButton v-else variant="ghost" @click="dsp.setBatchJobEnabled(row.id, true)">활성화</DsButton>
      </div>
    </template>
  </DsTable>

  <DsModal v-if="historyJob" :title="`${historyJob.name} · 실행 이력`" @close="historyJobId = ''">
    <p class="ds-meta desc">{{ historyJob.description }}</p>
    <ul v-if="historyRuns.length" class="history">
      <li v-for="run in historyRuns" :key="run.id">
        <div>
          <span class="ds-body-strong">{{ formatDateTime(run.startedAt) }}</span>
          <span class="ds-meta">{{ run.finishedAt ? `~ ${formatDateTime(run.finishedAt)}` : '진행중' }}</span>
        </div>
        <DsChip :tone="provisionStatusChip[run.status]">{{ provisionStatus[run.status] }}</DsChip>
        <p v-if="run.message" class="ds-meta error">{{ run.message }}</p>
      </li>
    </ul>
    <DsEmpty v-else title="실행 이력이 없습니다" />
    <template #footer>
      <DsButton variant="ghost" @click="historyJobId = ''">닫기</DsButton>
    </template>
  </DsModal>
</template>

<style scoped>
.row-actions {
  display: flex;
  gap: var(--ds-space-2);
}

.desc {
  margin-bottom: var(--ds-space-4);
}

.history {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
}

.history li {
  border-bottom: 1px solid var(--ds-border-subtle);
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-3);
  padding-bottom: var(--ds-space-3);
}

.history li > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.error {
  color: var(--ds-danger);
  width: 100%;
}
</style>
