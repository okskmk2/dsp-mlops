<script setup>
import DsButton from '../../components/ui/DsButton.vue'
import DsCard from '../../components/ui/DsCard.vue'
import DsChip from '../../components/ui/DsChip.vue'
import DsPageHeader from '../../components/ui/DsPageHeader.vue'
import DsTable from '../../components/ui/DsTable.vue'
import { useDspStore } from '../../stores/dsp'

const dsp = useDspStore()
</script>

<template>
  <DsPageHeader title="권한 관리" description="권한을 등록·수정하고 페이지 접근·API 호출 범위를 지정합니다." />

  <DsCard>
    <template #title>권한 목록</template>
    <template #action>
      <DsButton variant="primary" to="/admin/permissions/new">권한 추가</DsButton>
    </template>
    <DsTable
      :columns="[
        { key: 'name', label: '권한', strong: true },
        { key: 'description', label: '설명' },
        { key: 'pages', label: '페이지 접근', numeric: true },
        { key: 'apis', label: 'API 호출', numeric: true },
        { key: 'enabled', label: '상태' },
        { key: 'actions', label: '' },
      ]"
      :rows="dsp.permissions"
    >
      <template #description="{ row }">{{ row.description || '—' }}</template>
      <template #pages="{ row }">{{ row.pageKeys.length }}</template>
      <template #apis="{ row }">{{ row.apiKeys.length }}</template>
      <template #enabled="{ row }">
        <DsChip :tone="row.enabled === false ? 'neutral' : 'success'">
          {{ row.enabled === false ? '비활성' : '활성' }}
        </DsChip>
      </template>
      <template #actions="{ row }">
        <DsButton variant="ghost" :to="`/admin/permissions/${row.id}`">편집</DsButton>
        <DsButton v-if="row.enabled !== false" variant="ghost" @click="dsp.setPermissionEnabled(row.id, false)">비활성</DsButton>
        <DsButton v-else variant="ghost" @click="dsp.setPermissionEnabled(row.id, true)">활성</DsButton>
      </template>
    </DsTable>
  </DsCard>
</template>
