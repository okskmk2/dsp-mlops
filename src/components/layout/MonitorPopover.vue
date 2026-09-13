<script setup>
import { useRouter } from 'vue-router'
import DsButton from '../ui/DsButton.vue'
import DsChip from '../ui/DsChip.vue'
import { monitorResult, monitorResultChip } from '../../data/labels'
import { useDspStore } from '../../stores/dsp'
import { useUiStore } from '../../stores/ui'

const dsp = useDspStore()
const ui = useUiStore()
const router = useRouter()

const fails = dsp.attentionModels()
const failN = fails.filter((m) => m.lastMonitor === 'fail').length
const driftN = fails.filter((m) => (m.driftScore ?? 0) >= 0.25).length

function seeAll() {
  ui.monitorOpen = false
  router.push('/monitoring')
}
</script>

<template>
  <div class="sheet">
    <p class="ds-title-sm">모니터링 요약</p>
    <p class="ds-meta">실패 {{ failN }}건 · 드리프트 {{ driftN }}건</p>
    <ul>
      <li v-for="m in fails.slice(0, 5)" :key="m.id">
        <button type="button" @click="ui.monitorOpen = false; router.push(`/models/${m.id}`)">
          <span class="ds-body-strong">{{ m.name }} {{ m.version }}</span>
          <DsChip :tone="monitorResultChip[m.lastMonitor]">{{ monitorResult[m.lastMonitor] }}</DsChip>
        </button>
      </li>
    </ul>
    <DsButton variant="secondary" @click="seeAll">전체 보기</DsButton>
  </div>
</template>

<style scoped>
.sheet {
  background: var(--ds-surface-raised);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
  padding: var(--ds-space-4);
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  width: 22.2222rem;
  z-index: var(--ds-z-popover);
}

ul {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
}

li button {
  align-items: center;
  border-radius: var(--ds-radius-md);
  display: flex;
  justify-content: space-between;
  min-height: 2.4444rem;
  padding: 0 var(--ds-space-2);
  width: 100%;
}

li button:hover {
  background: var(--ds-canvas-subtle);
}
</style>
