<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DsButton from '../../components/ui/DsButton.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { useDspStore } from '../../stores/dsp'

const dsp = useDspStore()
const router = useRouter()

const groups = computed(() => {
  const map = new Map()
  for (const row of dsp.codes) {
    if (!map.has(row.group)) map.set(row.group, { id: row.group, label: row.groupLabel, count: 0 })
    map.get(row.group).count += 1
  }
  return [...map.values()]
})
</script>

<template>
  <DsPageHeader title="코드 관리" description="상태·유형 등 공통 코드 그룹입니다. 그룹을 열어 코드를 편집합니다." />
  <DsTable
    :columns="[
      { key: 'label', label: '그룹', strong: true },
      { key: 'id', label: '식별자' },
      { key: 'count', label: '코드 수', numeric: true },
      { key: 'actions', label: '' },
    ]"
    :rows="groups"
    @row-click="(row) => router.push(`/admin/codes/${row.id}`)"
  >
    <template #id="{ row }"><span class="mono">{{ row.id }}</span></template>
    <template #actions="{ row }">
      <DsButton variant="ghost" :to="`/admin/codes/${row.id}`">열기</DsButton>
    </template>
  </DsTable>
</template>
