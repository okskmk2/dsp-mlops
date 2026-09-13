<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { notificationType } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const items = computed(() => dsp.myNotifications())

function goto(n) {
  dsp.markRead(n.id)
  if (n.href) router.push(n.href)
}
</script>

<template>
  <DsPageHeader title="알림" description="운영 이벤트입니다.">
    <template #actions>
      <DsButton variant="secondary" @click="dsp.markAllRead()">모두 읽음</DsButton>
    </template>
  </DsPageHeader>
  <ol v-if="items.length" class="list">
    <li v-for="n in items" :key="n.id" :class="{ unread: !n.read }">
      <button type="button" @click="goto(n)">
        <span class="ds-meta">{{ notificationType[n.type] }} · {{ formatDateTime(n.createdAt) }}</span>
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
}

.list li:last-child {
  border-bottom: 0;
}

.unread {
  background: var(--ds-primary-subtle);
}

button {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
  padding: var(--ds-space-4) var(--ds-space-5);
  text-align: left;
  width: 100%;
}

button:hover {
  background: var(--ds-canvas-subtle);
}
</style>
