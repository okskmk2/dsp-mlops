<script setup>
import { computed } from 'vue'
import { ExternalLink } from '@lucide/vue'
import { useRoute } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { platformType, provisionStatus, provisionStatusChip } from '../data/labels'
import { formatDateTime } from '../lib/format'
import { canRetryProvisioning } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()
const project = computed(() => dsp.projectById(route.params.id))
const items = computed(() => dsp.provisions.filter((p) => p.projectId === route.params.id))
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="프로비저닝된 AML/ADB 자산입니다. 클러스터 생성·직접 삭제는 제공하지 않습니다." />
    <ProjectSubnav :project-id="project.id" />
    <div v-if="items.length" class="cards">
      <DsCard v-for="item in items" :key="item.id">
        <template #title>{{ platformType[item.platform] }}</template>
        <DsChip :tone="provisionStatusChip[item.status]">{{ provisionStatus[item.status] }}</DsChip>
        <p class="mono">{{ item.cloudResourceId || 'cloudResourceId 없음' }}</p>
        <p v-if="item.errorMessage" class="err">{{ item.errorMessage }}</p>
        <p class="ds-meta">요청 {{ formatDateTime(item.createdAt) }}</p>
        <div class="row">
          <DsButton
            v-if="item.status === 'succeeded'"
            variant="secondary"
            :icon="ExternalLink"
            :href="`https://ml.azure.com/?ws=${item.cloudResourceId}`"
          >
            워크스페이스에서 열기
          </DsButton>
          <DsButton
            v-if="item.status === 'failed' && canRetryProvisioning(auth.user) && project.status !== 'closed'"
            variant="primary"
            @click="dsp.retryProvisioning(item.id)"
          >
            재시도
          </DsButton>
        </div>
      </DsCard>
    </div>
    <DsEmpty v-else title="프로비저닝 건이 없습니다" description="생성 결재가 승인되면 플랫폼별로 부가 작업이 붙습니다." />
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: var(--ds-space-6);
  grid-template-columns: repeat(2, minmax(20rem, 1fr));
}

.row {
  display: flex;
  gap: var(--ds-space-2);
  margin-top: var(--ds-space-2);
}

.err {
  color: var(--ds-danger);
}
</style>
