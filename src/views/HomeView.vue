<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DsBanner from '../components/ui/DsBanner.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsKpi from '../components/ui/DsKpi.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import {
  approvalStatus,
  approvalStatusChip,
  approvalType,
  championHealth,
  championHealthChip,
  monitorResult,
  monitorResultChip,
  noticeSeverityChip,
  projectStatus,
  projectStatusChip,
  provisionRollup,
} from '../data/labels'
import { postPath } from '../lib/support'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const kpis = computed(() => dsp.kpis())
const attention = computed(() => dsp.attentionModels())
const pending = computed(() => dsp.myPendingApprovals().slice(0, 3))
const provisioning = computed(() =>
  dsp.visibleProjects()
    .map((p) => ({ project: p, rollup: dsp.provisionRollup(p.id) }))
    .filter((x) => x.rollup === 'in_progress' || x.rollup === 'failed'),
)
const notices = computed(() => dsp.pinnedNotices())

const attentionCols = [
  { key: 'name', label: '모델', strong: true },
  { key: 'project', label: '프로젝트' },
  { key: 'stage', label: '스테이지' },
  { key: 'health', label: 'Champion 건강' },
  { key: 'monitor', label: '모니터' },
]

const approvalCols = [
  { key: 'type', label: '유형' },
  { key: 'target', label: '대상' },
  { key: 'status', label: '상태' },
]
</script>

<template>
  <DsPageHeader title="홈" description="이상 모델, 결재, 예산, 드리프트를 한눈에 봅니다.">
    <template #actions>
      <DsButton variant="primary" to="/projects/new">프로젝트 생성</DsButton>
    </template>
  </DsPageHeader>

  <div v-if="notices.length || kpis.monitorFailCount" class="banners">
    <DsBanner
      v-for="notice in notices"
      :key="notice.id"
      :tone="noticeSeverityChip[notice.severity] || 'info'"
    >
      {{ notice.title }}
      <template #action>
        <DsButton variant="secondary" :to="postPath(notice)">공지</DsButton>
      </template>
    </DsBanner>
    <DsBanner v-if="kpis.monitorFailCount" tone="danger">
      모니터 실패 모델이 {{ kpis.monitorFailCount }}건입니다. 기준치와 드리프트를 확인하세요.
      <template #action>
        <DsButton variant="secondary" to="/monitoring">현황</DsButton>
      </template>
    </DsBanner>
  </div>

  <section class="kpis">
    <DsKpi label="Champion" :value="kpis.championCount" to="/models?stage=champion" />
    <DsKpi label="모니터 실패" :value="kpis.monitorFailCount" :alert="kpis.monitorFailCount > 0" to="/monitoring?result=fail" />
    <DsKpi label="드리프트 경보" :value="kpis.driftCount" :alert="kpis.driftCount > 0" to="/monitoring" />
    <DsKpi label="예산 초과 프로젝트" :value="kpis.overBudgetProjectCount" :alert="kpis.overBudgetProjectCount > 0" to="/cost" />
  </section>

  <section class="grid">
    <DsCard>
      <template #title>주의 모델</template>
      <template #action>
        <DsButton variant="ghost" to="/models">레지스트리</DsButton>
      </template>
      <DsTable
        :columns="attentionCols"
        :rows="attention"
        empty-title="주의가 필요한 모델이 없습니다"
        @row-click="(row) => router.push(`/models/${row.id}`)"
      >
        <template #name="{ row }">{{ row.name }} {{ row.version }}</template>
        <template #project="{ row }">{{ dsp.projectById(row.projectId)?.name }}</template>
        <template #health="{ row }">
          <DsChip v-if="row.championHealth" :tone="championHealthChip[row.championHealth]">
            {{ championHealth[row.championHealth] }}
          </DsChip>
          <span v-else class="ds-meta">—</span>
        </template>
        <template #monitor="{ row }">
          <DsChip :tone="monitorResultChip[row.lastMonitor]">{{ monitorResult[row.lastMonitor] }}</DsChip>
        </template>
      </DsTable>
    </DsCard>

    <DsCard>
      <template #title>내 결재</template>
      <template #action>
        <DsButton variant="ghost" to="/approvals">결재함</DsButton>
      </template>
      <DsTable
        :columns="approvalCols"
        :rows="pending"
        empty-title="대기 중인 결재가 없습니다"
        @row-click="(row) => router.push(`/approvals/${row.id}`)"
      >
        <template #type="{ row }">{{ approvalType[row.type] }}</template>
        <template #target="{ row }">
          {{ dsp.approvalTarget(row).name }}
        </template>
        <template #status="{ row }">
          <DsChip :tone="approvalStatusChip[row.status]">{{ approvalStatus[row.status] }}</DsChip>
        </template>
      </DsTable>
    </DsCard>

    <DsCard>
      <template #title>프로비저닝</template>
      <p class="ds-meta">부가 작업입니다. 프로젝트 관리 상태를 바꾸지 않습니다.</p>
      <ul v-if="provisioning.length" class="prov">
        <li v-for="item in provisioning" :key="item.project.id">
          <RouterLink :to="`/projects/${item.project.id}/resources`">
            <span class="ds-body-strong">{{ item.project.name }}</span>
            <DsChip :tone="item.rollup === 'failed' ? 'danger' : 'info'">{{ provisionRollup[item.rollup] }}</DsChip>
          </RouterLink>
          <DsChip :tone="projectStatusChip[item.project.status]">{{ projectStatus[item.project.status] }}</DsChip>
        </li>
      </ul>
      <DsEmpty v-else title="진행 중인 프로비저닝이 없습니다" />
    </DsCard>
  </section>
</template>

<style scoped>
.banners {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-section-gap);
}

.kpis {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: repeat(4, 1fr);
  margin: 0 0 var(--ds-section-gap);
}

.grid {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: 1.4fr 1fr;
}

.grid > :last-child {
  grid-column: 1 / -1;
}

.prov {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}

.prov li {
  align-items: center;
  display: flex;
  gap: var(--ds-space-3);
  justify-content: space-between;
  min-height: 36px;
}

.prov a {
  align-items: center;
  color: var(--ds-text);
  display: flex;
  gap: var(--ds-space-3);
}

.prov a:hover {
  color: var(--ds-text);
}
</style>
