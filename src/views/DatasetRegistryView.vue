<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { modelStage, modelStageChip } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const search = ref('')
const projectFilter = ref('')
const stageFilter = ref('')

const projectOptions = computed(() => dsp.visibleProjects().map((project) => ({ value: project.id, label: project.name })))
const visibleDatasets = computed(() => {
  const projectIds = new Set(dsp.visibleProjects().map((project) => project.id))
  return dsp.datasets.filter((dataset) => projectIds.has(dataset.projectId))
})
const rows = computed(() => {
  const term = search.value.trim().toLowerCase()
  return visibleDatasets.value.filter((dataset) => {
    if (projectFilter.value && dataset.projectId !== projectFilter.value) return false
    if (stageFilter.value && dataset.stage !== stageFilter.value) return false
    if (!term) return true
    const project = dsp.projectById(dataset.projectId)
    return `${dataset.name} ${dataset.ref} ${project?.name ?? ''}`.toLowerCase().includes(term)
  })
})

const columns = [
  { key: 'name', label: '데이터셋', strong: true },
  { key: 'project', label: '프로젝트' },
  { key: 'stage', label: '스테이지' },
  { key: 'columns', label: '컬럼 수', numeric: true },
  { key: 'ref', label: '참조' },
]

function resetFilters() {
  search.value = ''
  projectFilter.value = ''
  stageFilter.value = ''
}

function open(row) {
  router.push(`/datasets/${row.id}`)
}
</script>

<template>
  <DsPageHeader title="데이터셋" description="권한 범위 안의 데이터셋과 스키마를 탐색합니다." />

  <div class="filters" role="search">
    <DsInput v-model="search" placeholder="데이터셋 또는 참조 검색" width="lg" />
    <DsSelect v-model="projectFilter" :options="projectOptions" placeholder="프로젝트 전체" />
    <DsSelect
      v-model="stageFilter"
      :options="Object.entries(modelStage).map(([value, label]) => ({ value, label }))"
      placeholder="스테이지 전체"
      width="sm"
    />
    <DsButton v-if="search || projectFilter || stageFilter" variant="ghost" @click="resetFilters">필터 초기화</DsButton>
  </div>

  <DsEmpty v-if="!rows.length" title="조건에 맞는 데이터셋이 없습니다" description="검색어나 필터 조건을 변경해 보세요." />
  <DsTable v-else :columns="columns" :rows="rows" @row-click="open">
    <template #project="{ row }">{{ dsp.projectById(row.projectId)?.name }}</template>
    <template #stage="{ row }">
      <DsChip :tone="modelStageChip[row.stage]">{{ modelStage[row.stage] }}</DsChip>
    </template>
    <template #columns="{ row }">{{ row.columns.length }}</template>
    <template #ref="{ row }"><span class="mono">{{ row.ref }}</span></template>
  </DsTable>
</template>

<style scoped>
.filters {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-3);
  margin-bottom: var(--ds-space-5);
}

.mono {
  color: var(--ds-text-secondary);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-font-meta);
}
</style>
