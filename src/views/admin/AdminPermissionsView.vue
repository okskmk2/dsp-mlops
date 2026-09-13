<script setup>
import { computed, reactive, ref } from 'vue'
import DsButton from '../../components/ui/DsButton.vue'
import DsCard from '../../components/ui/DsCard.vue'
import DsCheckbox from '../../components/ui/DsCheckbox.vue'
import DsField from '../../components/ui/DsField.vue'
import DsModal from '../../components/ui/DsModal.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsSelect from '../../components/ui/DsSelect.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { approvalType, platformRole, projectRole } from '../../data/labels'
import { useDspStore } from '../../stores/dsp'

const dsp = useDspStore()
const lineOpen = ref(false)
const lineForm = reactive({ id: '', type: 'project_create', approverId: '' })

const roleOptions = [
  { value: 'dsp_admin', label: platformRole.dsp_admin },
  { value: 'officer', label: platformRole.officer },
  { value: 'general', label: platformRole.general },
]

const approverOptions = computed(() =>
  dsp.users
    .filter((u) => u.enabled !== false)
    .map((u) => ({ value: u.id, label: `${u.name} (${platformRole[u.platformRole]})` })),
)

const typeOptions = Object.entries(approvalType).map(([value, label]) => ({ value, label }))

const platformMatrix = [
  { id: 'listAll', action: '전 프로젝트 목록', dsp_admin: true, officer: true, general: false },
  { id: 'listMine', action: '소속 프로젝트만 목록', dsp_admin: false, officer: false, general: true },
  { id: 'settings', action: 'DSP 설정·사용자·코드', dsp_admin: true, officer: false, general: false },
  { id: 'retry', action: '프로비저닝 재시도', dsp_admin: true, officer: false, general: false },
  { id: 'orgCost', action: '전사 비용 대시보드', dsp_admin: true, officer: true, general: false },
  { id: 'support', action: '사용법·공지 작성', dsp_admin: true, officer: false, general: false },
  { id: 'requestCreate', action: '분석요청 제출', dsp_admin: true, officer: true, general: true },
  { id: 'requestAll', action: '분석요청 전체 조회', dsp_admin: true, officer: true, general: false },
  { id: 'requestTriage', action: '분석요청 배정·반려', dsp_admin: true, officer: false, general: false },
]

const projectMatrix = [
  { id: 'view', action: '조회', owner: true, coordinator: true, member: true, viewer: true },
  { id: 'cloud', action: '클라우드 딥링크', owner: true, coordinator: true, member: true, viewer: false },
  { id: 'create', action: '생성 상신', owner: true, coordinator: false, member: false, viewer: false },
  { id: 'budget', action: '예산·기한 상신', owner: true, coordinator: false, member: false, viewer: false },
  { id: 'close', action: '종료 상신', owner: true, coordinator: false, member: false, viewer: false },
  { id: 'members', action: '멤버 관리(제한)', owner: true, coordinator: true, member: false, viewer: false },
  { id: 'ownerCoord', action: '오너·코디네이터 지정', owner: true, coordinator: false, member: false, viewer: false },
  { id: 'threshold', action: '모니터 기준치', owner: true, coordinator: true, member: false, viewer: false },
  { id: 'retrain', action: '재학습 요청', owner: true, coordinator: true, member: true, viewer: false },
  { id: 'promote', action: '승격·강등 상신', owner: true, coordinator: true, member: false, viewer: false },
  { id: 'contam', action: '오염 선언', owner: true, coordinator: true, member: true, viewer: false },
  { id: 'compute', action: '컴퓨팅 상향 신청', owner: true, coordinator: true, member: true, viewer: false },
]

function mark(on) {
  return on ? '허용' : '—'
}

function startLine(row) {
  if (row) Object.assign(lineForm, { id: row.id, type: row.type, approverId: row.approverId })
  else Object.assign(lineForm, { id: '', type: 'project_create', approverId: '' })
  lineOpen.value = true
}

function saveLine() {
  const res = dsp.saveApprovalLine({ ...lineForm })
  if (res.ok) lineOpen.value = false
}
</script>

<template>
  <DsPageHeader title="권한 관리" description="플랫폼 역할과 결재선을 다룹니다. 프로젝트 멤버 역할은 프로젝트 팀 화면에서 지정합니다." />

  <div class="stack">
    <DsCard>
      <template #title>플랫폼 역할</template>
      <DsTable
        :columns="[
          { key: 'name', label: '사용자', strong: true },
          { key: 'platformRole', label: '역할' },
          { key: 'isApprover', label: '승인권자' },
        ]"
        :rows="dsp.users.filter((u) => u.enabled !== false)"
      >
        <template #platformRole="{ row }">
          <DsSelect
            :model-value="row.platformRole"
            :options="roleOptions"
            width="sm"
            placeholder=""
            @update:model-value="(v) => dsp.setPlatformRole(row.id, v)"
          />
        </template>
        <template #isApprover="{ row }">
          <DsCheckbox
            :model-value="row.isApprover"
            label="승인권자"
            @update:model-value="(v) => dsp.setApproverFlag(row.id, v)"
          />
        </template>
      </DsTable>
    </DsCard>

    <DsCard>
      <template #title>결재선</template>
      <template #action>
        <DsButton variant="secondary" @click="startLine()">추가</DsButton>
      </template>
      <DsTable
        :columns="[
          { key: 'type', label: '유형' },
          { key: 'approver', label: '승인권자' },
          { key: 'actions', label: '' },
        ]"
        :rows="dsp.approvalLines"
      >
        <template #type="{ row }">{{ approvalType[row.type] }}</template>
        <template #approver="{ row }">{{ dsp.userById(row.approverId)?.name }}</template>
        <template #actions="{ row }">
          <DsButton variant="ghost" @click="startLine(row)">편집</DsButton>
        </template>
      </DsTable>
    </DsCard>

    <DsCard>
      <template #title>플랫폼 권한 매트릭스</template>
      <p class="ds-meta">1층 플랫폼 역할이 목록 범위를 정합니다. 결재 승인/반려는 승인권자만.</p>
      <DsTable
        :columns="[
          { key: 'action', label: '동작', strong: true },
          { key: 'dsp_admin', label: platformRole.dsp_admin },
          { key: 'officer', label: platformRole.officer },
          { key: 'general', label: platformRole.general },
        ]"
        :rows="platformMatrix"
      >
        <template #dsp_admin="{ row }">{{ mark(row.dsp_admin) }}</template>
        <template #officer="{ row }">{{ mark(row.officer) }}</template>
        <template #general="{ row }">{{ mark(row.general) }}</template>
      </DsTable>
    </DsCard>

    <DsCard>
      <template #title>프로젝트 권한 매트릭스</template>
      <p class="ds-meta">2층 프로젝트 역할이 쓰기 가능 여부를 정합니다.</p>
      <DsTable
        :columns="[
          { key: 'action', label: '동작', strong: true },
          { key: 'owner', label: projectRole.owner },
          { key: 'coordinator', label: projectRole.coordinator },
          { key: 'member', label: projectRole.member },
          { key: 'viewer', label: projectRole.viewer },
        ]"
        :rows="projectMatrix"
      >
        <template #owner="{ row }">{{ mark(row.owner) }}</template>
        <template #coordinator="{ row }">{{ mark(row.coordinator) }}</template>
        <template #member="{ row }">{{ mark(row.member) }}</template>
        <template #viewer="{ row }">{{ mark(row.viewer) }}</template>
      </DsTable>
    </DsCard>
  </div>

  <DsModal v-if="lineOpen" title="결재선" size="sm" @close="lineOpen = false">
    <DsField label="유형">
      <DsSelect v-model="lineForm.type" :options="typeOptions" width="full" placeholder="" />
    </DsField>
    <DsField label="승인권자">
      <DsSelect v-model="lineForm.approverId" :options="approverOptions" width="full" />
    </DsField>
    <template #footer>
      <DsButton variant="ghost" @click="lineOpen = false">취소</DsButton>
      <DsButton variant="primary" :disabled="!lineForm.approverId" @click="saveLine">저장</DsButton>
    </template>
  </DsModal>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--ds-section-gap);
}
</style>
