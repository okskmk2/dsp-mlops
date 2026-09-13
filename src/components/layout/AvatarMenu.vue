<script setup>
import { LogOut, Settings } from '@lucide/vue'
import { useRouter } from 'vue-router'
import DsIcon from '../ui/DsIcon.vue'
import { platformRole } from '../../data/labels'
import { useAuthStore } from '../../stores/auth'
import { useUiStore } from '../../stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

function go(path) {
  ui.avatarOpen = false
  router.push(path)
}

function logout() {
  ui.avatarOpen = false
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="menu" role="menu">
    <p class="who">
      <strong>{{ auth.user.name }}</strong>
      <span class="ds-meta">{{ platformRole[auth.user.platformRole] }} · {{ auth.user.title }}</span>
    </p>
    <button type="button" role="menuitem" @click="go('/settings')">
      <DsIcon :is="Settings" :size="20" />
      설정
    </button>
    <button type="button" role="menuitem" @click="logout">
      <DsIcon :is="LogOut" :size="20" />
      로그아웃
    </button>
  </div>
</template>

<style scoped>
.menu {
  background: var(--ds-surface-raised);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  min-width: 16rem;
  padding: var(--ds-space-3);
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: var(--ds-z-dropdown);
}

.who {
  border-bottom: 1px solid var(--ds-border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: var(--ds-space-2);
  padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-3);
}

.menu button {
  align-items: center;
  border-radius: var(--ds-radius-md);
  display: flex;
  font-size: var(--ds-font-label);
  font-weight: 600;
  gap: var(--ds-space-2);
  min-height: 2.4444rem;
  padding: 0 var(--ds-space-3);
  width: 100%;
}

.menu button:hover {
  background: var(--ds-canvas-subtle);
}
</style>
