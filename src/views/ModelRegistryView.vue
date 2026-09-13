<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { modelStage, modelStageChip, monitorResult, monitorResultChip } from '../data/labels'
import { formatWon } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const dsp = useDspStore()
const router = useRouter()
const view = ref('kanban')
const stage = ref('')

const models = computed(() => {
  let list = dsp.visibleModels()
  if (stage.value) list = list.filter((m) => m.stage === stage.value)
  return list
})

const columns = [
  { key: 'project', label: '프로젝트' },
  { key: 'name', label: '모델', strong: true },
  { key: 'version', label: '버전' },
  { key: 'stage', label: '스테이지' },
  { key: 'lastMonitor', label: '모니터' },
  { key: 'driftScore', label: '드리프트', numeric: true },
  { key: 'costOptional', label: '월 비용', numeric: true },
]

const lanes = ['draft', 'challenger', 'champion']
</script>

<template>
  <DsPageHeader title="모델 레지스트리" description="Draft / Challenger / Champion 운영 보드입니다. 학습 UI는 없습니다.">
    <template #actions>
      <DsSelect
        v-model="stage"
        :options="lanes.map((s) => ({ value: s, label: modelStage[s] }))"
        placeholder="스테이지 전체"
        width="sm"
      />
      <DsButton :variant="view === 'kanban' ? 'secondary' : 'ghost'" @click="view = 'kanban'">칸반</DsButton>
      <DsButton :variant="view === 'table' ? 'secondary' : 'ghost'" @click="view = 'table'">표</DsButton>
    </template>
  </DsPageHeader>

  <div v-if="view === 'kanban'" class="kanban">
    <DsCard v-for="lane in lanes" :key="lane" padding>
      <template #title>{{ modelStage[lane] }}</template>
      <ul>
        <li v-for="m in models.filter((x) => x.stage === lane)" :key="m.id">
          <button type="button" class="card-btn" @click="router.push(`/models/${m.id}`)">
            <span class="ds-body-strong">{{ m.name }} {{ m.version }}</span>
            <span class="ds-meta">{{ dsp.projectById(m.projectId)?.name }}</span>
            <DsChip :tone="monitorResultChip[m.lastMonitor]">{{ monitorResult[m.lastMonitor] }}</DsChip>
          </button>
        </li>
      </ul>
    </DsCard>
  </div>

  <DsTable v-else :columns="columns" :rows="models" @row-click="(r) => router.push(`/models/${r.id}`)">
    <template #project="{ row }">{{ dsp.projectById(row.projectId)?.name }}</template>
    <template #stage="{ row }">
      <DsChip :tone="modelStageChip[row.stage]">{{ modelStage[row.stage] }}</DsChip>
    </template>
    <template #lastMonitor="{ row }">
      <DsChip :tone="monitorResultChip[row.lastMonitor]">{{ monitorResult[row.lastMonitor] }}</DsChip>
    </template>
    <template #costOptional="{ row }">{{ formatWon(row.costMonth) }}</template>
  </DsTable>
</template>

<style scoped>
.kanban {
  display: grid;
  gap: var(--ds-space-6);
  grid-template-columns: repeat(3, 1fr);
}

ul {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}

.card-btn {
  align-items: flex-start;
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  padding: var(--ds-space-4);
  text-align: left;
  width: 100%;
}

.card-btn:hover {
  background: var(--ds-canvas-subtle);
}
</style>
