<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import { modelStage, monitorResult, monitorResultChip } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.search === 'string' ? route.query.search : '')
const projectFilter = ref(typeof route.query.project === 'string' ? route.query.project : '')
const monitorFilter = ref(typeof route.query.monitor === 'string' ? route.query.monitor : '')
const stages = ['draft', 'challenger', 'champion']

const projectOptions = computed(() => dsp.visibleProjects().map((project) => ({ value: project.id, label: project.name })))
const models = computed(() => {
  const term = search.value.trim().toLowerCase()
  return dsp.visibleModels().filter((model) => {
    if (projectFilter.value && model.projectId !== projectFilter.value) return false
    if (monitorFilter.value && model.lastMonitor !== monitorFilter.value) return false
    if (!term) return true
    const project = dsp.projectById(model.projectId)
    return `${project?.name ?? ''} ${model.name} ${model.framework}`.toLowerCase().includes(term)
  })
})
const totalModels = computed(() => models.value.length)

function resetFilters() {
  search.value = ''
  projectFilter.value = ''
  monitorFilter.value = ''
}

watch([search, projectFilter, monitorFilter], ([nextSearch, nextProject, nextMonitor]) => {
  const query = { ...route.query }
  if (nextSearch) query.search = nextSearch
  else delete query.search
  if (nextProject) query.project = nextProject
  else delete query.project
  if (nextMonitor) query.monitor = nextMonitor
  else delete query.monitor
  router.replace({ query })
})

function modelsForStage(stage) {
  return models.value.filter((model) => model.stage === stage)
}
</script>

<template>
  <DsPageHeader title="모델현황" description="프로젝트별 모델 스테이지와 모니터링 상태를 비교합니다." />
  <div class="filters" role="search">
    <DsInput v-model="search" placeholder="프로젝트 또는 모델 검색" width="lg" />
    <DsSelect v-model="projectFilter" :options="projectOptions" placeholder="프로젝트 전체" />
    <DsSelect
      v-model="monitorFilter"
      :options="[
        { value: 'pass', label: '정상' },
        { value: 'fail', label: '실패' },
        { value: 'no_data', label: '데이터 없음' },
      ]"
      placeholder="모니터 상태 전체"
    />
    <DsButton v-if="search || projectFilter || monitorFilter" variant="ghost" size="sm" @click="resetFilters">
      필터 초기화
    </DsButton>
  </div>
  <p class="result-summary">현재 필터 결과 {{ totalModels }}개 모델</p>
  <div v-if="totalModels" class="board">
    <section v-for="stage in stages" :key="stage" class="lane">
      <h3>{{ modelStage[stage] }} <span>{{ modelsForStage(stage).length }}</span></h3>
      <button
        v-for="model in modelsForStage(stage)"
        :key="model.id"
        class="model-card"
        type="button"
        @click="router.push(`/models/${model.id}`)"
      >
        <strong>{{ model.name }} {{ model.version }}</strong>
        <span class="meta">{{ dsp.projectById(model.projectId)?.name }}</span>
        <DsChip :tone="monitorResultChip[model.lastMonitor]">
          모니터 {{ monitorResult[model.lastMonitor] }}
        </DsChip>
      </button>
      <p v-if="!modelsForStage(stage).length" class="empty">아직 모델 없음</p>
    </section>
  </div>
  <DsEmpty v-else title="조건에 맞는 모델이 없습니다" description="검색어나 필터 조건을 변경해 보세요." />
</template>

<style scoped>
.filters { align-items: center; display: flex; flex-wrap: wrap; gap: var(--ds-space-3); margin-bottom: var(--ds-space-2); }
.result-summary { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); margin: 0 0 var(--ds-space-5); }
.board { display: grid; gap: var(--ds-space-4); grid-template-columns: repeat(3, minmax(0, 1fr)); }
.lane { display: flex; flex-direction: column; gap: var(--ds-space-3); min-height: 180px; min-width: 0; }
.lane h3 { background: var(--ds-canvas); font-size: var(--ds-font-title-sm); margin: 0; padding-bottom: var(--ds-space-1); position: sticky; top: 0; z-index: 1; }
.lane h3 span { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); font-weight: 400; }
.meta, .empty { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); }
.model-card { align-items: flex-start; background: var(--ds-surface); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-md); color: var(--ds-text); cursor: pointer; display: flex; flex-direction: column; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); min-height: 104px; padding: var(--ds-space-3); text-align: left; width: 100%; }
.model-card:hover { border-color: var(--ds-primary); }
.model-card:focus-visible { outline: 2px solid var(--ds-focus-ring); outline-offset: 2px; }
.empty { margin: var(--ds-space-3) 0; }
</style>
