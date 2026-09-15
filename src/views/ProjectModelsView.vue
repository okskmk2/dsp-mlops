<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsCard from '../components/ui/DsCard.vue'
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
const stages = ['draft', 'challenger', 'champion']
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="이 프로젝트의 모델 자산입니다." />
    <ProjectSubnav :project-id="project.id" />
    <div class="board">
      <section v-for="stage in stages" :key="stage" class="lane">
        <header><h2>{{ modelStage[stage] }}</h2><span>{{ rows.filter((model) => model.stage === stage).length }}</span></header>
        <button v-for="model in rows.filter((item) => item.stage === stage)" :key="model.id" class="model-card" type="button" @click="router.push(`/models/${model.id}`)">
          <strong>{{ model.name }} {{ model.version }}</strong>
          <span class="meta">{{ model.framework }} · {{ model.sourcePlatform === 'azure_ml' ? 'Azure ML' : 'Azure Databricks' }}</span>
          <span class="card-status"><DsChip :tone="modelStageChip[model.stage]">{{ modelStage[model.stage] }}</DsChip><DsChip :tone="monitorResultChip[model.lastMonitor]">{{ monitorResult[model.lastMonitor] }}</DsChip></span>
        </button>
        <p v-if="!rows.some((model) => model.stage === stage)" class="empty">등록된 모델이 없습니다.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.board { display: grid; gap: var(--ds-space-4); grid-template-columns: repeat(3, minmax(0, 1fr)); }
.lane { background: var(--ds-canvas-subtle); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-lg); min-height: 260px; padding: var(--ds-space-3); }
.lane header { align-items: center; display: flex; justify-content: space-between; margin-bottom: var(--ds-space-3); }
.lane h2 { font-size: var(--ds-font-label); margin: 0; }
.lane header span { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); }
.model-card { background: var(--ds-surface); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-md); color: var(--ds-text); cursor: pointer; display: flex; flex-direction: column; gap: var(--ds-space-2); margin-bottom: var(--ds-space-2); padding: var(--ds-space-3); text-align: left; width: 100%; }
.model-card:hover { border-color: var(--ds-primary); }
.meta, .empty { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); }
.card-status { display: flex; flex-wrap: wrap; gap: var(--ds-space-2); }
.empty { margin: var(--ds-space-5) 0; text-align: center; }
</style>
