<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import LineageGraph from '../components/lineage/LineageGraph.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { collapseLineage } from '../lib/lineage'
import { useDspStore } from '../stores/dsp'

const router = useRouter()
const dsp = useDspStore()
const q = ref('')

const vis = computed(() => new Set(dsp.visibleProjects().map((p) => p.id)))

const jobs = computed(() => dsp.jobs.filter((d) => vis.value.has(d.projectId)))
const models = computed(() => dsp.visibleModels().map((d) => ({
  ...d,
  kind: 'modelVersion',
  label: `${d.name} ${d.version}`,
  projectName: dsp.projectById(d.projectId)?.name,
})))
const includedIds = computed(() => new Set([...jobs.value.map((j) => j.id), ...models.value.map((m) => m.id)]))

const rawNodes = computed(() => {
  const ds = dsp.datasets
    .filter((d) => dsp.lineageEdges.some((e) => e.from === d.id && includedIds.value.has(e.to)))
    .map((d) => ({ ...d, kind: 'dataset' }))
  const jobNodes = jobs.value.map((d) => ({ ...d, kind: 'job' }))
  const eps = dsp.endpoints
    .filter((e) => dsp.lineageEdges.some((edge) => edge.to === e.id && includedIds.value.has(edge.from)))
    .map((e) => ({ ...e, kind: 'endpoint' }))
  return [...ds, ...jobNodes, ...models.value, ...eps]
})

const rawEdges = computed(() => {
  const ids = new Set(rawNodes.value.map((n) => n.id))
  return dsp.lineageEdges.filter((e) => ids.has(e.from) && ids.has(e.to))
})

const collapsed = computed(() => collapseLineage(rawNodes.value, rawEdges.value))
const nodes = computed(() => collapsed.value.nodes)
const edges = computed(() => collapsed.value.edges)

function onSelect(node) {
  if (node.kind === 'dataset') router.push(`/datasets/${node.id}`)
  else if (node.kind === 'modelVersion') router.push(`/models/${node.id}`)
  else router.push(`/lineage/nodes/${node.id}`)
}
</script>

<template>
  <DsPageHeader title="리니지" description="데이터셋에서 엔드포인트까지 계보입니다. 노드를 열면 속성과 하류 영향을 봅니다.">
    <template #actions>
      <DsInput v-model="q" placeholder="노드 검색" width="md" />
    </template>
  </DsPageHeader>

  <section class="lineage-section">
    <header class="lineage-header"><h2>통합 데이터 계보</h2><strong>{{ nodes.length }}개 노드</strong></header>
    <DsCard>
      <LineageGraph
        v-if="nodes.length"
        :nodes="nodes"
        :edges="edges"
        selected-id=""
        :query="q"
        :impact-ids="[]"
        @select="onSelect"
      />
      <DsEmpty v-else title="표시할 리니지가 없습니다" />
      <ul class="legend" aria-label="노드 유형">
        <li><span class="bar dataset" />데이터셋</li>
        <li><span class="bar model" />모델</li>
        <li><span class="bar endpoint" />엔드포인트</li>
      </ul>
    </DsCard>
  </section>
</template>

<style scoped>
.lineage-section { border-top: 1px solid var(--ds-border); padding-top: var(--ds-space-4); }
.lineage-header { align-items: baseline; display: flex; justify-content: space-between; margin-bottom: var(--ds-space-3); }
.lineage-header h2 { font-size: var(--ds-font-title-sm); margin: 0; }
.lineage-header strong { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); font-weight: 400; }
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

.bar.model {
  background: var(--ds-primary);
}

.bar.endpoint {
  background: var(--ds-success);
}
</style>
