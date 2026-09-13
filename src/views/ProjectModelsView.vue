<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import { modelStage, modelStageChip, monitorResult, monitorResultChip } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const project = computed(() => dsp.projectById(route.params.id))
const rows = computed(() => dsp.models.filter((m) => m.projectId === route.params.id))
const columns = [
  { key: 'name', label: '모델', strong: true },
  { key: 'version', label: '버전' },
  { key: 'stage', label: '스테이지' },
  { key: 'lastMonitor', label: '모니터' },
  { key: 'driftScore', label: '드리프트', numeric: true },
]
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="이 프로젝트의 모델 자산입니다." />
    <ProjectSubnav :project-id="project.id" />
    <DsTable :columns="columns" :rows="rows" @row-click="(r) => router.push(`/models/${r.id}`)">
      <template #stage="{ row }">
        <DsChip :tone="modelStageChip[row.stage]">{{ modelStage[row.stage] }}</DsChip>
      </template>
      <template #lastMonitor="{ row }">
        <DsChip :tone="monitorResultChip[row.lastMonitor]">{{ monitorResult[row.lastMonitor] }}</DsChip>
      </template>
    </DsTable>
  </div>
</template>
