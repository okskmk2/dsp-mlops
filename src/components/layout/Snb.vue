<script setup>
import {
  Activity,
  CircleHelp,
  ClipboardList,
  FolderKanban,
  House,
  Shield,
} from '@lucide/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DsIcon from '../ui/DsIcon.vue'
import { canManageDspSettings } from '../../lib/permissions'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const auth = useAuthStore()
const isAdmin = computed(() => canManageDspSettings(auth.user))

const items = [
  { id: 'home', label: '홈', route: '/home', icon: House },
  {
    id: 'browse',
    label: '프로젝트·모델',
    icon: FolderKanban,
    children: [
      { id: 'projectList', label: '프로젝트', route: '/projects' },
      { id: 'registry', label: '모델 레지스트리', route: '/models' },
      { id: 'modelStatus', label: '모델 현황', route: '/models/promotions' },
    ],
  },
  {
    id: 'requests',
    label: '신청',
    icon: ClipboardList,
    children: [
      { id: 'projectCreate', label: '프로젝트 생성', route: '/projects/new' },
      { id: 'requestList', label: '분석 요청', route: '/requests' },
      { id: 'requestForm', label: '분석 요청 작성', route: '/requests/new' },
      { id: 'modelPromoteRequest', label: '모델 승격', route: '/models/promote-request' },
      { id: 'resourceUpgradeRequest', label: '리소스 업그레이드', route: '/resources/upgrade-request' },
    ],
  },
  {
    id: 'ops',
    label: '운영 현황',
    icon: Activity,
    children: [
      { id: 'monitorStatus', label: '모니터', route: '/monitoring' },
      { id: 'resourceStatus', label: '리소스', route: '/ml-ops' },
      { id: 'cost', label: '비용', route: '/cost' },
      { id: 'lineageExplore', label: '리니지', route: '/lineage' },
    ],
  },
  {
    id: 'help',
    label: '안내',
    icon: CircleHelp,
    children: [
      { id: 'notices', label: '공지사항', route: '/support/notices' },
      { id: 'guides', label: '서비스 가이드', route: '/support/guides' },
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
    { id: 'adminBatch', label: '배치관리', route: '/admin/batch' },
    { id: 'adminUsage', label: '사용자 사용 통계', route: '/admin/usage' },
  ],
}

function isActive(path) {
  if (path === '/home') return route.path === '/home'
  if (path === '/projects') return route.path === '/projects'
  if (path === '/models') return route.path === '/models'
  if (path === '/models/promotions') return route.path === '/models/promotions'
  if (path === '/models/promote-request') return route.path === '/models/promote-request'
  if (path === '/ml-ops') return route.path.startsWith('/ml-ops')
  if (path === '/resources/upgrade-request') return route.path === '/resources/upgrade-request'
  if (path === '/monitoring') return route.path.startsWith('/monitoring')
  if (path === '/cost') return route.path.startsWith('/cost')
  if (path === '/lineage') return route.path.startsWith('/lineage')
  if (path === '/requests') return route.path === '/requests' || (route.path.startsWith('/requests/') && route.path !== '/requests/new')
  if (path === '/support/notices') return route.path.startsWith('/support/notices')
  if (path === '/support/guides') return route.path.startsWith('/support/guides')
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <nav class="snb" aria-label="주 메뉴">
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
