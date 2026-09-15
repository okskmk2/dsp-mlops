<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import { nodeType } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const dsp = useDspStore()
const depth = ref(2)

const vis = computed(() => new Set(dsp.visibleProjects().map((p) => p.id)))

const jobs = computed(() => dsp.jobs.filter((d) => vis.value.has(d.projectId)))
const models = computed(() => dsp.visibleModels().map((d) => ({
  ...d,
  kind: 'modelVersion',
  label: `${d.name} ${d.version}`,
  projectName: dsp.projectById(d.projectId)?.name,
})))
const includedIds = computed(() => new Set([...jobs.value.map((j) => j.id), ...models.value.map((m) => m.id)]))

const nodes = computed(() => {
  const ds = dsp.datasets
    .filter((d) => dsp.lineageEdges.some((e) => e.from === d.id && includedIds.value.has(e.to)))
    .map((d) => ({ ...d, kind: 'dataset' }))
  const jobNodes = jobs.value.map((d) => ({ ...d, kind: 'job' }))
  const eps = dsp.endpoints
    .filter((e) => dsp.lineageEdges.some((edge) => edge.to === e.id && includedIds.value.has(edge.from)))
    .map((e) => ({ ...e, kind: 'endpoint' }))
  return [...ds, ...jobNodes, ...models.value, ...eps]
})

const node = computed(() => nodes.value.find((n) => n.id === route.params.nodeId) || null)

const edges = computed(() => {
  const ids = new Set(nodes.value.map((n) => n.id))
  return dsp.lineageEdges.filter((e) => ids.has(e.from) && ids.has(e.to))
})

function downstream(id, max) {
  const out = new Set([id])
  const walk = (cur, d) => {
    if (d >= max) return
    for (const e of edges.value.filter((x) => x.from === cur)) {
      if (out.has(e.to)) continue
      out.add(e.to)
      walk(e.to, d + 1)
    }
  }
  walk(id, 0)
  return [...out]
}

const impactIds = computed(() => (node.value ? downstream(node.value.id, Number(depth.value)) : []))
const title = computed(() => node.value?.label || node.value?.name || node.value?.id || '노드')
</script>

<template>
  <div v-if="node">
    <DsBreadcrumb
      :items="[
        { label: '리니지', to: '/lineage' },
        { label: title },
      ]"
    />
    <DsPageHeader :title="title" :description="nodeType[node.kind]">
      <template #actions>
        <DsSelect
          :model-value="String(depth)"
          :options="[
            { value: '1', label: '깊이 1' },
            { value: '2', label: '깊이 2' },
            { value: '3', label: '깊이 3' },
            { value: '4', label: '깊이 4' },
          ]"
          width="sm"
          placeholder=""
          @update:model-value="(v) => (depth = Number(v))"
        />
        <DsButton variant="ghost" to="/lineage">그래프</DsButton>
        <DsButton v-if="node.kind === 'modelVersion'" variant="secondary" :to="`/models/${node.id}`">
          모델 상세
        </DsButton>
      </template>
    </DsPageHeader>

    <DsCard>
      <template #title>속성</template>
      <dl class="ds-dl">
        <div>
          <dt>유형</dt>
          <dd>{{ nodeType[node.kind] }}</dd>
        </div>
        <div>
          <dt>ID</dt>
          <dd class="mono">{{ node.id }}</dd>
        </div>
        <div v-if="node.ref">
          <dt>참조</dt>
          <dd class="mono">{{ node.ref }}</dd>
        </div>
        <div v-if="node.projectId">
          <dt>프로젝트</dt>
          <dd>{{ dsp.projectById(node.projectId)?.name }}</dd>
        </div>
      </dl>
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>하류 영향 · 깊이 {{ depth }}</template>
      <ul v-if="impactIds.length > 1" class="impact">
        <li v-for="id in impactIds.filter((x) => x !== node.id)" :key="id">
          <RouterLink class="mono" :to="`/lineage/nodes/${id}`">{{ id }}</RouterLink>
        </li>
      </ul>
      <p v-else class="ds-meta">이 깊이에서 하류 노드가 없습니다.</p>
    </DsCard>
  </div>
  <p v-else class="ds-body">노드를 찾을 수 없습니다.</p>
</template>

<style scoped>
.impact {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}
</style>
