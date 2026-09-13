<script setup>
import {
  Activity,
  CircleHelp,
  FolderKanban,
  House,
  Plus,
  Shield,
} from '@lucide/vue'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsIcon from '../ui/DsIcon.vue'
import { canManageDspSettings } from '../../lib/permissions'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const isAdmin = computed(() => canManageDspSettings(auth.user))

const showQuickMenu = ref(false)

function toggleQuickMenu() {
  showQuickMenu.value = !showQuickMenu.value
}

function handleQuickAction(path) {
  showQuickMenu.value = false
  router.push(path)
}

function onDocClick(event) {
  if (!event.target.closest('.quick-action-wrap')) {
    showQuickMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))

const items = [
  { id: 'home', label: '홈', route: '/home', icon: House },
  {
    id: 'assets',
    label: 'ML 자산',
    icon: FolderKanban,
    children: [
      { id: 'projectList', label: '프로젝트 목록', route: '/projects' },
      { id: 'registry', label: '모델 레지스트리', route: '/models' },
    ],
  },
  {
    id: 'ops',
    label: '관제 & 거버넌스',
    icon: Activity,
    children: [
      { id: 'monitorStatus', label: '모니터링 & 드리프트', route: '/monitoring' },
      { id: 'lineageExplore', label: '리니지 & 오염 분석', route: '/lineage' },
      { id: 'costByProject', label: '비용 & 리소스', route: '/cost' },
    ],
  },
  {
    id: 'support',
    label: '지원 & 요청',
    icon: CircleHelp,
    children: [
      { id: 'requestList', label: '분석 요청', route: '/requests' },
      { id: 'guides', label: '가이드 & 공지사항', route: '/support/guides' },
    ],
  },
]

const adminItem = {
  id: 'admin',
  label: '관리자',
  icon: Shield,
  children: [
    { id: 'adminUsers', label: '사용자 관리', route: '/admin/users' },
    { id: 'adminPermissions', label: '권한 관리', route: '/admin/permissions' },
    { id: 'adminCodes', label: '코드 관리', route: '/admin/codes' },
  ],
}

function isActive(path) {
  if (path === '/home') return route.path === '/home'
  if (path === '/projects') return route.path === '/projects'
  if (path === '/models') return route.path === '/models'
  if (path === '/monitoring') return route.path.startsWith('/monitoring')
  if (path === '/cost') return route.path.startsWith('/cost')
  if (path === '/lineage') return route.path.startsWith('/lineage')
  if (path === '/requests') return route.path === '/requests' || (route.path.startsWith('/requests/') && route.path !== '/requests/new')
  if (path === '/support/guides') return route.path.startsWith('/support')
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="snb" aria-label="주 메뉴">
    <!-- Quick Action Button -->
    <div class="quick-action-wrap">
      <button class="quick-btn" type="button" @click="toggleQuickMenu">
        <DsIcon :is="Plus" :size="16" />
        <span>신규 요청</span>
      </button>
      <div v-if="showQuickMenu" class="quick-menu" role="menu">
        <button type="button" class="quick-item" @click="handleQuickAction('/projects/new')">
          <span>프로젝트 생성 신청</span>
        </button>
        <button type="button" class="quick-item" @click="handleQuickAction('/requests/new')">
          <span>분석 요청하기</span>
        </button>
      </div>
    </div>

    <div class="snb-main">
      <div v-for="item in items" :key="item.id" class="group">
        <RouterLink
          v-if="!item.children"
          class="item"
          :class="{ 'is-active': isActive(item.route) }"
          :to="item.route"
        >
          <DsIcon :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
        <p v-else class="group-label">
          <DsIcon :is="item.icon" :size="18" />
          {{ item.label }}
        </p>
        <RouterLink
          v-for="child in item.children || []"
          :key="child.id"
          class="item is-child"
          :class="{ 'is-active': isActive(child.route) }"
          :to="child.route"
        >
          {{ child.label }}
        </RouterLink>
      </div>
    </div>

    <div v-if="isAdmin" class="snb-admin">
      <p class="group-label">
        <DsIcon :is="adminItem.icon" :size="18" />
        {{ adminItem.label }}
      </p>
      <RouterLink
        v-for="child in adminItem.children"
        :key="child.id"
        class="item is-child"
        :class="{ 'is-active': isActive(child.route) }"
        :to="child.route"
      >
        {{ child.label }}
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.snb {
  background: var(--ds-canvas-subtle);
  border-right: 1px solid var(--ds-border);
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--ds-gnb-h));
  overflow: auto;
  padding: var(--ds-space-3) var(--ds-space-3);
  position: sticky;
  top: var(--ds-gnb-h);
}

.quick-action-wrap {
  margin-bottom: var(--ds-space-3);
  position: relative;
}

.quick-btn {
  align-items: center;
  background: var(--ds-primary);
  border: none;
  border-radius: var(--ds-radius-md);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  justify-content: center;
  min-height: 38px;
  transition: opacity 0.15s ease;
  width: 100%;
}

.quick-btn:hover {
  opacity: 0.9;
}

.quick-menu {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-lg);
  display: flex;
  flex-direction: column;
  left: 0;
  padding: var(--ds-space-1);
  position: absolute;
  top: calc(100% + 4px);
  width: 100%;
  z-index: 100;
}

.quick-item {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-sm);
  color: var(--ds-text);
  cursor: pointer;
  display: flex;
  font-size: var(--ds-font-label);
  padding: var(--ds-space-2) var(--ds-space-3);
  text-align: left;
  width: 100%;
}

.quick-item:hover {
  background: var(--ds-canvas-subtle);
  color: var(--ds-primary);
}

.snb-main {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.group + .group {
  margin-top: var(--ds-space-2);
}

.snb-admin {
  border-top: 1px solid var(--ds-border);
  margin-top: var(--ds-space-4);
  padding-top: var(--ds-space-3);
}

.group-label {
  align-items: center;
  color: var(--ds-text-tertiary);
  display: flex;
  font-size: var(--ds-font-meta);
  gap: var(--ds-space-2);
  padding: var(--ds-space-2) var(--ds-space-2) var(--ds-space-1);
}

.item {
  align-items: center;
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  display: flex;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  min-height: 34px;
  padding: 0 var(--ds-space-3);
  position: relative;
}

.item:hover {
  background: var(--ds-surface);
  color: var(--ds-text);
}

.item.is-child {
  font-weight: 400;
  padding-left: 32px;
}

.item.is-active {
  background: var(--ds-primary-subtle);
  color: var(--ds-primary);
  font-weight: 600;
}

.item.is-active::before {
  background: var(--ds-primary);
  content: '';
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 3px;
}
</style>
