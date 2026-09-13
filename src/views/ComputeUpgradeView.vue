<script setup>
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsField from '../components/ui/DsField.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { platformType } from '../data/labels'
import {
  computeClassById,
  currentClassId,
  higherClasses,
  isWorkspaceProvision,
  monthlyDelta,
} from '../lib/compute'
import { formatWon } from '../lib/format'
import { canWriteProject } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const dsp = useDspStore()
const form = reactive({ toClass: '', reason: '' })

const project = computed(() => dsp.projectById(route.params.id))
const workspace = computed(() => dsp.provisionById(route.params.provisionId))
const allowed = computed(
  () =>
    project.value &&
    workspace.value &&
    isWorkspaceProvision(workspace.value) &&
    workspace.value.projectId === project.value.id &&
    workspace.value.status === 'succeeded' &&
    project.value.status === 'active' &&
    canWriteProject(auth.user, project.value, dsp.members, 'requestComputeUpgrade') &&
    !dsp.hasInFlightComputeUpgrade(project.value.id, workspace.value.platform),
)

const fromClass = computed(() =>
  workspace.value ? computeClassById(dsp.computeClasses, currentClassId(workspace.value)) : null,
)
const toClass = computed(() => computeClassById(dsp.computeClasses, form.toClass))
const upgradeOptions = computed(() =>
  workspace.value
    ? higherClasses(dsp.computeClasses, workspace.value).map((c) => ({
        value: c.id,
        label: `${c.label} · 월 ${formatWon(c.monthlyCost)}`,
      }))
    : [],
)
const delta = computed(() => monthlyDelta(fromClass.value, toClass.value))
const remaining = computed(() =>
  project.value ? project.value.budgetAmount - dsp.spentOf(project.value.id) : 0,
)
const budgetShort = computed(() => Boolean(toClass.value && remaining.value < delta.value))

function submit() {
  const res = dsp.submitComputeUpgrade(workspace.value.id, form.toClass, form.reason)
  if (res.ok) router.push(res.id ? `/approvals/${res.id}` : `/projects/${project.value.id}/resources`)
}
</script>

<template>
  <div v-if="project && workspace && allowed">
    <DsBreadcrumb
      :items="[
        { label: '프로젝트', to: '/projects' },
        { label: project.name, to: `/projects/${project.id}` },
        { label: '리소스', to: `/projects/${project.id}/resources` },
        { label: '컴퓨팅 상향' },
      ]"
    />
    <DsPageHeader title="컴퓨팅 상향 신청" :description="`${platformType[workspace.platform]} 카탈로그 등급만 신청합니다. 클러스터 설계는 없습니다.`">
      <template #actions>
        <DsButton variant="ghost" :to="`/projects/${project.id}/resources`">취소</DsButton>
        <DsButton variant="primary" :disabled="!form.toClass || !form.reason.trim()" @click="submit">
          결재 상신
        </DsButton>
      </template>
    </DsPageHeader>
    <ProjectSubnav :project-id="project.id" />

    <DsCard>
      <template #title>{{ platformType[workspace.platform] }}</template>
      <dl class="ds-dl">
        <div>
          <dt>리소스</dt>
          <dd class="mono">{{ workspace.cloudResourceId || 'cloudResourceId 없음' }}</dd>
        </div>
        <div>
          <dt>현재 등급</dt>
          <dd>{{ fromClass?.label }} · 월 {{ formatWon(fromClass?.monthlyCost) }}</dd>
        </div>
      </dl>
      <DsField label="요청 등급" required :error="upgradeOptions.length ? '' : '더 높은 등급이 없습니다.'">
        <DsSelect
          v-model="form.toClass"
          :options="upgradeOptions"
          width="full"
          :disabled="!upgradeOptions.length"
        />
      </DsField>
      <DsField v-if="toClass" label="예상 월 증액">
        <p class="ds-body tabular">{{ formatWon(delta) }}</p>
      </DsField>
      <DsField label="잔여 예산">
        <p class="ds-body tabular">{{ formatWon(remaining) }}</p>
        <p v-if="budgetShort" class="ds-meta">
          잔여 예산을 넘습니다. 승인 시 예산 한도가 {{ formatWon(dsp.spentOf(project.id) + delta) }}로 함께 오릅니다.
        </p>
      </DsField>
      <DsField label="사유" required>
        <DsTextarea v-model="form.reason" />
      </DsField>
    </DsCard>
  </div>
  <p v-else class="ds-body">이 워크스페이스에는 상향을 신청할 수 없습니다.</p>
</template>

<style scoped>
.tabular {
  font-variant-numeric: tabular-nums;
}
</style>
