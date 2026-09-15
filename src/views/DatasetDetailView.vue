<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsTable from '../components/ui/DsTable.vue'
import { modelStage, modelStageChip, nodeType } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const dsp = useDspStore()

const dataset = computed(() => dsp.datasetById(route.params.id))
const columns = computed(() => dataset.value?.columns || [])

const columnTableColumns = [
  { key: 'name', label: '컬럼명', strong: true },
  { key: 'dataType', label: '타입' },
  { key: 'nullable', label: 'Null 허용' },
  { key: 'description', label: '설명' },
]

// direct downstream consumers only (jobs or models fed straight from this dataset)
const consumers = computed(() => {
  if (!dataset.value) return []
  return dsp.lineageEdges
    .filter((e) => e.from === dataset.value.id)
    .map((e) => {
      const job = dsp.jobs.find((j) => j.id === e.to)
      if (job) return { id: job.id, kind: 'job', name: job.name, projectId: job.projectId, to: `/lineage/nodes/${job.id}` }
      const model = dsp.modelById(e.to)
      if (model) return { id: model.id, kind: 'modelVersion', name: `${model.name} ${model.version}`, stage: model.stage, projectId: model.projectId, to: `/models/${model.id}` }
      return { id: e.to, kind: 'unknown', name: e.to, to: `/lineage/nodes/${e.to}` }
    })
})

// projects that reuse this shared dataset, derived from its consumers
const usingProjects = computed(() => {
  const ids = new Set(consumers.value.map((c) => c.projectId).filter(Boolean))
  return [...ids].map((id) => dsp.projectById(id)).filter(Boolean)
})
</script>

<template>
  <div v-if="dataset">
    <DsBreadcrumb
      :items="[
        { label: '리니지', to: '/lineage' },
        { label: dataset.name },
      ]"
    />
    <h1 class="ds-title-lg">{{ dataset.name }}</h1>
    <p class="ds-meta subtitle">공유 데이터셋 · {{ usingProjects.length }}개 프로젝트에서 사용</p>

    <div class="actions">
      <DsButton variant="ghost" :to="`/lineage/nodes/${dataset.id}`">계보 탐색</DsButton>
    </div>

    <DsCard>
      <template #title>속성</template>
      <dl class="ds-dl">
        <div>
          <dt>유형</dt>
          <dd>{{ nodeType.dataset }}</dd>
        </div>
        <div>
          <dt>ID</dt>
          <dd class="mono">{{ dataset.id }}</dd>
        </div>
        <div>
          <dt>참조</dt>
          <dd class="mono">{{ dataset.ref }}</dd>
        </div>
        <div>
          <dt>사용 프로젝트</dt>
          <dd v-if="usingProjects.length" class="project-links">
            <RouterLink v-for="p in usingProjects" :key="p.id" :to="`/projects/${p.id}`">{{ p.name }}</RouterLink>
          </dd>
          <dd v-else>—</dd>
        </div>
      </dl>
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>컬럼 정보</template>
      <DsTable
        v-if="columns.length"
        :columns="columnTableColumns"
        :rows="columns"
        row-key="name"
        empty-title="컬럼 정보가 없습니다"
      >
        <template #name="{ row }"><span class="mono">{{ row.name }}</span></template>
        <template #dataType="{ row }"><span class="mono">{{ row.dataType }}</span></template>
        <template #nullable="{ row }">{{ row.nullable ? '허용' : '불허' }}</template>
      </DsTable>
      <DsEmpty v-else title="컬럼 정보가 없습니다" />
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>사용 현황</template>
      <template #action>
        <DsButton variant="ghost" :to="`/lineage/nodes/${dataset.id}`">하류 영향 전체보기</DsButton>
      </template>
      <ul v-if="consumers.length" class="consumers">
        <li v-for="c in consumers" :key="c.id">
          <RouterLink :to="c.to">
            <span class="ds-meta">{{ nodeType[c.kind] || c.kind }}</span>
            <span class="ds-body-strong">{{ c.name }}</span>
            <span v-if="c.projectId" class="ds-meta">{{ dsp.projectById(c.projectId)?.name }}</span>
            <DsChip v-if="c.stage" :tone="modelStageChip[c.stage]">{{ modelStage[c.stage] }}</DsChip>
          </RouterLink>
        </li>
      </ul>
      <DsEmpty v-else title="이 데이터셋을 직접 소비하는 Job/모델이 없습니다" />
    </DsCard>
  </div>
  <p v-else class="ds-body">데이터셋을 찾을 수 없습니다.</p>
</template>

<style scoped>
.subtitle {
  margin-bottom: var(--ds-space-4);
}

.actions {
  display: flex;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-section-gap);
}

.consumers {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}

.consumers a {
  align-items: center;
  color: var(--ds-text);
  display: flex;
  gap: var(--ds-space-3);
}

.consumers a:hover {
  color: var(--ds-primary);
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}
</style>
