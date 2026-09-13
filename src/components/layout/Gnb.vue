<script setup>
import { Bell, ClipboardCheck, Activity, Search } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsIcon from '../ui/DsIcon.vue'
import { useAuthStore } from '../../stores/auth'
import { useDspStore } from '../../stores/dsp'
import { useUiStore } from '../../stores/ui'
import AvatarMenu from './AvatarMenu.vue'
import MonitorPopover from './MonitorPopover.vue'

const auth = useAuthStore()
const dsp = useDspStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')

const pendingApprovals = computed(() => dsp.approvals.filter((a) => a.status === 'pending' && a.approverId === auth.user?.id).length)
const unread = computed(() => dsp.unreadNotifications().length)

function submitSearch() {
  const query = q.value.trim()
  if (!query) return
  ui.searchOpen = false
  router.push({ path: '/search', query: { q: query } })
}

function onDocClick(event) {
  if (!event.target.closest('.pop-wrap')) {
    ui.monitorOpen = false
    ui.avatarOpen = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header class="gnb">
    <RouterLink class="brand" to="/home">
      <span class="mark" aria-hidden="true" />
      <span>DS Platform</span>
    </RouterLink>
    <form class="search" role="search" @submit.prevent="submitSearch">
      <DsIcon :is="Search" :size="20" />
      <input
        v-model="q"
        type="search"
        placeholder="프로젝트, 모델, 데이터셋, 결재 검색"
        aria-label="통합 검색"
      />
    </form>
    <nav class="right" aria-label="글로벌 도구">
      <RouterLink class="gnb-item" to="/approvals">
        <DsIcon :is="ClipboardCheck" :size="24" />
        <span>결재함</span>
        <em v-if="pendingApprovals" class="badge tabular">{{ pendingApprovals }}</em>
      </RouterLink>
      <RouterLink class="gnb-item" to="/notifications">
        <DsIcon :is="Bell" :size="24" />
        <span>알림</span>
        <em v-if="unread" class="badge tabular">{{ unread }}</em>
      </RouterLink>
      <div class="pop-wrap">
        <button class="gnb-item" type="button" :aria-expanded="ui.monitorOpen" @click="ui.monitorOpen = !ui.monitorOpen; ui.avatarOpen = false">
          <DsIcon :is="Activity" :size="24" />
          <span>모니터링</span>
        </button>
        <MonitorPopover v-if="ui.monitorOpen" />
      </div>
      <div class="pop-wrap">
        <button class="gnb-item" type="button" :aria-expanded="ui.avatarOpen" :aria-label="auth.user?.name" @click="ui.avatarOpen = !ui.avatarOpen; ui.monitorOpen = false">
          <span class="avatar">{{ auth.user?.initials }}</span>
          <span>{{ auth.user?.name }}</span>
        </button>
        <AvatarMenu v-if="ui.avatarOpen" />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.gnb {
  align-items: center;
  background: var(--ds-surface);
  border-bottom: 1px solid var(--ds-border);
  display: flex;
  gap: var(--ds-space-4);
  grid-column: 1 / -1;
  height: var(--ds-gnb-h);
  padding: 0 var(--ds-space-6);
  position: sticky;
  top: 0;
  z-index: var(--ds-z-gnb);
}

.brand {
  align-items: center;
  color: var(--ds-text);
  display: flex;
  font-size: var(--ds-font-title-sm);
  font-weight: 600;
  gap: var(--ds-space-2);
  min-width: 12rem;
}

.brand:hover {
  color: var(--ds-text);
}

.mark {
  background: var(--ds-primary);
  border-radius: 0.1111rem;
  height: 1.3333rem;
  width: 1.3333rem;
}

.search {
  align-items: center;
  background: var(--ds-surface-sunken);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text-secondary);
  display: flex;
  flex: 1;
  gap: var(--ds-space-2);
  height: var(--ds-control-h);
  margin: 0 auto;
  max-width: 31.1111rem;
  padding: 0 var(--ds-space-3);
}

.search:focus-within {
  border-color: var(--ds-primary);
  border-width: 2px;
  padding: 0 calc(var(--ds-space-3) - 1px);
}

.search input {
  background: transparent;
  border: 0;
  color: var(--ds-text);
  flex: 1;
  font-size: var(--ds-font-body);
  height: 100%;
  outline: none;
}

.search input::placeholder {
  color: var(--ds-text-tertiary);
}

.right {
  align-items: center;
  display: flex;
  gap: var(--ds-space-2);
  margin-left: auto;
}

.gnb-item {
  align-items: center;
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  display: inline-flex;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  min-height: 2.4444rem;
  padding: 0 var(--ds-space-3);
  position: relative;
  transition: background-color var(--ds-duration) var(--ds-easing);
}

.gnb-item:hover {
  background: var(--ds-canvas-subtle);
  color: var(--ds-text);
}

.badge {
  background: var(--ds-primary);
  border-radius: 999px;
  color: var(--ds-on-primary);
  font-size: var(--ds-font-meta);
  font-style: normal;
  font-weight: 600;
  min-width: 1.3333rem;
  padding: 0 0.3333rem;
  text-align: center;
}

.avatar {
  align-items: center;
  background: var(--ds-primary-subtle);
  border: 1px solid var(--ds-border);
  border-radius: 999px;
  color: var(--ds-primary);
  display: inline-flex;
  font-size: var(--ds-font-meta);
  font-weight: 600;
  height: 1.5556rem;
  justify-content: center;
  width: 1.5556rem;
}

.pop-wrap {
  position: relative;
}
</style>
