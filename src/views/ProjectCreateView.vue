<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsBanner from '../components/ui/DsBanner.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsCheckbox from '../components/ui/DsCheckbox.vue'
import DsField from '../components/ui/DsField.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { projectRole as roleLabel } from '../data/labels'
import { formatWon } from '../lib/format'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const auth = useAuthStore()
const dsp = useDspStore()
const ui = useUiStore()
const route = useRoute()
const router = useRouter()

const draftId = computed(() => (typeof route.query.draft === 'string' ? route.query.draft : ''))
const fromRequestId = computed(() => (typeof route.query.fromRequest === 'string' ? route.query.fromRequest : ''))

const form = reactive({
  name: '',
  goal: '',
  background: '',
  techStackText: '',
  members: [],
  budgetAmount: '',
  startAt: '',
  endAt: '',
  useAzureMl: false,
  useAzureDatabricks: false,
  azureMlSpec: { region: 'koreacentral', sku: 'standard' },
  databricksSpec: { region: 'koreacentral', sku: 'premium' },
  sourceRequestId: null,
})

const sourceRequest = computed(() => (form.sourceRequestId ? dsp.analysisRequestById(form.sourceRequestId) : null))

const errors = reactive({})

watch(
  [draftId, fromRequestId],
  ([id, requestId]) => {
    if (id) {
      const p = dsp.projectById(id)
      if (!p || p.status !== 'draft') return
      form.name = p.name
      form.goal = p.goal
      form.background = p.background
      form.techStackText = (p.techStack || []).join(', ')
      form.budgetAmount = String(p.budgetAmount || '')
      form.startAt = p.startAt
      form.endAt = p.endAt
      form.useAzureMl = p.platforms.includes('azure_ml')
      form.useAzureDatabricks = p.platforms.includes('azure_databricks')
      if (p.azureMlSpec) Object.assign(form.azureMlSpec, p.azureMlSpec)
      if (p.databricksSpec) Object.assign(form.databricksSpec, p.databricksSpec)
      form.sourceRequestId = p.sourceRequestId || requestId || null
      form.members = dsp.members
        .filter((m) => m.projectId === id && m.userId !== auth.user.id)
        .map((m) => ({ userId: m.userId, projectRole: m.projectRole }))
      return
    }
    if (!requestId) return
    const req = dsp.analysisRequestById(requestId)
    if (!req) return
    form.name = req.title
    form.goal = req.desiredOutcome
    form.background = [req.problem, req.businessContext].filter(Boolean).join('\n\n')
    form.sourceRequestId = req.id
    if (req.requesterId && req.requesterId !== auth.user.id) {
      form.members = [{ userId: req.requesterId, projectRole: 'coordinator' }]
    }
  },
  { immediate: true },
)

const userOptions = computed(() =>
  dsp.users
    .filter((u) => u.id !== auth.user.id)
    .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
)

function payload() {
  return {
    ...form,
    techStack: form.techStackText
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean),
    budgetAmount: Number(form.budgetAmount),
  }
}

function validate() {
  const e = {}
  if (!form.name.trim()) e.name = '이름을 입력하세요.'
  if (!form.goal.trim()) e.goal = '목표를 입력하세요.'
  if (!form.background.trim()) e.background = '배경을 입력하세요.'
  if (!form.budgetAmount) e.budgetAmount = '예산을 입력하세요.'
  if (!form.startAt) e.startAt = '시작일을 입력하세요.'
  if (!form.endAt) e.endAt = '종료일을 입력하세요.'
  if (form.startAt && form.endAt && form.endAt < form.startAt) e.endAt = '종료일은 시작일 이후여야 합니다.'
  if (!form.useAzureMl && !form.useAzureDatabricks) e.platforms = '플랫폼을 하나 이상 선택하세요.'
  Object.assign(errors, { name: '', goal: '', background: '', budgetAmount: '', startAt: '', endAt: '', platforms: '' }, e)
  return !Object.keys(e).length
}

function save() {
  const res = dsp.saveProjectDraft(payload(), draftId.value || undefined)
  if (res.ok && !draftId.value) router.replace({ path: '/projects/new', query: { draft: res.id } })
}

function submit() {
  if (!validate()) {
    ui.toast('필수 항목을 확인하세요.', 'danger')
    return
  }
  const res = dsp.submitCreateApproval(payload(), draftId.value || undefined)
  if (res.ok) router.push('/projects')
}

function addMember() {
  form.members.push({ userId: '', projectRole: 'member' })
}

function removeMember(i) {
  form.members.splice(i, 1)
}
</script>

<template>
  <DsBanner v-if="sourceRequest" tone="info">
    분석요청 「{{ sourceRequest.title }}」에서 이어집니다. 생성 결재가 올라가면 요청 상태가 새 프로젝트로 바뀝니다.
    <template #action>
      <DsButton variant="secondary" :to="`/requests/${sourceRequest.id}`">요청 보기</DsButton>
    </template>
  </DsBanner>

  <DsPageHeader title="프로젝트 생성 신청" description="승인되면 관리 상태는 즉시 운영중이 됩니다. 클라우드 리소스는 부가 프로비저닝으로 따라갑니다.">
    <template #actions>
      <DsButton variant="ghost" to="/projects">취소</DsButton>
      <DsButton variant="secondary" @click="save">임시저장</DsButton>
      <DsButton variant="primary" @click="submit">결재 상신</DsButton>
    </template>
  </DsPageHeader>

  <div class="layout">
    <div class="form">
      <DsCard>
        <template #title>정의</template>
        <DsField label="이름" required :error="errors.name">
          <DsInput v-model="form.name" width="lg" />
        </DsField>
        <DsField label="목표" required :error="errors.goal">
          <DsTextarea v-model="form.goal" />
        </DsField>
        <DsField label="배경" required :error="errors.background">
          <DsTextarea v-model="form.background" />
        </DsField>
        <DsField label="기술 스택" hint="쉼표로 구분">
          <DsInput v-model="form.techStackText" width="lg" placeholder="Python, PyTorch" />
        </DsField>
      </DsCard>

      <DsCard>
        <template #title>계획</template>
        <DsField label="예산 (KRW)" required :error="errors.budgetAmount">
          <DsInput v-model="form.budgetAmount" type="number" width="md" />
        </DsField>
        <div class="row">
          <DsField label="시작일" required :error="errors.startAt">
            <DsInput v-model="form.startAt" type="date" width="sm" />
          </DsField>
          <DsField label="종료일" required :error="errors.endAt">
            <DsInput v-model="form.endAt" type="date" width="sm" />
          </DsField>
        </div>
        <DsField label="초기 멤버" hint="신청자는 오너로 지정됩니다. 오너·코디네이터 지정은 오너만 이후에도 가능합니다.">
          <div class="members">
            <div v-for="(m, i) in form.members" :key="i" class="member-row">
              <DsSelect v-model="m.userId" :options="userOptions" width="lg" placeholder="사용자" />
              <DsSelect
                v-model="m.projectRole"
                :options="[
                  { value: 'coordinator', label: roleLabel.coordinator },
                  { value: 'member', label: roleLabel.member },
                  { value: 'viewer', label: roleLabel.viewer },
                ]"
                width="sm"
                placeholder=""
              />
              <DsButton variant="ghost" @click="removeMember(i)">제거</DsButton>
            </div>
            <DsButton variant="secondary" @click="addMember">멤버 추가</DsButton>
          </div>
        </DsField>
      </DsCard>

      <DsCard>
        <template #title>플랫폼</template>
        <p v-if="errors.platforms" class="err">{{ errors.platforms }}</p>
        <DsCheckbox v-model="form.useAzureMl" label="Azure ML" />
        <div v-if="form.useAzureMl" class="nested">
          <DsField label="리전">
            <DsSelect
              v-model="form.azureMlSpec.region"
              :options="[{ value: 'koreacentral', label: 'koreacentral' }, { value: 'eastus', label: 'eastus' }]"
              placeholder=""
            />
          </DsField>
          <DsField label="SKU">
            <DsSelect
              v-model="form.azureMlSpec.sku"
              :options="[{ value: 'basic', label: 'basic' }, { value: 'standard', label: 'standard' }]"
              placeholder=""
            />
          </DsField>
        </div>
        <DsCheckbox v-model="form.useAzureDatabricks" label="Azure Databricks" />
        <div v-if="form.useAzureDatabricks" class="nested">
          <DsField label="리전">
            <DsSelect
              v-model="form.databricksSpec.region"
              :options="[{ value: 'koreacentral', label: 'koreacentral' }, { value: 'eastus', label: 'eastus' }]"
              placeholder=""
            />
          </DsField>
          <DsField label="SKU">
            <DsSelect
              v-model="form.databricksSpec.sku"
              :options="[{ value: 'premium', label: 'premium' }, { value: 'standard', label: 'standard' }]"
              placeholder=""
            />
          </DsField>
        </div>
        <p class="ds-meta">클러스터 설계·노트북 UI는 넣지 않습니다. 최소 스펙만 전달합니다.</p>
      </DsCard>
    </div>

    <aside>
      <DsCard>
        <template #title>상신 요약</template>
        <dl class="ds-dl">
          <div><dt>오너</dt><dd>{{ auth.user.name }}</dd></div>
          <div><dt>이름</dt><dd>{{ form.name || '—' }}</dd></div>
          <div><dt>예산</dt><dd>{{ form.budgetAmount ? formatWon(form.budgetAmount) : '—' }}</dd></div>
          <div><dt>기간</dt><dd>{{ form.startAt || '—' }} ~ {{ form.endAt || '—' }}</dd></div>
          <div>
            <dt>플랫폼</dt>
            <dd>
              {{
                [form.useAzureMl ? 'Azure ML' : null, form.useAzureDatabricks ? 'Azure Databricks' : null]
                  .filter(Boolean)
                  .join(', ') || '—'
              }}
            </dd>
          </div>
        </dl>
      </DsCard>
    </aside>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  gap: var(--ds-section-gap);
  grid-template-columns: minmax(0, 1fr) 356px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--ds-section-gap);
}

.row,
.nested,
.member-row {
  display: flex;
  gap: var(--ds-space-4);
}

.members {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
}

.err {
  color: var(--ds-danger);
}
</style>
