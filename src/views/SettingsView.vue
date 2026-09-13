<script setup>
import { reactive } from 'vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsCheckbox from '../components/ui/DsCheckbox.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import { platformRole } from '../data/labels'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const auth = useAuthStore()
const dsp = useDspStore()
const ui = useUiStore()
const form = reactive({
  notifyInapp: dsp.settings.notifyInapp,
  notifyEmail: dsp.settings.notifyEmail,
})

function save() {
  dsp.patchSettings({ notifyInapp: form.notifyInapp, notifyEmail: form.notifyEmail })
  ui.toast('설정을 저장했습니다.')
}
</script>

<template>
  <DsPageHeader title="설정" :description="`${auth.user.name} · ${platformRole[auth.user.platformRole]}`" />

  <div class="stack">
    <DsCard>
      <template #title>프로필</template>
      <p class="ds-body">{{ auth.user.email }}</p>
      <p class="ds-meta">{{ auth.user.title }}{{ auth.user.isApprover ? ' · 승인권자' : '' }}</p>
    </DsCard>

    <DsCard>
      <template #title>화면</template>
      <DsField label="테마">
        <DsSelect
          :model-value="auth.themePref"
          :options="[
            { value: 'system', label: '시스템' },
            { value: 'light', label: '라이트' },
            { value: 'dark', label: '다크' },
          ]"
          placeholder=""
          @update:model-value="auth.setThemePref($event)"
        />
      </DsField>
    </DsCard>

    <DsCard>
      <template #title>알림</template>
      <DsCheckbox v-model="form.notifyInapp" label="앱 알림" />
      <DsCheckbox v-model="form.notifyEmail" label="이메일 (선택)" />
      <div class="ds-actions">
        <DsButton variant="primary" @click="save">저장</DsButton>
      </div>
    </DsCard>

    <DsCard>
      <template #title>역할 체험</template>
      <p class="ds-meta">데모용으로 다른 플랫폼 역할로 다시 들어갑니다.</p>
      <DsField label="계정">
        <DsSelect
          :model-value="auth.user.id"
          :options="auth.directory.filter((u) => u.enabled !== false).map((u) => ({ value: u.id, label: `${u.name} · ${platformRole[u.platformRole]}` }))"
          placeholder=""
          width="lg"
          @update:model-value="auth.login($event)"
        />
      </DsField>
    </DsCard>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--ds-section-gap);
  max-width: 640px;
}
</style>
