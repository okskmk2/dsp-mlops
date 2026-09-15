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
  const ok = dsp.submitDatasetPromotion(dataset.value.id, reason.value)
  if (ok.ok) router.push('/models/promotions')
}
</script>

<template>
  <div v-if="dataset">
    <DsPageHeader title="데이터셋 승격 요청" :description="`${dataset.name}을(를) Champion 상태로 올리는 결재를 작성합니다.`">
      <template #actions>
        <DsButton variant="ghost" :to="`/datasets/${dataset.id}`">취소</DsButton>
        <DsButton variant="primary" @click="submit">상신</DsButton>
      </template>
    </DsPageHeader>

    <DsCard>
      <template #title>승격 사유</template>
      <DsField label="사유" hint="데이터 품질, 기준 준수, 최근 사용 이력 등을 입력하세요.">
        <DsTextarea v-model="reason" :rows="5" placeholder="예: 데이터 품질 기준을 충족하고, 최근 생산·모델 검증에 안정적으로 사용되고 있습니다." />
      </DsField>
    </DsCard>

    <DsCard class="ds-follow">
      <template #title>결재선</template>
      <p class="ds-body">승인권자 {{ dsp.userById(dsp.approvalLines.find((l) => l.type === 'champion_promote')?.approverId)?.name }}</p>
    </DsCard>
  </div>
</template>
