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
import { platformType, provisionKind, provisionStatus, provisionStatusChip } from '../data/labels'
import {
  computeClassById,
  computeClassLabel,
  currentClassId,
  higherClasses,
  isWorkspaceProvision,
} from '../lib/compute'
import { formatDateTime, formatWon } from '../lib/format'
import { canRetryProvisioning, canWriteProject } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()
const project = computed(() => dsp.projectById(route.params.id))
const items = computed(() => dsp.provisions.filter((p) => p.projectId === route.params.id))
const workspaces = computed(() => items.value.filter((p) => isWorkspaceProvision(p)))

const canRequest = computed(
  () =>
    project.value &&
    canWriteProject(auth.user, project.value, dsp.members, 'requestComputeUpgrade'),
)

function upgradesOf(workspace) {
  return items.value
    .filter((p) => p.kind === 'compute_upgrade' && p.platform === workspace.platform)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

function pendingHref(platform) {
  const pending = dsp.pendingComputeUpgrade(project.value.id, platform)
  return pending ? `/approvals/${pending.id}` : '/approvals'
}

function cloudUrl(item) {
  if (item.platform === 'azure_databricks') {
    return `https://adb.azuredatabricks.net/?o=${item.cloudResourceId}`
  }
  return `https://ml.azure.com/?ws=${item.cloudResourceId}`
}
</script>

<template>
  <div v-if="project">
    <DsPageHeader
      :title="project.name"
      description="프로비저닝된 AML/ADB 자산입니다. 컴퓨팅 상향은 카탈로그 등급만 신청하며, 클러스터 생성·직접 삭제는 제공하지 않습니다."
    />
    <ProjectSubnav :project-id="project.id" />
    <div v-if="workspaces.length" class="cards">
      <DsCard v-for="item in workspaces" :key="item.id">
        <template #title>{{ platformType[item.platform] }}</template>
        <div class="chips">
          <DsChip :tone="provisionStatusChip[item.status]">{{ provisionStatus[item.status] }}</DsChip>
          <DsChip
            v-if="dsp.pendingComputeUpgrade(project.id, item.platform)"
            tone="warning"
          >
            상향 결재 대기
          </DsChip>
        </div>
        <dl class="ds-dl">
          <div>
            <dt>컴퓨팅 등급</dt>
            <dd>{{ computeClassLabel(dsp.computeClasses, currentClassId(item)) }}</dd>
          </div>
          <div>
            <dt>월 추정</dt>
            <dd class="tabular">
              {{ formatWon(computeClassById(dsp.computeClasses, currentClassId(item))?.monthlyCost) }}
            </dd>
          </div>
          <div>
            <dt>리소스</dt>
            <dd class="mono">{{ item.cloudResourceId || 'cloudResourceId 없음' }}</dd>
          </div>
        </dl>
        <p v-if="item.errorMessage" class="err">{{ item.errorMessage }}</p>
        <p class="ds-meta">요청 {{ formatDateTime(item.createdAt) }}</p>
        <div class="row">
          <DsButton
            v-if="item.status === 'succeeded'"
            variant="secondary"
            :icon="ExternalLink"
            :href="cloudUrl(item)"
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
          <DsButton
            v-if="
              canRequest &&
              item.status === 'succeeded' &&
              !dsp.hasInFlightComputeUpgrade(project.id, item.platform) &&
              higherClasses(dsp.computeClasses, item).length
            "
            variant="primary"
            :to="`/projects/${project.id}/resources/${item.id}/upgrade`"
          >
            컴퓨팅 상향 신청
          </DsButton>
          <DsButton
            v-else-if="dsp.pendingComputeUpgrade(project.id, item.platform)"
            variant="ghost"
            :to="pendingHref(item.platform)"
          >
            결재함에서 보기
          </DsButton>
        </div>
        <ul v-if="upgradesOf(item).length" class="hist">
          <li v-for="up in upgradesOf(item)" :key="up.id">
            <span class="ds-meta">{{ provisionKind[up.kind] }}</span>
            <DsChip :tone="provisionStatusChip[up.status]">{{ provisionStatus[up.status] }}</DsChip>
            <span class="ds-meta">
              {{ computeClassLabel(dsp.computeClasses, up.fromSpec?.computeClass) }}
              →
              {{ computeClassLabel(dsp.computeClasses, up.toSpec?.computeClass) }}
            </span>
            <DsButton
              v-if="up.status === 'failed' && canRetryProvisioning(auth.user) && project.status !== 'closed'"
              variant="ghost"
              @click="dsp.retryProvisioning(up.id)"
            >
              재시도
            </DsButton>
          </li>
        </ul>
      </DsCard>
    </div>
    <DsEmpty v-else title="프로비저닝 건이 없습니다" description="생성 결재가 승인되면 플랫폼별로 부가 작업이 붙습니다." />
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
  margin-top: var(--ds-space-2);
}

.err {
  color: var(--ds-danger);
}

.hist {
  border-top: 1px solid var(--ds-border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  margin-top: var(--ds-space-3);
  padding-top: var(--ds-space-3);
}

.hist li {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
  min-height: 36px;
}

.tabular {
  font-variant-numeric: tabular-nums;
}
</style>
