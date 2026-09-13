<script setup>
import {
  Activity,
  Boxes,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  FolderKanban,
  GitBranch,
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
    id: 'projects',
    label: '프로젝트',
    route: '/projects',
    icon: FolderKanban,
    children: [
      { id: 'projectList', label: '목록', route: '/projects' },
      { id: 'projectCreate', label: '생성 신청', route: '/projects/new' },
    ],
  },
  {
    id: 'models',
    label: '모델',
    route: '/models',
    icon: Boxes,
    children: [
      { id: 'registry', label: '레지스트리', route: '/models' },
      { id: 'promotionInbox', label: '승격 요청', route: '/models/promotions' },
    ],
  },
  {
    id: 'monitoring',
    label: '모니터링',
    route: '/monitoring',
    icon: Activity,
    children: [
      { id: 'monitorStatus', label: '현황', route: '/monitoring' },
      { id: 'thresholds', label: '기준치', route: '/monitoring/thresholds' },
      { id: 'drift', label: '드리프트', route: '/monitoring/drift' },
    ],
  },
  {
    id: 'cost',
    label: '비용·활용',
    route: '/cost',
    icon: CircleDollarSign,
    children: [
      { id: 'costByProject', label: '프로젝트별', route: '/cost' },
      { id: 'costByResource', label: '리소스별', route: '/cost/resources' },
    ],
  },
  {
    id: 'lineage',
    label: '리니지',
    route: '/lineage',
    icon: GitBranch,
    children: [
      { id: 'lineageExplore', label: '탐색', route: '/lineage' },
      { id: 'contamination', label: '오염 구간', route: '/lineage/contamination' },
    ],
  },
  {
    id: 'support',
    label: '지원·지식',
    icon: CircleHelp,
    children: [
      { id: 'guides', label: '사용법', route: '/support/guides' },
      { id: 'notices', label: '공지사항', route: '/support/notices' },
    ],
  },
  {
    id: 'requests',
    label: '분석요청',
    icon: ClipboardList,
    children: [
      { id: 'requestList', label: '목록', route: '/requests' },
      { id: 'requestCreate', label: '요청하기', route: '/requests/new' },
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
  if (path === '/monitoring') return route.path === '/monitoring'
  if (path === '/cost') return route.path === '/cost'
  if (path === '/lineage') return route.path === '/lineage' || route.path.startsWith('/lineage/nodes/')
  if (path === '/requests') return route.path === '/requests' || (route.path.startsWith('/requests/') && route.path !== '/requests/new')
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
  margin-top: var(--ds-space-3);
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
  padding: var(--ds-space-3) var(--ds-space-2) var(--ds-space-2);
}

.item {
  align-items: center;
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  display: flex;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  min-height: 36px;
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
