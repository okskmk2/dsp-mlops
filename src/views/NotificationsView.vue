<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTabs from '../components/ui/DsTabs.vue'
import {
  notificationSeverityChip,
  notificationSeverityLabel,
  notificationType,
} from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

// 헤더의 결재함·모니터링 진입점을 대신해 여기서 유형별로 구분한다.
const segments = [
  { id: 'all', label: '전체', types: null },
  { id: 'approval', label: '결재', types: ['approval_done'] },
  { id: 'monitoring', label: '모니터링', types: ['monitor_fail', 'drift_alert', 'champion_at_risk'] },
  { id: 'resource', label: '리소스', types: ['provision_done', 'provision_failed', 'budget_80', 'budget_100'] },
  { id: 'model', label: '모델', types: ['model_stage_change'] },
  { id: 'support', label: '지원', types: ['notice_published', 'analysis_request_submitted', 'analysis_request_updated'] },
]

const dsp = useDspStore()
const router = useRouter()
const segment = ref('all')
const items = computed(() => dsp.myNotifications())

function countOf(types) {
  return types ? items.value.filter((n) => types.includes(n.type)).length : items.value.length
}

const tabs = computed(() => segments.map((s) => ({ id: s.id, label: `${s.label} ${countOf(s.types)}` })))

const filtered = computed(() => {
  const types = segments.find((s) => s.id === segment.value)?.types
  return types ? items.value.filter((n) => types.includes(n.type)) : items.value
})

function severity(type) {
  return notificationSeverityChip[type] || 'info'
}

function goto(n) {
  dsp.markRead(n.id)
  if (n.href) router.push(n.href)
}
</script>

<template>
  <DsPageHeader title="알림" description="운영 이벤트입니다. 결재 대기, 모니터링 경보를 포함한 모든 알림을 여기서 확인합니다.">
    <template #actions>
      <DsButton variant="secondary" @click="dsp.markAllRead()">모두 읽음</DsButton>
    </template>
  </DsPageHeader>
  <DsTabs v-model="segment" :tabs="tabs" />
  <ol v-if="filtered.length" class="list">
    <li v-for="n in filtered" :key="n.id" :class="{ unread: !n.read }">
      <button type="button" @click="goto(n)">
        <span class="meta-row">
          <DsChip :tone="severity(n.type)">{{ notificationSeverityLabel[severity(n.type)] }}</DsChip>
          <span class="ds-label">{{ notificationType[n.type] }}</span>
          <span class="ds-meta">{{ formatDateTime(n.createdAt) }}</span>
        </span>
        <span class="ds-body-strong">{{ n.title }}</span>
        <span class="ds-body">{{ n.body }}</span>
      </button>
    </li>
  </ol>
  <DsEmpty v-else title="알림이 없습니다" />
</template>

<style scoped>
.list {
  border: 1px solid var(--ds-border);
  display: flex;
  flex-direction: column;
  margin-top: var(--ds-space-4);
}

.list li {
  border-bottom: 1px solid var(--ds-border-subtle);
  position: relative;
}

.list li:last-child {
  border-bottom: 0;
}

.unread::before {
  background: var(--ds-primary);
  content: '';
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 3px;
}

button {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  padding: var(--ds-space-4) var(--ds-space-5);
  text-align: left;
  width: 100%;
}

button:hover {
  background: var(--ds-canvas-subtle);
}

.meta-row {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}
</style>
