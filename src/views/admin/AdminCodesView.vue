<script setup>
import { computed, reactive, ref } from 'vue'
import DsButton from '../../components/ui/DsButton.vue'
import DsChip from '../../components/ui/DsChip.vue'
import DsField from '../../components/ui/DsField.vue'
import DsInput from '../../components/ui/DsInput.vue'
import DsModal from '../../components/ui/DsModal.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { useDspStore } from '../../stores/dsp'

const dsp = useDspStore()
const group = ref('')
const open = ref(false)
const form = reactive({ id: '', group: '', code: '', label: '', sort: 1 })

const groups = computed(() => {
  const map = new Map()
  for (const row of dsp.codes) {
    if (!map.has(row.group)) map.set(row.group, { id: row.group, label: row.groupLabel, count: 0 })
    map.get(row.group).count += 1
  }
  return [...map.values()]
})

const selectedGroup = computed(() => group.value || groups.value[0]?.id || '')

const rows = computed(() =>
  dsp.codes.filter((c) => c.group === selectedGroup.value).slice().sort((a, b) => a.sort - b.sort),
)

const groupLabel = computed(() => groups.value.find((g) => g.id === selectedGroup.value)?.label || selectedGroup.value)

function startNew() {
  Object.assign(form, { id: '', group: selectedGroup.value, code: '', label: '', sort: (rows.value.at(-1)?.sort || 0) + 1 })
  open.value = true
}

function startEdit(row) {
  Object.assign(form, { id: row.id, group: row.group, code: row.code, label: row.label, sort: row.sort })
  open.value = true
}

function save() {
  const res = dsp.saveCode({ ...form })
  if (res.ok) open.value = false
}
</script>

<template>
  <DsPageHeader title="코드 관리" description="상태·유형 등 공통 코드를 관리합니다. 시스템 식별자(code)는 기존 값을 유지하는 것이 안전합니다.">
    <template #actions>
      <DsButton variant="primary" @click="startNew">코드 추가</DsButton>
    </template>
  </DsPageHeader>

  <div class="layout">
    <nav class="groups" aria-label="코드 그룹">
      <button
        v-for="g in groups"
        :key="g.id"
        type="button"
        class="group"
        :class="{ 'is-active': g.id === selectedGroup }"
        @click="group = g.id"
      >
        <span>{{ g.label }}</span>
        <span class="ds-meta tabular">{{ g.count }}</span>
      </button>
    </nav>
    <div>
      <h2 class="ds-title-sm">{{ groupLabel }}</h2>
      <DsTable
        :columns="[
          { key: 'code', label: '코드', strong: true },
          { key: 'label', label: '표시명' },
          { key: 'sort', label: '순서', numeric: true },
          { key: 'enabled', label: '상태' },
          { key: 'actions', label: '' },
        ]"
        :rows="rows"
      >
        <template #code="{ row }"><span class="mono">{{ row.code }}</span></template>
        <template #enabled="{ row }">
          <DsChip :tone="row.enabled ? 'success' : 'neutral'">{{ row.enabled ? '활성' : '비활성' }}</DsChip>
        </template>
        <template #actions="{ row }">
          <DsButton variant="ghost" @click="startEdit(row)">편집</DsButton>
          <DsButton v-if="row.enabled" variant="ghost" @click="dsp.setCodeEnabled(row.id, false)">비활성</DsButton>
          <DsButton v-else variant="ghost" @click="dsp.setCodeEnabled(row.id, true)">활성</DsButton>
        </template>
      </DsTable>
    </div>
  </div>

  <DsModal v-if="open" :title="form.id ? '코드 편집' : '코드 추가'" size="sm" @close="open = false">
    <DsField label="코드" required hint="영문·숫자 식별자">
      <DsInput v-model="form.code" width="full" class="mono" :disabled="Boolean(form.id)" />
    </DsField>
    <DsField label="표시명" required>
      <DsInput v-model="form.label" width="full" />
    </DsField>
    <DsField label="순서">
      <DsInput v-model="form.sort" type="number" width="sm" />
    </DsField>
    <template #footer>
      <DsButton variant="ghost" @click="open = false">취소</DsButton>
      <DsButton variant="primary" @click="save">저장</DsButton>
    </template>
  </DsModal>
</template>

<style scoped>
.layout {
  display: grid;
  gap: var(--ds-space-6);
  grid-template-columns: 16.6667rem minmax(0, 1fr);
}

.groups {
  background: var(--ds-canvas-subtle);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  display: flex;
  flex-direction: column;
  padding: var(--ds-space-2);
}

.group {
  align-items: center;
  border-radius: var(--ds-radius-md);
  display: flex;
  justify-content: space-between;
  min-height: 2.4444rem;
  padding: 0 var(--ds-space-3);
  text-align: left;
}

.group:hover {
  background: var(--ds-surface);
}

.group.is-active {
  background: var(--ds-primary-subtle);
  color: var(--ds-primary);
  font-weight: 600;
}

.ds-title-sm {
  margin-bottom: var(--ds-space-4);
}
</style>
