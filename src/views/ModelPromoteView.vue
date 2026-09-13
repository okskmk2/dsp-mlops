<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsCheckbox from '../components/ui/DsCheckbox.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import { monitorResult, monitorResultChip } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const challenger = computed(() => dsp.modelById(route.params.id))
const champion = computed(() => {
  const c = challenger.value
  if (!c) return null
  return dsp.models.find((m) => m.projectId === c.projectId && m.name === c.name && m.stage === 'champion') || null
})

const rows = computed(() => {
  const keys = new Set([
    ...Object.keys(challenger.value?.metricsSnapshot || {}),
    ...Object.keys(champion.value?.metricsSnapshot || {}),
  ])
  return [...keys].map((k) => ({
    id: k,
    metric: k,
    challenger: challenger.value?.metricsSnapshot?.[k] ?? '—',
    champion: champion.value?.metricsSnapshot?.[k] ?? '—',
  }))
})

const checks = computed(() => ({
  metrics: true,
  monitorPass: challenger.value?.lastMonitor === 'pass',
  driftBelow: (challenger.value?.driftScore ?? 0) < 0.25,
}))

function submit() {
  const ok = dsp.submitPromotion(challenger.value.id)
  if (ok.ok) router.push('/models/promotions')
}
</script>

<template>
  <div v-if="challenger">
    <DsPageHeader title="승격 요청" :description="`${challenger.name} ${challenger.version}를 Champion과 비교한 뒤 결재합니다.`">
      <template #actions>
        <DsButton variant="ghost" :to="`/models/${challenger.id}`">취소</DsButton>
        <DsButton variant="primary" @click="submit">상신</DsButton>
      </template>
    </DsPageHeader>

    <DsCard>
      <template #title>지표 비교</template>
      <DsTable
        :columns="[
          { key: 'metric', label: '지표' },
          { key: 'challenger', label: `Challenger ${challenger.version}`, numeric: true },
          { key: 'champion', label: champion ? `Champion ${champion.version}` : 'Champion 없음', numeric: true },
        ]"
        :rows="rows"
      />
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>체크리스트</template>
      <DsCheckbox :model-value="checks.metrics" disabled label="지표 비교를 확인함" />
      <p>
        모니터
        <DsChip :tone="monitorResultChip[challenger.lastMonitor]">{{ monitorResult[challenger.lastMonitor] }}</DsChip>
      </p>
      <DsCheckbox :model-value="checks.monitorPass" disabled label="모니터 통과" />
      <DsCheckbox :model-value="checks.driftBelow" disabled :label="`드리프트 ${challenger.driftScore ?? '—'} < 0.25`" />
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>결재선</template>
      <p class="ds-body">승인권자 {{ dsp.userById(dsp.approvalLines.find((l) => l.type === 'champion_promote')?.approverId)?.name }}</p>
    </DsCard>
  </div>
</template>
