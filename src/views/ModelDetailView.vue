<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsLineChart from '../components/charts/DsLineChart.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import {
  championHealth,
  championHealthChip,
  modelStage,
  modelStageChip,
  monitorResult,
  monitorResultChip,
  platformType,
} from '../data/labels'
import { hasProjectRole } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dsp = useDspStore()
const ui = useUiStore()
const model = computed(() => dsp.modelById(route.params.id))
const project = computed(() => (model.value ? dsp.projectById(model.value.projectId) : null))
const spark = computed(() => dsp.driftSeries.filter((d) => d.modelId === route.params.id))
const canPromo = computed(
  () =>
    model.value?.stage === 'challenger' &&
    hasProjectRole(auth.user, model.value.projectId, dsp.members, ['owner', 'coordinator']),
)
const canDemo = computed(
  () =>
    model.value?.stage === 'champion' &&
    hasProjectRole(auth.user, model.value.projectId, dsp.members, ['owner', 'coordinator']),
)
const canRetrain = computed(() =>
  hasProjectRole(auth.user, model.value?.projectId, dsp.members, ['owner', 'coordinator', 'member']),
)
const canRegister = computed(
  () =>
    model.value?.stage === 'draft' &&
    hasProjectRole(auth.user, model.value.projectId, dsp.members, ['owner', 'coordinator', 'member']),
)
const lineageNodes = computed(() => {
  if (!model.value) return []
  const edges = dsp.lineageEdges.filter((e) => e.to === model.value.id || e.from === model.value.id)
  return edges
})
</script>

<template>
  <div v-if="model && project">
    <DsPageHeader :title="`${model.name} ${model.version}`" :description="project.name">
      <template #actions>
        <DsButton v-if="canRetrain && project.status === 'active'" variant="secondary" @click="ui.retrainModelId = model.id">
          재학습
        </DsButton>
        <DsButton
          v-if="canRegister && project.status === 'active'"
          variant="primary"
          @click="dsp.registerChallenger(model.id)"
        >
          Challenger 등록
        </DsButton>
        <DsButton v-if="canPromo" variant="primary" :to="`/models/${model.id}/promote`">승격 요청</DsButton>
        <DsButton v-if="canDemo" variant="danger" @click="dsp.submitDemotion(model.id)">강등 상신</DsButton>
      </template>
    </DsPageHeader>

    <div class="chips">
      <DsChip :tone="modelStageChip[model.stage]">{{ modelStage[model.stage] }}</DsChip>
      <DsChip v-if="model.championHealth" :tone="championHealthChip[model.championHealth]">
        {{ championHealth[model.championHealth] }}
      </DsChip>
      <DsChip :tone="monitorResultChip[model.lastMonitor]">모니터 {{ monitorResult[model.lastMonitor] }}</DsChip>
    </div>

    <div class="two">
      <DsCard>
        <template #title>운영 스냅샷</template>
        <dl class="ds-dl">
          <div><dt>프로젝트</dt><dd><RouterLink :to="`/projects/${project.id}`">{{ project.name }}</RouterLink></dd></div>
          <div><dt>프레임워크</dt><dd>{{ model.framework }}</dd></div>
          <div><dt>소스</dt><dd>{{ platformType[model.sourcePlatform] }}</dd></div>
          <div><dt>클라우드 ID</dt><dd class="mono">{{ model.mlflowOrAmlId }}</dd></div>
          <div>
            <dt>지표</dt>
            <dd>
              <span v-for="(v, k) in model.metricsSnapshot" :key="k" class="metric tabular">{{ k }} {{ v }}</span>
            </dd>
          </div>
        </dl>
        <DsButton variant="ghost" to="/monitoring/thresholds">모니터 기준</DsButton>
      </DsCard>
      <DsCard>
        <template #title>드리프트</template>
        <DsLineChart
          v-if="spark.length"
          :labels="spark.map((s) => s.capturedAt.slice(5))"
          :series="[
            { label: '입력', values: spark.map((s) => s.inputDrift) },
            { label: '예측', values: spark.map((s) => s.predictionDrift) },
          ]"
          :threshold="0.25"
          :height="200"
        />
        <p v-else class="ds-meta">시리즈가 없습니다.</p>
      </DsCard>
    </div>

    <DsCard class="ds-follow">
      <template #title>미니 리니지</template>
      <template #action>
        <DsButton variant="ghost" to="/lineage">리니지 확대</DsButton>
      </template>
      <ul class="mini">
        <li v-for="e in lineageNodes" :key="`${e.from}-${e.to}`">
          <span class="mono">{{ e.from }}</span>
          →
          <span class="mono">{{ e.to }}</span>
        </li>
      </ul>
      <p v-if="model.endpointId" class="ds-meta">엔드포인트 {{ model.endpointId }}</p>
    </DsCard>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-section-gap);
}

.two {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: 1fr 1fr;
}

.metric {
  margin-right: var(--ds-space-3);
}

.mini {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
}
</style>
