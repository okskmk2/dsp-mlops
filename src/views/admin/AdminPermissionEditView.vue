<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsBreadcrumb from '../../components/ui/DsBreadcrumb.vue'
import DsButton from '../../components/ui/DsButton.vue'
import DsCard from '../../components/ui/DsCard.vue'
import DsCheckbox from '../../components/ui/DsCheckbox.vue'
import DsField from '../../components/ui/DsField.vue'
import DsInput from '../../components/ui/DsInput.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsTextarea from '../../components/ui/DsTextarea.vue'
import { API_PERMISSION_GROUPS, PAGE_PERMISSION_GROUPS } from '../../lib/permissionCatalog'
import { useDspStore } from '../../stores/dsp'
import { useUiStore } from '../../stores/ui'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const ui = useUiStore()

const editingId = computed(() => (route.path === '/admin/permissions/new' ? '' : String(route.params.id || '')))

const form = reactive({
  name: '',
  description: '',
  pageKeys: [],
  apiKeys: [],
})

const errors = reactive({ name: '' })

watch(
  editingId,
  (id) => {
    if (!id) {
      Object.assign(form, { name: '', description: '', pageKeys: [], apiKeys: [] })
      return
    }
    const perm = dsp.permissionById(id)
    if (!perm) {
      ui.toast('권한을 찾을 수 없습니다.', 'danger')
      router.replace('/admin/permissions')
      return
    }
    Object.assign(form, {
      name: perm.name,
      description: perm.description || '',
      pageKeys: [...perm.pageKeys],
      apiKeys: [...perm.apiKeys],
    })
  },
  { immediate: true },
)

function hasPage(key) {
  return form.pageKeys.includes(key)
}

function togglePage(key, checked) {
  form.pageKeys = checked ? [...form.pageKeys, key] : form.pageKeys.filter((k) => k !== key)
}

function hasApi(key) {
  return form.apiKeys.includes(key)
}

function toggleApi(key, checked) {
  form.apiKeys = checked ? [...form.apiKeys, key] : form.apiKeys.filter((k) => k !== key)
}

function toggleGroupPages(group, checked) {
  const keys = group.items.map((i) => i.key)
  form.pageKeys = checked
    ? Array.from(new Set([...form.pageKeys, ...keys]))
    : form.pageKeys.filter((k) => !keys.includes(k))
}

function toggleGroupApis(group, checked) {
  const keys = group.items.map((i) => i.key)
  form.apiKeys = checked
    ? Array.from(new Set([...form.apiKeys, ...keys]))
    : form.apiKeys.filter((k) => !keys.includes(k))
}

function groupPagesChecked(group) {
  return group.items.every((i) => form.pageKeys.includes(i.key))
}

function groupApisChecked(group) {
  return group.items.every((i) => form.apiKeys.includes(i.key))
}

function validate() {
  const e = {}
  if (!form.name.trim()) e.name = '권한 이름을 입력하세요.'
  Object.assign(errors, { name: '' }, e)
  return !Object.keys(e).length
}

function save() {
  if (!validate()) {
    ui.toast('필수 항목을 확인하세요.', 'danger')
    return
  }
  const res = dsp.savePermission({ id: editingId.value || undefined, ...form })
  if (res.ok) router.push('/admin/permissions')
}
</script>

<template>
  <DsBreadcrumb
    :items="[
      { label: '권한 관리', to: '/admin/permissions' },
      { label: editingId ? '권한 편집' : '권한 추가' },
    ]"
  />
  <DsPageHeader :title="editingId ? '권한 편집' : '권한 추가'" description="페이지 접근 권한과 API 호출 권한을 체크박스로 지정합니다.">
    <template #actions>
      <DsButton variant="ghost" to="/admin/permissions">취소</DsButton>
      <DsButton variant="primary" @click="save">저장</DsButton>
    </template>
  </DsPageHeader>

  <div class="stack">
    <DsCard>
      <template #title>기본 정보</template>
      <DsField label="권한 이름" required :error="errors.name">
        <DsInput v-model="form.name" width="full" />
      </DsField>
      <DsField label="설명">
        <DsTextarea v-model="form.description" :rows="2" />
      </DsField>
    </DsCard>

    <DsCard>
      <template #title>페이지 접근 권한</template>
      <div class="perm-groups">
        <div v-for="group in PAGE_PERMISSION_GROUPS" :key="group.group" class="perm-group">
          <DsCheckbox
            class="group-check"
            :model-value="groupPagesChecked(group)"
            :label="group.group"
            @update:model-value="(v) => toggleGroupPages(group, v)"
          />
          <div class="perm-items">
            <DsCheckbox
              v-for="item in group.items"
              :key="item.key"
              :model-value="hasPage(item.key)"
              :label="item.label"
              @update:model-value="(v) => togglePage(item.key, v)"
            />
          </div>
        </div>
      </div>
    </DsCard>

    <DsCard>
      <template #title>API 호출 권한</template>
      <div class="perm-groups">
        <div v-for="group in API_PERMISSION_GROUPS" :key="group.group" class="perm-group">
          <DsCheckbox
            class="group-check"
            :model-value="groupApisChecked(group)"
            :label="group.group"
            @update:model-value="(v) => toggleGroupApis(group, v)"
          />
          <div class="perm-items">
            <DsCheckbox
              v-for="item in group.items"
              :key="item.key"
              :model-value="hasApi(item.key)"
              :label="item.label"
              @update:model-value="(v) => toggleApi(item.key, v)"
            />
          </div>
        </div>
      </div>
    </DsCard>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--ds-section-gap);
}

.perm-groups {
  display: grid;
  gap: var(--ds-space-5);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.perm-group {
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: var(--ds-space-3);
}

.group-check {
  font-weight: 600;
  margin-bottom: var(--ds-space-2);
}

.perm-items {
  border-top: 1px solid var(--ds-border);
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
  margin-top: var(--ds-space-2);
  padding-left: var(--ds-space-4);
  padding-top: var(--ds-space-2);
}
</style>
