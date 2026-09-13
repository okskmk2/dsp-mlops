<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import {
  notificationSeverityChip,
  notificationSeverityLabel,
  notificationType,
} from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const items = computed(() => dsp.myNotifications())

function severity(type) {
  return notificationSeverityChip[type] || 'info'
}

function goto(n) {
  dsp.markRead(n.id)
  if (n.href) router.push(n.href)
}
</script>

<template>
  <DsPageHeader title="알림" description="운영 이벤트입니다. 모델 스테이지가 Draft·Challenger·Champion으로 바뀌면 프로젝트 멤버 전원에게 갑니다.">
    <template #actions>
      <DsButton variant="secondary" @click="dsp.markAllRead()">모두 읽음</DsButton>
    </template>
  </DsPageHeader>
  <ol v-if="items.length" class="list">
    <li v-for="n in items" :key="n.id" :class="{ unread: !n.read }">
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
