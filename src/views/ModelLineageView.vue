<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LineageGraph from '../components/lineage/LineageGraph.vue'
import ModelSubnav from '../components/layout/ModelSubnav.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { collapseLineage } from '../lib/lineage'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const model = computed(() => dsp.modelById(route.params.id))
const project = computed(() => model.value && dsp.projectById(model.value.projectId))

const rawNodes = computed(() => {
  if (!project.value) return []
  const pid = project.value.id
  const jobs = dsp.jobs.filter((j) => j.projectId === pid)
  const models = dsp.models
    .filter((m) => m.projectId === pid)
    .map((m) => ({ ...m, kind: 'modelVersion', label: `${m.name} ${m.version}`, projectName: project.value.name }))
  const includedIds = new Set([...jobs.map((j) => j.id), ...models.map((m) => m.id)])
  const ds = dsp.datasets
    .filter((d) => dsp.lineageEdges.some((e) => e.from === d.id && includedIds.has(e.to)))
    .map((d) => ({ ...d, kind: 'dataset' }))
  const jobNodes = jobs.map((j) => ({ ...j, kind: 'job' }))
  const eps = dsp.endpoints
    .filter((e) => dsp.lineageEdges.some((edge) => edge.to === e.id && includedIds.has(edge.from)))
    .map((e) => ({ ...e, kind: 'endpoint' }))
  const candidates = [...ds, ...jobNodes, ...models, ...eps]
  const candidateIds = new Set(candidates.map((n) => n.id))
  const connected = new Set([model.value.id])
  const pending = [model.value.id]

  while (pending.length) {
    const current = pending.pop()
    for (const edge of dsp.lineageEdges) {
      const neighbor = edge.from === current ? edge.to : edge.to === current ? edge.from : null
      if (neighbor && candidateIds.has(neighbor) && !connected.has(neighbor)) {
        connected.add(neighbor)
        pending.push(neighbor)
      }
    }
  }

  return candidates.filter((n) => connected.has(n.id))
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
  else if (node.kind === 'modelVersion') router.push(`/models/${node.id}/lineage`)
  else router.push(`/lineage/nodes/${node.id}`)
}
</script>

<template>
  <div v-if="model && project">
    <DsPageHeader :title="`${model.name} ${model.version}`" :description="project.name" />
    <ModelSubnav :model-id="model.id" />
    <DsCard>
      <template #title>데이터 계보</template>
      <template #action>
        <DsButton variant="ghost" to="/lineage">리니지 확대</DsButton>
      </template>
      <LineageGraph
        v-if="nodes.length"
        :nodes="nodes"
        :edges="edges"
        :selected-id="model.id"
        query=""
        :impact-ids="[]"
        @select="onSelect"
      />
      <DsEmpty v-else title="연결된 계보가 없습니다" />
    </DsCard>
  </div>
</template>
