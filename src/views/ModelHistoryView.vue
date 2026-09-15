<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModelSubnav from '../components/layout/ModelSubnav.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { approvalStatus, approvalStatusChip, approvalType, monitorResult, monitorResultChip } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const dsp = useDspStore()
const model = computed(() => dsp.modelById(route.params.id))
const project = computed(() => model.value && dsp.projectById(model.value.projectId))

const history = computed(() => {
  if (!model.value) return []
  const modelId = model.value.id
  const events = []

  dsp.approvals
    .filter((approval) => approval.payloadRef === modelId)
    .forEach((approval) => {
      events.push({
        id: `approval-${approval.id}`,
        at: approval.decidedAt || approval.createdAt,
        type: approvalType[approval.type] || '승인',
        title: approval.type === 'champion_promote' ? 'Champion 승격 승인 요청' : approval.type === 'champion_demote' ? 'Champion 강등 승인 요청' : '모델 관련 승인',
        detail: `${dsp.userById(approval.requesterId)?.name || '요청자'}가 요청했습니다.`,
        status: approval.status,
        tone: approvalStatusChip[approval.status],
        statusLabel: approvalStatus[approval.status],
      })
    })

  dsp.retrainRequests
    .filter((request) => request.modelId === modelId)
    .forEach((request) => {
      events.push({
        id: `retrain-${request.id}`,
        at: request.requestedAt,
        type: '재학습',
        title: '모델 재학습 요청',
        detail: request.reason,
        statusLabel: request.status === 'queued' ? '대기' : request.status,
        tone: request.status === 'queued' ? 'warning' : 'info',
      })
    })

  dsp.monitorRules
    .filter((rule) => rule.modelId === modelId)
    .forEach((rule) => {
      const check = dsp.latestCheck(rule.id)
      if (!check) return
      events.push({
        id: `monitor-${check.id}`,
        at: check.checkedAt,
        type: '모니터링',
        title: `${rule.metricName} 기준 검사`,
        detail: `기준 ${rule.operator} ${rule.threshold} · 실측 ${check.actualValue}`,
        statusLabel: monitorResult[check.result],
        tone: monitorResultChip[check.result],
      })
    })

  dsp.notifications
    .filter((notification) => notification.href?.includes(`/models/${modelId}`) && notification.type === 'model_stage_change')
    .forEach((notification) => {
      events.push({
        id: notification.id,
        at: notification.createdAt,
        type: '스테이지',
        title: notification.title,
        detail: notification.body,
        statusLabel: '변경 기록',
        tone: 'info',
      })
    })

  return events.sort((a, b) => (a.at < b.at ? 1 : -1))
})
</script>

<template>
  <div v-if="model && project">
    <DsPageHeader :title="`${model.name} ${model.version}`" :description="project.name" />
    <ModelSubnav :model-id="model.id" />
    <DsCard>
      <template #title>모델 이력</template>
      <p class="intro">승인, 스테이지 변경, 재학습, 모니터링 검사의 감사 추적 기록입니다.</p>
      <ol v-if="history.length" class="timeline">
        <li v-for="event in history" :key="event.id">
          <div class="marker" />
          <div class="event">
            <div class="event-head">
              <span class="event-type">{{ event.type }}</span>
              <time>{{ formatDateTime(event.at) }}</time>
            </div>
            <strong>{{ event.title }}</strong>
            <p>{{ event.detail }}</p>
            <DsChip v-if="event.statusLabel" :tone="event.tone">{{ event.statusLabel }}</DsChip>
          </div>
        </li>
      </ol>
      <p v-else class="ds-meta">기록된 이력이 없습니다.</p>
    </DsCard>
  </div>
</template>

<style scoped>
.intro { color: var(--ds-text-secondary); margin: calc(-1 * var(--ds-space-2)) 0 var(--ds-space-2); }
.timeline { display: flex; flex-direction: column; gap: var(--ds-space-4); }
.timeline li { display: grid; gap: var(--ds-space-3); grid-template-columns: 12px 1fr; }
.marker { background: var(--ds-primary); border-radius: 50%; height: 8px; margin-top: 6px; width: 8px; }
.event { border-bottom: 1px solid var(--ds-border-subtle); display: flex; flex-direction: column; gap: var(--ds-space-2); padding-bottom: var(--ds-space-4); }
.event-head { align-items: center; display: flex; gap: var(--ds-space-3); }
.event-type, time { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); }
.event strong { font-size: var(--ds-font-label); }
.event p { color: var(--ds-text-secondary); margin: 0; }
</style>
