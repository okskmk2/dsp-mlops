<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const reason = ref('')

const dataset = computed(() => dsp.datasetById(route.params.id))

function submit() {
  const ok = dsp.submitDatasetDemotion(dataset.value.id, reason.value)
  if (ok.ok) router.push('/models/promotions')
}
</script>

<template>
  <div v-if="dataset">
    <DsPageHeader title="데이터셋 강등 상신" :description="`${dataset.name}의 Champion 지위를 회수하는 결재를 작성합니다.`">
      <template #actions>
        <DsButton variant="ghost" :to="`/datasets/${dataset.id}`">취소</DsButton>
        <DsButton variant="danger" @click="submit">상신</DsButton>
      </template>
    </DsPageHeader>

    <DsCard>
      <template #title>강등 사유</template>
      <DsField label="사유" hint="품질 이슈, 규정 위반, 신뢰성 저하 등의 이유를 적어 주세요.">
        <DsTextarea v-model="reason" :rows="5" placeholder="예: 최근 데이터 품질 검증에서 기준을 초과했고, 운영 사용을 중단해야 합니다." />
      </DsField>
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>결재선</template>
      <p class="ds-body">승인권자 {{ dsp.userById(dsp.approvalLines.find((l) => l.type === 'champion_promote')?.approverId)?.name }}</p>
    </DsCard>
  </div>
</template>
