<script setup>
import { Bell, Search } from '@lucide/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsAvatar from '../ui/DsAvatar.vue'
import DsIcon from '../ui/DsIcon.vue'
import { useAuthStore } from '../../stores/auth'
import { useDspStore } from '../../stores/dsp'
import { useUiStore } from '../../stores/ui'
import AvatarMenu from './AvatarMenu.vue'

const auth = useAuthStore()
const dsp = useDspStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')

const unread = computed(() => dsp.unreadNotifications().length)

function submitSearch() {
  const query = q.value.trim()
  if (!query) return
  ui.searchOpen = false
  router.push({ path: '/search', query: { q: query } })
}

function onDocClick(event) {
  if (!event.target.closest('.pop-wrap')) {
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
      <DsIcon :is="Search" :size="18" />
      <input
        v-model="q"
        type="search"
        placeholder="프로젝트, 모델, 데이터셋, 결재, 지원 검색"
        aria-label="통합 검색"
      />
    </form>
    <nav class="right" aria-label="글로벌 도구">
      <RouterLink class="gnb-item" to="/notifications">
        <DsIcon :is="Bell" :size="20" />
        <span>알림</span>
        <em v-if="unread" class="badge tabular">{{ unread }}</em>
      </RouterLink>
      <div class="pop-wrap">
        <button class="gnb-item" type="button" :aria-expanded="ui.avatarOpen" :aria-label="auth.user?.name" @click="ui.avatarOpen = !ui.avatarOpen">
          <DsAvatar :name="auth.user?.name || ''" :size="28" />
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
  background: #212121;
  border-bottom: 1px solid #272727;
  color: #ffffff;
  color-scheme: dark;
  display: flex;
  gap: var(--ds-space-3);
  grid-column: 1 / -1;
  height: var(--ds-gnb-h);
  min-width: 0;
  padding: 0 var(--ds-space-5);
  position: sticky;
  top: 0;
  z-index: var(--ds-z-gnb);
}

.brand {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-size: var(--ds-font-title-sm);
  font-weight: 600;
  flex: none;
  gap: var(--ds-space-2);
  min-width: 0;
}

.brand:hover {
  color: #ffffff;
}

.mark {
  background: var(--ds-primary);
  border-radius: 2px;
  height: 16px;
  width: 16px;
}

.search {
  align-items: center;
  background: #272727;
  border: 1px solid #3a3a3a;
  border-radius: var(--ds-radius-md);
  color: #ffffff;
  display: flex;
  flex: 1;
  gap: var(--ds-space-2);
  height: var(--ds-control-h);
  margin: 0 auto;
  max-width: 440px;
  min-width: 0;
  padding: 0 var(--ds-space-3);
}

.search:focus-within {
  border-color: var(--ds-primary);
  border-width: 2px;
  padding: 0 calc(var(--ds-space-3) - 1px);
}

.search input,
.search select {
  background: transparent;
  border: 0;
  color: #ffffff;
  flex: 1;
  font-size: var(--ds-font-label);
  height: 100%;
  outline: none;
}

.search input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.right {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--ds-space-2);
  margin-left: auto;
}

.gnb-item {
  align-items: center;
  border-radius: var(--ds-radius-md);
  color: #ffffff;
  display: inline-flex;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  min-height: 36px;
  padding: 0 var(--ds-space-3);
  position: relative;
  transition: background-color var(--ds-duration) var(--ds-easing);
}

.gnb-item:hover {
  background: #272727;
  color: #ffffff;
}

.badge {
  background: var(--ds-primary);
  border-radius: 2px;
  color: var(--ds-on-primary);
  font-size: var(--ds-font-meta);
  font-style: normal;
  font-weight: 600;
  min-width: 20px;
  padding: 0 4px;
  text-align: center;
}

.pop-wrap {
  color: var(--ds-text);
  color-scheme: light dark;
  position: relative;
}
</style>
