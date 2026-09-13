<script setup>
import { computed, ref } from 'vue'
import LineageGraph from '../components/lineage/LineageGraph.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsDrawer from '../components/ui/DsDrawer.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import { nodeType } from '../data/labels'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const dsp = useDspStore()
const ui = useUiStore()
const q = ref('')
const selected = ref(null)
const depth = ref(2)

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

const impactIds = computed(() => (selected.value ? downstream(selected.value.id, Number(depth.value)) : []))

function selectNode(n) {
  selected.value = n
}

function runImpact() {
  if (!selected.value) {
    ui.toast('노드를 먼저 선택하세요.', 'warning')
    return
  }
  selected.value = { ...selected.value }
}
</script>

<template>
  <DsPageHeader title="리니지" description="데이터셋에서 엔드포인트까지 계보입니다. 노드를 선택하면 하류 영향이 강조됩니다.">
    <template #actions>
      <DsInput v-model="q" placeholder="노드 검색" width="md" />
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
      <DsButton variant="secondary" :disabled="!selected" @click="runImpact">영향 분석</DsButton>
    </template>
  </DsPageHeader>

  <DsCard>
    <LineageGraph
      v-if="nodes.length"
      :nodes="nodes"
      :edges="edges"
      :projects="projects"
      :selected-id="selected?.id || ''"
      :query="q"
      :impact-ids="impactIds"
      @select="selectNode"
    />
    <DsEmpty v-else title="표시할 리니지가 없습니다" />
    <ul class="legend" aria-label="노드 유형">
      <li><span class="bar dataset" />데이터셋</li>
      <li><span class="bar job" />Job</li>
      <li><span class="bar model" />모델</li>
      <li><span class="bar endpoint" />엔드포인트</li>
    </ul>
  </DsCard>

  <DsDrawer v-if="selected" :title="selected.label || selected.name || selected.id" @close="selected = null">
    <dl class="ds-dl">
      <div>
        <dt>유형</dt>
        <dd>{{ nodeType[selected.kind] }}</dd>
      </div>
      <div>
        <dt>ID</dt>
        <dd class="mono">{{ selected.id }}</dd>
      </div>
      <div v-if="selected.ref">
        <dt>참조</dt>
        <dd class="mono">{{ selected.ref }}</dd>
      </div>
      <div v-if="selected.projectId">
        <dt>프로젝트</dt>
        <dd>{{ dsp.projectById(selected.projectId)?.name }}</dd>
      </div>
    </dl>
    <p class="ds-label">하류 영향 · 깊이 {{ depth }}</p>
    <ul v-if="impactIds.length > 1" class="impact">
      <li v-for="id in impactIds.filter((x) => x !== selected.id)" :key="id" class="mono">{{ id }}</li>
    </ul>
    <p v-else class="ds-meta">이 깊이에서 하류 노드가 없습니다.</p>
    <template #footer>
      <DsChip>깊이 {{ depth }}</DsChip>
    </template>
  </DsDrawer>
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

.impact {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}

.ds-label {
  margin-top: var(--ds-space-5);
}
</style>
