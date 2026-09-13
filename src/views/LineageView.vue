<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import LineageGraph from '../components/lineage/LineageGraph.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { useDspStore } from '../stores/dsp'

const router = useRouter()
const dsp = useDspStore()
const q = ref('')

const vis = computed(() => new Set(dsp.visibleProjects().map((p) => p.id)))

const nodes = computed(() => {
  const ds = dsp.datasets.filter((d) => vis.value.has(d.projectId)).map((d) => ({ ...d, kind: 'dataset' }))
  const jobs = dsp.jobs.filter((d) => vis.value.has(d.projectId)).map((d) => ({ ...d, kind: 'job' }))
  const models = dsp.visibleModels().map((d) => ({
    ...d,
    kind: 'modelVersion',
    label: `${d.name} ${d.version}`,
  }))
  const eps = dsp.endpoints.filter((d) => vis.value.has(d.projectId)).map((d) => ({ ...d, kind: 'endpoint' }))
  return [...ds, ...jobs, ...models, ...eps]
})

const edges = computed(() => {
  const ids = new Set(nodes.value.map((n) => n.id))
  return dsp.lineageEdges.filter((e) => ids.has(e.from) && ids.has(e.to))
})

const projects = computed(() => dsp.visibleProjects().filter((p) => nodes.value.some((n) => n.projectId === p.id)))
</script>

<template>
  <DsPageHeader title="리니지" description="데이터셋에서 엔드포인트까지 계보입니다. 노드를 열면 속성과 하류 영향을 봅니다.">
    <template #actions>
      <DsInput v-model="q" placeholder="노드 검색" width="md" />
    </template>
  </DsPageHeader>

  <DsCard>
    <LineageGraph
      v-if="nodes.length"
      :nodes="nodes"
      :edges="edges"
      :projects="projects"
      selected-id=""
      :query="q"
      :impact-ids="[]"
      @select="(n) => router.push(`/lineage/nodes/${n.id}`)"
    />
    <DsEmpty v-else title="표시할 리니지가 없습니다" />
    <ul class="legend" aria-label="노드 유형">
      <li><span class="bar dataset" />데이터셋</li>
      <li><span class="bar job" />Job</li>
      <li><span class="bar model" />모델</li>
      <li><span class="bar endpoint" />엔드포인트</li>
    </ul>
  </DsCard>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-5);
  margin-top: var(--ds-space-4);
}

.legend li {
  align-items: center;
  color: var(--ds-text-secondary);
  display: flex;
  font-size: var(--ds-font-meta);
  gap: var(--ds-space-2);
}

.bar {
  display: block;
  height: 12px;
  width: 12px;
}

.bar.dataset {
  background: var(--ds-text-tertiary);
}

.bar.job {
  background: var(--ds-info);
}

.bar.model {
  background: var(--ds-primary);
}

.bar.endpoint {
  background: var(--ds-success);
}
</style>
