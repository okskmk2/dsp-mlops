<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsField from '../components/ui/DsField.vue'
import DsModal from '../components/ui/DsModal.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTable from '../components/ui/DsTable.vue'
import { projectRole as roleLabel } from '../data/labels'
import { formatDate } from '../lib/format'
import { canWriteProject, projectRoleOf } from '../lib/permissions'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()
const id = computed(() => route.params.id)
const project = computed(() => dsp.projectById(id.value))
const actorRole = computed(() => projectRoleOf(auth.user, id.value, dsp.members))
const canManage = computed(() => canWriteProject(auth.user, project.value, dsp.members, 'manageMembersLimited'))

const rows = computed(() =>
  dsp.members
    .filter((m) => m.projectId === id.value)
    .map((m) => ({
      ...m,
      id: `${m.projectId}-${m.userId}`,
      user: dsp.userById(m.userId)?.name,
      email: dsp.userById(m.userId)?.email,
      platformRoleHint: dsp.userById(m.userId)?.platformRole,
    })),
)

const columns = [
  { key: 'user', label: '사용자', strong: true },
  { key: 'email', label: '메일' },
  { key: 'projectRole', label: '프로젝트 역할' },
  { key: 'platformRoleHint', label: '플랫폼 역할' },
  { key: 'addedAt', label: '추가일' },
  { key: 'actions', label: '' },
]

const open = ref(false)
const form = reactive({ userId: '', projectRole: 'member' })
const userOptions = computed(() =>
  dsp.users
    .filter((u) => !dsp.members.some((m) => m.projectId === id.value && m.userId === u.id))
    .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
)

const roleOptions = computed(() => {
  const all = [
    { value: 'coordinator', label: roleLabel.coordinator },
    { value: 'member', label: roleLabel.member },
    { value: 'viewer', label: roleLabel.viewer },
  ]
  if (actorRole.value === 'owner') {
    return [{ value: 'owner', label: roleLabel.owner }, ...all]
  }
  return all
})
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="프로젝트 역할을 배정합니다. 코디네이터는 오너·코디네이터를 지정하거나 해제할 수 없습니다.">
      <template #actions>
        <DsButton v-if="canManage" variant="primary" @click="open = true">추가</DsButton>
      </template>
    </DsPageHeader>
    <ProjectSubnav :project-id="project.id" />
    <DsTable :columns="columns" :rows="rows">
      <template #projectRole="{ row }">
        <DsSelect
          v-if="canManage && row.projectRole !== 'owner'"
          :model-value="row.projectRole"
          :options="roleOptions"
          width="sm"
          placeholder=""
          @update:model-value="(v) => dsp.changeMemberRole(project.id, row.userId, v)"
        />
        <span v-else>{{ roleLabel[row.projectRole] }}</span>
      </template>
      <template #platformRoleHint="{ row }">{{ row.platformRoleHint }}</template>
      <template #addedAt="{ row }">{{ formatDate(row.addedAt) }}</template>
      <template #actions="{ row }">
        <DsButton
          v-if="canManage && row.projectRole !== 'owner'"
          variant="ghost"
          @click="dsp.removeMember(project.id, row.userId)"
        >
          제거
        </DsButton>
      </template>
    </DsTable>

    <DsModal v-if="open" title="멤버 추가" size="sm" @close="open = false">
      <DsField label="사용자">
        <DsSelect v-model="form.userId" :options="userOptions" width="full" />
      </DsField>
      <DsField label="역할">
        <DsSelect v-model="form.projectRole" :options="roleOptions.filter((r) => r.value !== 'owner')" width="full" placeholder="" />
      </DsField>
      <template #footer>
        <DsButton variant="ghost" @click="open = false">취소</DsButton>
        <DsButton
          variant="primary"
          :disabled="!form.userId"
          @click="dsp.addMember(project.id, form.userId, form.projectRole) && (open = false)"
        >
          추가
        </DsButton>
      </template>
    </DsModal>
  </div>
</template>
