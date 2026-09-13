<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsBanner from '../components/ui/DsBanner.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsField from '../components/ui/DsField.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsModal from '../components/ui/DsModal.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import {
  approvalStatus,
  approvalStatusChip,
  approvalType,
  platformType,
  projectStatus,
  projectStatusChip,
  provisionRollup,
  provisionStatus,
  provisionStatusChip,
} from '../data/labels'
import { formatDate, formatWon } from '../lib/format'
import { canOpenCloud, canRetryProvisioning, canWriteProject } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()
const id = computed(() => route.params.id)
const project = computed(() => dsp.projectById(id.value))
const teamCount = computed(() => dsp.members.filter((m) => m.projectId === id.value).length)
const modelCount = computed(() => dsp.models.filter((m) => m.projectId === id.value).length)
const items = computed(() => dsp.provisions.filter((p) => p.projectId === id.value))
const history = computed(() => dsp.approvals.filter((a) => a.payloadRef === id.value))
const pendingClose = computed(() =>
  history.value.some((a) => a.type === 'project_close' && a.status === 'pending'),
)
const rollup = computed(() => dsp.provisionRollup(id.value))
const budgetOpen = ref(false)
const newBudget = ref('')

function openCloud() {
  const ok = items.value.find((p) => p.status === 'succeeded')
  if (ok) window.open(`https://ml.azure.com/?ws=${ok.cloudResourceId}`, '_blank', 'noreferrer')
}
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" :description="project.goal">
      <template #actions>
        <DsButton
          v-if="canWriteProject(auth.user, project, dsp.members, 'manageMembersLimited')"
          variant="secondary"
          :to="`/projects/${project.id}/team`"
        >
          팀 편집
        </DsButton>
        <DsButton
          v-if="canWriteProject(auth.user, project, dsp.members, 'budgetDeadlineSubmit')"
          variant="ghost"
          @click="newBudget = String(project.budgetAmount); budgetOpen = true"
        >
          예산변경 상신
        </DsButton>
        <DsButton
          v-if="canOpenCloud(auth.user, project, dsp.provisions, dsp.members)"
          variant="ghost"
          @click="openCloud"
        >
          워크스페이스에서 열기
        </DsButton>
        <DsButton
          v-if="canWriteProject(auth.user, project, dsp.members, 'closeProjectSubmit')"
          variant="danger"
          @click="dsp.submitClose(project.id)"
        >
          종료 신청
        </DsButton>
      </template>
    </DsPageHeader>
    <ProjectSubnav :project-id="project.id" />

    <div class="chips">
      <DsChip :tone="projectStatusChip[project.status]">{{ projectStatus[project.status] }}</DsChip>
      <DsChip v-if="rollup !== 'none'" :tone="rollup === 'failed' ? 'danger' : rollup === 'succeeded' ? 'success' : 'info'">
        {{ provisionRollup[rollup] }}
      </DsChip>
    </div>

    <DsBanner v-if="pendingClose" tone="warning">종료 품의가 진행 중입니다. 승인 전까지 프로젝트는 운영중으로 유지됩니다.</DsBanner>
    <DsBanner v-if="rollup === 'failed'" tone="danger">
      프로비저닝 실패 항목이 있습니다. 프로젝트 상태는 운영중 그대로입니다.
      <template v-if="canRetryProvisioning(auth.user)" #action>
        <DsButton
          variant="secondary"
          @click="items.filter((i) => i.status === 'failed').forEach((i) => dsp.retryProvisioning(i.id))"
        >
          재시도
        </DsButton>
      </template>
    </DsBanner>

    <div class="two">
      <DsCard>
        <template #title>정의</template>
        <dl class="ds-dl">
          <div><dt>오너</dt><dd>{{ dsp.userById(project.ownerUserId)?.name }}</dd></div>
          <div><dt>배경</dt><dd>{{ project.background }}</dd></div>
          <div><dt>기술 스택</dt><dd>{{ (project.techStack || []).join(', ') || '—' }}</dd></div>
          <div><dt>기간</dt><dd>{{ formatDate(project.startAt) }} – {{ formatDate(project.endAt) }}</dd></div>
          <div><dt>예산</dt><dd class="tabular">{{ formatWon(project.budgetAmount) }} · 사용 {{ dsp.budgetUsedPct(project) }}%</dd></div>
          <div><dt>플랫폼</dt><dd>{{ project.platforms.map((p) => platformType[p]).join(', ') }}</dd></div>
          <div><dt>팀</dt><dd>{{ teamCount }}명</dd></div>
          <div><dt>모델</dt><dd>{{ modelCount }}개</dd></div>
        </dl>
      </DsCard>
      <DsCard>
        <template #title>타임라인</template>
        <ol class="tl">
          <li v-for="a in history" :key="a.id">
            <div>
              <span class="ds-body-strong">{{ approvalType[a.type] }}</span>
              <DsChip :tone="approvalStatusChip[a.status]">{{ approvalStatus[a.status] }}</DsChip>
            </div>
            <p class="ds-meta">{{ dsp.userById(a.requesterId)?.name }} · {{ formatDate(a.createdAt) }}</p>
          </li>
          <li v-for="p in items" :key="p.id">
            <div>
              <span class="ds-body-strong">{{ platformType[p.platform] }} 프로비저닝</span>
              <DsChip :tone="provisionStatusChip[p.status]">{{ provisionStatus[p.status] }}</DsChip>
            </div>
            <p class="ds-meta">{{ p.cloudResourceId || p.errorMessage || '부가 작업' }}</p>
          </li>
        </ol>
      </DsCard>
    </div>

    <DsModal v-if="budgetOpen" title="예산 변경 상신" size="sm" @close="budgetOpen = false">
      <DsField label="새 예산 (KRW)">
        <DsInput v-model="newBudget" type="number" width="full" />
      </DsField>
      <template #footer>
        <DsButton variant="ghost" @click="budgetOpen = false">취소</DsButton>
        <DsButton
          variant="primary"
          @click="dsp.submitBudgetChange(project.id, newBudget); budgetOpen = false"
        >
          상신
        </DsButton>
      </template>
    </DsModal>
  </div>
  <p v-else class="ds-body">프로젝트를 찾을 수 없습니다.</p>
</template>

<style scoped>
.chips {
  display: flex;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-space-5);
}

.two {
  display: grid;
  gap: var(--ds-space-6);
  grid-template-columns: 1fr 1fr;
  margin-top: var(--ds-space-6);
}

.tl {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-4);
}

.tl li div {
  align-items: center;
  display: flex;
  gap: var(--ds-space-2);
}
</style>
