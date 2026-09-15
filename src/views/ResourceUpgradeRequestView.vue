<script setup>
import { computed, ref } from 'vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { platformType, provisionStatus, provisionStatusChip } from '../data/labels'
import { computeClassById, computeClassLabel, currentClassId, higherClasses, isWorkspaceProvision } from '../lib/compute'
import { formatWon } from '../lib/format'
import { canWriteProject } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const projectId = ref('')

const eligibleProjects = computed(() =>
  dsp
    .visibleProjects()
    .filter((p) => p.status === 'active' && canWriteProject(auth.user, p, dsp.members, 'requestComputeUpgrade')),
)

const projectOptions = computed(() => eligibleProjects.value.map((p) => ({ value: p.id, label: p.name })))

const workspaces = computed(() =>
  projectId.value
    ? dsp.provisions.filter((p) => p.projectId === projectId.value && isWorkspaceProvision(p))
    : [],
)

const columns = [
  { key: 'platform', label: '플랫폼' },
  { key: 'currentClass', label: '현재 등급' },
  { key: 'monthly', label: '월 비용', numeric: true },
  { key: 'status', label: '상태' },
  { key: 'action', label: '' },
]

const rows = computed(() =>
  workspaces.value.map((item) => ({
    id: item.id,
    platform: platformType[item.platform],
    currentClass: computeClassLabel(dsp.computeClasses, currentClassId(item)),
    monthly: formatWon(computeClassById(dsp.computeClasses, currentClassId(item))?.monthlyCost),
    statusKey: item.status,
    provisionId: item.id,
    hasUpgrade: item.status === 'succeeded' && higherClasses(dsp.computeClasses, item).length > 0,
    pending: dsp.hasInFlightComputeUpgrade(projectId.value, item.platform),
  })),
)
</script>

<template>
  <DsPageHeader
    title="리소스 업그레이드 요청"
    description="프로젝트의 AML/ADB 워크스페이스에 대해 컴퓨팅 등급(GPU 등) 상향을 신청합니다."
  />

  <DsCard>
    <template #title>프로젝트 선택</template>
    <DsSelect v-model="projectId" :options="projectOptions" placeholder="프로젝트 선택" width="full" />
  </DsCard>

  <DsCard v-if="projectId" class="ds-follow">
    <template #title>워크스페이스</template>
    <DsTable v-if="rows.length" :columns="columns" :rows="rows">
      <template #status="{ row }">
        <DsChip :tone="provisionStatusChip[row.statusKey]">{{ provisionStatus[row.statusKey] }}</DsChip>
        <DsChip v-if="row.pending" tone="warning">상향 결재 대기</DsChip>
      </template>
      <template #action="{ row }">
        <DsButton
          v-if="row.hasUpgrade && !row.pending"
          variant="primary"
          :to="`/projects/${projectId}/resources/${row.provisionId}/upgrade`"
        >
          업그레이드 신청
        </DsButton>
      </template>
    </DsTable>
    <DsEmpty v-else title="워크스페이스가 없습니다" description="프로비저닝된 AML/ADB 자산이 없습니다." />
  </DsCard>
</template>
