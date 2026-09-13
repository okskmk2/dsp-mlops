<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { approvalStatus, approvalStatusChip, approvalType, platformType } from '../data/labels'
import { computeClassLabel } from '../lib/compute'
import { formatWon } from '../lib/format'
import { isApprover } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()
const reason = ref('')

const row = computed(() => dsp.approvalById(route.params.id))
const target = computed(() => (row.value ? dsp.approvalTarget(row.value) : { name: '', href: '' }))
const canDecide = computed(
  () =>
    row.value?.status === 'pending' &&
    isApprover(auth.user) &&
    row.value.approverId === auth.user.id,
)

function decide(decision) {
  const ok = dsp.decideApproval(row.value.id, decision, reason.value)
  if (ok.ok) reason.value = ''
}
</script>

<template>
  <div v-if="row">
    <DsBreadcrumb
      :items="[
        { label: '결재함', to: '/approvals' },
        { label: approvalType[row.type] },
      ]"
    />
    <DsPageHeader :title="approvalType[row.type]" :description="target.name">
      <template #actions>
        <DsButton v-if="target.href" variant="ghost" :to="target.href">대상 열기</DsButton>
        <template v-if="canDecide">
          <DsButton variant="danger" @click="decide('rejected')">반려</DsButton>
          <DsButton variant="primary" @click="decide('approved')">승인</DsButton>
        </template>
        <DsButton v-else variant="ghost" to="/approvals">목록</DsButton>
      </template>
    </DsPageHeader>

    <DsCard>
      <template #title>품의</template>
      <dl class="ds-dl">
        <div>
          <dt>상태</dt>
          <dd>
            <DsChip :tone="approvalStatusChip[row.status]">{{ approvalStatus[row.status] }}</DsChip>
          </dd>
        </div>
        <div>
          <dt>요청</dt>
          <dd>{{ dsp.userById(row.requesterId)?.name }}</dd>
        </div>
        <div>
          <dt>승인</dt>
          <dd>{{ dsp.userById(row.approverId)?.name }}</dd>
        </div>
        <div v-if="row.type === 'compute_upgrade'">
          <dt>플랫폼</dt>
          <dd>{{ platformType[row.platform] }}</dd>
        </div>
        <div v-if="row.type === 'compute_upgrade'">
          <dt>현재 등급</dt>
          <dd>{{ computeClassLabel(dsp.computeClasses, row.fromClass) }}</dd>
        </div>
        <div v-if="row.type === 'compute_upgrade'">
          <dt>요청 등급</dt>
          <dd>{{ computeClassLabel(dsp.computeClasses, row.toClass) }}</dd>
        </div>
        <div v-if="row.type === 'compute_upgrade'">
          <dt>월 증액</dt>
          <dd class="tabular">{{ formatWon(row.estimatedMonthlyDelta || row.amount) }}</dd>
        </div>
        <div v-if="row.type === 'compute_upgrade' && row.projectId">
          <dt>잔여 예산</dt>
          <dd class="tabular">
            {{ formatWon(dsp.projectById(row.projectId).budgetAmount - dsp.spentOf(row.projectId)) }}
          </dd>
        </div>
        <div v-if="row.reason">
          <dt>사유</dt>
          <dd>{{ row.reason }}</dd>
        </div>
        <div v-if="row.comment">
          <dt>처리 의견</dt>
          <dd>{{ row.comment }}</dd>
        </div>
      </dl>
      <p
        v-if="
          row.type === 'compute_upgrade' &&
          row.projectId &&
          row.budgetAfter > dsp.projectById(row.projectId)?.budgetAmount
        "
        class="ds-meta"
      >
        승인 시 예산 한도가 {{ formatWon(row.budgetAfter) }}로 함께 오릅니다.
      </p>
    </DsCard>

    <DsCard v-if="canDecide" class="ds-follow">
      <template #title>처리</template>
      <DsField label="반려 사유">
        <DsTextarea v-model="reason" />
      </DsField>
    </DsCard>
  </div>
  <p v-else class="ds-body">품의를 찾을 수 없습니다.</p>
</template>
