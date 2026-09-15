<script setup>
import { computed, ref } from 'vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { modelStage, modelStageChip, monitorResult, monitorResultChip } from '../data/labels'
import { hasProjectRole } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const auth = useAuthStore()
const dsp = useDspStore()
const projectId = ref('')

const eligibleProjects = computed(() =>
  dsp
    .visibleProjects()
    .filter((p) => p.status === 'active' && hasProjectRole(auth.user, p.id, dsp.members, ['owner', 'coordinator'])),
)

const projectOptions = computed(() => eligibleProjects.value.map((p) => ({ value: p.id, label: p.name })))

const challengers = computed(() =>
  projectId.value ? dsp.models.filter((m) => m.projectId === projectId.value && m.stage === 'challenger') : [],
)

const columns = [
  { key: 'name', label: '모델', strong: true },
  { key: 'version', label: '버전' },
  { key: 'stage', label: '스테이지' },
  { key: 'monitor', label: '모니터' },
  { key: 'action', label: '' },
]
</script>

<template>
  <DsPageHeader
    title="ML 자산 승격 요청"
    description="Challenger 모델을 Champion(prod)으로 승격하는 결재를 상신합니다."
  />

  <DsCard>
    <template #title>프로젝트 선택</template>
    <DsSelect v-model="projectId" :options="projectOptions" placeholder="프로젝트 선택" width="full" />
  </DsCard>

  <DsCard v-if="projectId" class="ds-follow">
    <template #title>Challenger 모델</template>
    <DsTable v-if="challengers.length" :columns="columns" :rows="challengers">
      <template #stage="{ row }">
        <DsChip :tone="modelStageChip[row.stage]">{{ modelStage[row.stage] }}</DsChip>
      </template>
      <template #monitor="{ row }">
        <DsChip :tone="monitorResultChip[row.lastMonitor]">{{ monitorResult[row.lastMonitor] }}</DsChip>
      </template>
      <template #action="{ row }">
        <DsButton variant="primary" :to="`/models/${row.id}/promote`">승격 요청</DsButton>
      </template>
    </DsTable>
    <DsEmpty v-else title="승격 대상이 없습니다" description="이 프로젝트에는 Challenger 단계 모델이 없습니다." />
  </DsCard>
</template>
