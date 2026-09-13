<script setup>
import { platformRole } from '../data/labels'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function enter(id) {
  auth.login(id)
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
  router.replace(redirect)
}
</script>

<template>
  <div class="login">
    <section class="panel">
      <p class="ds-meta">내부 MLOps 관제</p>
      <h1 class="ds-display">DS Platform</h1>
      <p class="ds-body">역할에 맞는 계정으로 들어가 권한 범위를 확인합니다. 학습 UI는 클라우드 콘솔에서 엽니다.</p>
      <ul>
        <li v-for="u in auth.directory.filter((x) => x.enabled !== false)" :key="u.id">
          <button type="button" @click="enter(u.id)">
            <span class="avatar">{{ u.initials }}</span>
            <span class="who">
              <strong>{{ u.name }}</strong>
              <span class="ds-meta">{{ platformRole[u.platformRole] }} · {{ u.title }}{{ u.isApprover ? ' · 승인권자' : '' }}</span>
            </span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.login {
  align-items: center;
  background: var(--ds-canvas-subtle);
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: var(--ds-space-6);
}

.panel {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
  max-width: 640px;
  padding: var(--ds-space-6);
  width: 100%;
}

ul {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  margin-top: var(--ds-space-3);
}

li button {
  align-items: center;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  display: flex;
  gap: var(--ds-space-3);
  min-height: 44px;
  padding: var(--ds-space-3) var(--ds-space-4);
  text-align: left;
  transition: background-color var(--ds-duration) var(--ds-easing);
  width: 100%;
}

li button:hover {
  background: var(--ds-canvas-subtle);
}

.avatar {
  align-items: center;
  background: var(--ds-primary-subtle);
  border: 1px solid var(--ds-border);
  border-radius: 999px;
  color: var(--ds-primary);
  display: inline-flex;
  font-weight: 600;
  height: 36px;
  justify-content: center;
  width: 36px;
}

.who {
  display: flex;
  flex-direction: column;
}
</style>
