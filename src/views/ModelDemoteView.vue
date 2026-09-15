<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsCheckbox from '../components/ui/DsCheckbox.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { monitorResult, monitorResultChip } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const reason = ref('')

const champion = computed(() => dsp.modelById(route.params.id))
const checks = computed(() => ({
  monitoring: champion.value?.lastMonitor === 'fail' || champion.value?.championHealth === 'at_risk',
}))

function submit() {
  const ok = dsp.submitDemotion(champion.value.id, reason.value)
  if (ok.ok) router.push('/models/promotions')
}
</script>

<template>
  <div v-if="champion">
    <DsPageHeader title="Champion 강등 상신" :description="`${champion.name} ${champion.version}의 운영 지위를 회수하는 결재를 작성합니다.`">
      <template #actions>
        <DsButton variant="ghost" :to="`/models/${champion.id}`">취소</DsButton>
        <DsButton variant="danger" @click="submit">상신</DsButton>
      </template>
    </DsPageHeader>

    <DsCard>
      <template #title>강등 사유</template>
      <DsField label="사유" hint="모델 운영 중단, 성능 회귀, 규정 위반 등 상세 이유를 입력하세요.">
        <DsTextarea v-model="reason" :rows="5" placeholder="예: 최근 모니터 실패와 드리프트 상승으로 Champion 자격을 회수합니다." />
      </DsField>
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>현황 확인</template>
      <DsCheckbox :model-value="checks.monitoring" disabled label="모니터 경고 또는 Champion 건강 위험 상태" />
      <p>
        모니터
        <DsChip :tone="monitorResultChip[champion.lastMonitor]">{{ monitorResult[champion.lastMonitor] }}</DsChip>
      </p>
      <p v-if="champion.championHealth" class="ds-meta">
        Champion 건강: {{ champion.championHealth }}
      </p>
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>결재선</template>
      <p class="ds-body">승인권자 {{ dsp.userById(dsp.approvalLines.find((l) => l.type === 'champion_promote')?.approverId)?.name }}</p>
    </DsCard>
  </div>
</template>
