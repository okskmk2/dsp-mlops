<script setup>
import { computed } from 'vue'
import { nodeType } from '../../data/labels'

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  edges: { type: Array, default: () => [] },
  projects: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
  query: { type: String, default: '' },
  impactIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['select'])

const COLS = [
  { id: 'dataset', label: '데이터셋' },
  { id: 'job', label: 'Job' },
  { id: 'modelVersion', label: '모델' },
  { id: 'endpoint', label: '엔드포인트' },
]

const NODE_W = 228
const NODE_H = 72
const COL_GAP = 88
const ROW_GAP = 16
const GROUP_GAP = 48
const PAD_X = 24
const PAD_Y = 64
const PORT = 6

const kindAccent = {
  dataset: 'var(--ds-text-tertiary)',
  job: 'var(--ds-info)',
  modelVersion: 'var(--ds-primary)',
  endpoint: 'var(--ds-success)',
}

const layout = computed(() => {
  const byProject = new Map(
    props.projects.map((p) => [p.id, { dataset: [], job: [], modelVersion: [], endpoint: [] }]),
  )
  const orphan = { dataset: [], job: [], modelVersion: [], endpoint: [] }

  for (const n of props.nodes) {
    const bucket = byProject.get(n.projectId) || orphan
    if (bucket[n.kind]) bucket[n.kind].push(n)
  }

  const groups = []
  for (const p of props.projects) {
    const cols = byProject.get(p.id)
    if (!COLS.some((c) => cols[c.id].length)) continue
    groups.push({ id: p.id, name: p.name, cols })
  }
  if (COLS.some((c) => orphan[c.id].length)) {
    groups.push({ id: '_other', name: '기타', cols: orphan })
  }

  let y = PAD_Y
  const placed = []
  const bands = []
  for (const g of groups) {
    const rows = Math.max(1, ...COLS.map((c) => g.cols[c.id].length))
    const h = rows * NODE_H + (rows - 1) * ROW_GAP
    bands.push({ id: g.id, name: g.name, y, h })
    COLS.forEach((c, ci) => {
      g.cols[c.id].forEach((n, i) => {
        placed.push({
          ...n,
          title: n.label || n.name || n.id,
          x: PAD_X + ci * (NODE_W + COL_GAP),
          y: y + i * (NODE_H + ROW_GAP),
        })
      })
    })
    y += h + GROUP_GAP
  }

  const width = PAD_X * 2 + COLS.length * NODE_W + (COLS.length - 1) * COL_GAP
  const height = Math.max(PAD_Y + NODE_H, y - GROUP_GAP + PAD_X)
  const byId = Object.fromEntries(placed.map((n) => [n.id, n]))
  return { placed, bands, width, height, byId }
})

const paths = computed(() => {
  const { byId } = layout.value
  return props.edges
    .map((e, i) => {
      const a = byId[e.from]
      const b = byId[e.to]
      if (!a || !b) return null
      const sx = a.x + NODE_W
      const sy = a.y + NODE_H / 2
      const tx = b.x
      const ty = b.y + NODE_H / 2
      const dx = Math.max(56, Math.abs(tx - sx) / 2)
      const endX = tx - 12
      return {
        i,
        from: e.from,
        to: e.to,
        d: `M ${sx} ${sy} C ${sx + dx} ${sy}, ${endX - dx} ${ty}, ${endX} ${ty}`,
      }
    })
    .filter(Boolean)
})

const impactSet = computed(() => new Set(props.impactIds))

function clip(text, max = 20) {
  const s = String(text || '')
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

function matches(n) {
  const s = props.query.trim().toLowerCase()
  if (!s) return true
  return [n.title, n.name, n.label, n.id, n.ref].filter(Boolean).some((v) => String(v).toLowerCase().includes(s))
}

function isImpactNode(id) {
  return !props.selectedId || impactSet.value.has(id)
}

function isImpactEdge(p) {
  if (!props.selectedId) return false
  return impactSet.value.has(p.from) && impactSet.value.has(p.to)
}

function nodeOpacity(n) {
  if (!matches(n)) return 0.28
  if (props.selectedId && !isImpactNode(n.id)) return 0.28
  return 1
}

function onKey(event, n) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('select', n)
  }
}
</script>

<template>
  <div class="wrap">
    <svg
      class="graph"
      :viewBox="`0 0 ${layout.width} ${layout.height}`"
      :width="layout.width"
      :height="layout.height"
      role="img"
      aria-label="데이터 리니지 그래프"
    >
      <defs>
        <marker id="lg-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 1 L8 4 L0 7 Z" fill="var(--ds-border-strong)" />
        </marker>
        <marker id="lg-arrow-on" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0 1 L8 4 L0 7 Z" fill="var(--ds-primary)" />
        </marker>
        <clipPath v-for="n in layout.placed" :id="`lg-clip-${n.id}`">
          <rect :x="n.x" :y="n.y" :width="NODE_W" :height="NODE_H" rx="8" />
        </clipPath>
      </defs>

      <g v-for="band in layout.bands" :key="band.id">
        <rect
          :x="0"
          :y="band.y - 28"
          :width="layout.width"
          :height="band.h + 36"
          fill="var(--ds-canvas-subtle)"
        />
        <text
          :x="PAD_X"
          :y="band.y - 10"
          fill="var(--ds-text-tertiary)"
          font-size="12"
          font-weight="600"
        >
          {{ band.name }}
        </text>
      </g>

      <g v-for="(col, ci) in COLS" :key="col.id">
        <text
          :x="PAD_X + ci * (NODE_W + COL_GAP)"
          y="24"
          fill="var(--ds-text)"
          font-size="14"
          font-weight="600"
        >
          {{ col.label }}
        </text>
      </g>

      <path
        v-for="p in paths"
        :key="p.i"
        fill="none"
        :d="p.d"
        :stroke="isImpactEdge(p) ? 'var(--ds-primary)' : 'var(--ds-border-strong)'"
        :stroke-width="isImpactEdge(p) ? 2 : 2"
        stroke-linecap="round"
        :opacity="selectedId && !isImpactEdge(p) ? 0.28 : 1"
        :marker-end="isImpactEdge(p) ? 'url(#lg-arrow-on)' : 'url(#lg-arrow)'"
      />

      <g
        v-for="n in layout.placed"
        :key="n.id"
        :opacity="nodeOpacity(n)"
        role="button"
        tabindex="0"
        :aria-label="`${nodeType[n.kind]} ${n.title}`"
        :aria-pressed="selectedId === n.id ? 'true' : 'false'"
        @click="emit('select', n)"
        @keydown="onKey($event, n)"
      >
        <rect
          :x="n.x"
          :y="n.y"
          :width="NODE_W"
          :height="NODE_H"
          rx="8"
          :fill="selectedId === n.id || impactSet.has(n.id) ? 'var(--ds-primary-subtle)' : 'var(--ds-surface)'"
          :stroke="selectedId === n.id ? 'var(--ds-primary)' : 'var(--ds-border)'"
          :stroke-width="selectedId === n.id ? 2 : 1"
        />
        <rect
          :x="n.x"
          :y="n.y"
          width="3"
          :height="NODE_H"
          :fill="kindAccent[n.kind]"
          :clip-path="`url(#lg-clip-${n.id})`"
        />
        <text :x="n.x + 16" :y="n.y + 24" fill="var(--ds-text-secondary)" font-size="12">
          {{ nodeType[n.kind] }}
        </text>
        <text :x="n.x + 16" :y="n.y + 46" fill="var(--ds-text)" font-size="14" font-weight="600">
          {{ clip(n.title) }}
        </text>
        <text v-if="n.ref || n.version" :x="n.x + 16" :y="n.y + 62" fill="var(--ds-text-tertiary)" font-size="12" font-family="var(--ds-font-mono)">
          {{ clip(n.version ? `v${n.version}` : n.ref, 24) }}
        </text>
        <circle
          :cx="n.x"
          :cy="n.y + NODE_H / 2"
          :r="PORT"
          fill="var(--ds-surface)"
          stroke="var(--ds-border-strong)"
          stroke-width="1"
        />
        <circle
          :cx="n.x + NODE_W"
          :cy="n.y + NODE_H / 2"
          :r="PORT"
          fill="var(--ds-surface)"
          stroke="var(--ds-border-strong)"
          stroke-width="1"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.wrap {
  overflow: auto;
  width: 100%;
}

.graph {
  display: block;
  font-family: var(--ds-font-sans);
  max-width: none;
  min-width: 100%;
}

.graph :focus-visible {
  outline: 2px solid var(--ds-focus);
  outline-offset: 2px;
}

.graph g[role='button'] {
  cursor: pointer;
}
</style>
