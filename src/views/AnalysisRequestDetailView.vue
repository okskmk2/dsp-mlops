<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import {
  analysisRequestStatus,
  analysisRequestStatusChip,
  fulfillmentIntent,
} from '../data/labels'
import { formatDate, formatDateTime } from '../lib/format'
import { canTriageAnalysisRequest } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()
const projectId = ref('')
const rejectReason = ref('')

const row = computed(() => dsp.analysisRequestById(route.params.id))
const allowed = computed(() => row.value && dsp.canSeeAnalysisRequest(row.value))
const isAdmin = computed(() => canTriageAnalysisRequest(auth.user))
const open = computed(() => row.value && ['submitted', 'reviewing'].includes(row.value.status))
const canStartProject = computed(() => {
  if (!row.value) return false
  if (['submitted', 'reviewing'].includes(row.value.status)) {
    return isAdmin.value || row.value.requesterId === auth.user?.id
  }
  return false
})

const projectOptions = computed(() =>
  dsp
    .visibleProjects()
    .filter((p) => p.status === 'active')
    .map((p) => ({ value: p.id, label: p.name })),
)

const linked = computed(() => dsp.projectById(row.value?.linkedProjectId))
const related = computed(() => dsp.projectById(row.value?.relatedProjectId))

function beginReview() {
  dsp.startRequestReview(row.value.id)
}

function link() {
  dsp.linkRequestToProject(row.value.id, projectId.value)
}

function reject() {
  dsp.rejectAnalysisRequest(row.value.id, rejectReason.value)
}
</script>

<template>
  <DsEmpty v-if="!allowed" title="요청을 찾을 수 없습니다">
    <DsButton variant="secondary" to="/requests">목록</DsButton>
  </DsEmpty>
  <div v-else>
    <DsBreadcrumb :items="[{ label: '분석요청', to: '/requests' }, { label: row.title }]" />
    <DsPageHeader :title="row.title" description="전자결재가 아닙니다. 수용되면 기존 과제에 붙거나 프로젝트 생성 신청으로 이어집니다.">
      <template #actions>
        <DsButton
          v-if="canStartProject"
          variant="secondary"
          :to="{ path: '/projects/new', query: { fromRequest: row.id } }"
        >
          새 프로젝트 생성
        </DsButton>
        <DsButton v-if="isAdmin && ['linked_existing', 'new_project'].includes(row.status)" variant="secondary" @click="dsp.completeAnalysisRequest(row.id)">
          완료
        </DsButton>
        <DsButton variant="ghost" to="/requests">목록</DsButton>
      </template>
    </DsPageHeader>

    <div class="layout" :class="{ 'has-aside': isAdmin && open }">
      <div class="main">
        <DsCard>
          <template #title>의뢰 내용</template>
          <dl class="ds-dl">
            <div>
              <dt>상태</dt>
              <dd>
                <DsChip :tone="analysisRequestStatusChip[row.status]">{{ analysisRequestStatus[row.status] }}</DsChip>
              </dd>
            </div>
            <div>
              <dt>요청자</dt>
              <dd>{{ dsp.userById(row.requesterId)?.name }}</dd>
            </div>
            <div>
              <dt>희망 경로</dt>
              <dd>{{ fulfillmentIntent[row.fulfillmentIntent] }}</dd>
            </div>
            <div>
              <dt>희망 기한</dt>
              <dd>{{ formatDate(row.dueAt) }}</dd>
            </div>
            <div>
              <dt>관련 프로젝트</dt>
              <dd>{{ related?.name || '—' }}</dd>
            </div>
            <div>
              <dt>배정 프로젝트</dt>
              <dd>
                <RouterLink v-if="linked" :to="linked.status === 'draft' ? { path: '/projects/new', query: { draft: linked.id } } : `/projects/${linked.id}`">
                  {{ linked.name }}
                </RouterLink>
                <template v-else>—</template>
              </dd>
            </div>
            <div>
              <dt>담당</dt>
              <dd>{{ dsp.userById(row.assigneeId)?.name || '—' }}</dd>
            </div>
            <div>
              <dt>접수</dt>
              <dd>{{ formatDateTime(row.createdAt) }}</dd>
            </div>
          </dl>
        </DsCard>

        <DsCard>
          <template #title>문제</template>
          <p class="article ds-body">{{ row.problem }}</p>
        </DsCard>
        <DsCard v-if="row.businessContext">
          <template #title>업무 배경</template>
          <p class="article ds-body">{{ row.businessContext }}</p>
        </DsCard>
        <DsCard>
          <template #title>기대 결과</template>
          <p class="article ds-body">{{ row.desiredOutcome }}</p>
        </DsCard>
        <DsCard v-if="row.dataDescription">
          <template #title>보유 데이터</template>
          <p class="article ds-body">{{ row.dataDescription }}</p>
        </DsCard>
        <DsCard v-if="row.rejectReason">
          <template #title>반려 사유</template>
          <p class="article ds-body">{{ row.rejectReason }}</p>
        </DsCard>
      </div>

      <aside v-if="isAdmin && open">
        <DsCard>
          <template #title>운영 처리</template>
          <p class="ds-meta">기존 과제에 모델을 더하거나, 새 프로젝트 생성 신청으로 넘깁니다.</p>
          <DsButton v-if="row.status === 'submitted'" variant="secondary" @click="beginReview">검토 시작</DsButton>
          <DsField label="기존 프로젝트">
            <DsSelect v-model="projectId" :options="projectOptions" placeholder="프로젝트 선택" width="full" />
          </DsField>
          <DsButton variant="primary" :disabled="!projectId" @click="link">기존 프로젝트에 배정</DsButton>
          <DsField label="반려 사유">
            <DsTextarea v-model="rejectReason" :rows="3" />
          </DsField>
          <DsButton variant="danger" @click="reject">반려</DsButton>
        </DsCard>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.layout {
  align-items: start;
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: minmax(0, 1fr);
}

.layout.has-aside {
  grid-template-columns: minmax(0, 1fr) 356px;
}

.main,
aside {
  display: flex;
  flex-direction: column;
  gap: var(--ds-section-gap);
}

.article {
  white-space: pre-wrap;
}

aside :deep(.ds-btn) {
  width: 100%;
}
</style>
