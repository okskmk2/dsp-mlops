<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModelSubnav from '../components/layout/ModelSubnav.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTable from '../components/ui/DsTable.vue'
import { projectRole } from '../data/labels'
import { formatDate } from '../lib/format'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const dsp = useDspStore()
const model = computed(() => dsp.modelById(route.params.id))
const project = computed(() => model.value && dsp.projectById(model.value.projectId))
const rows = computed(() => dsp.members.filter((member) => member.projectId === model.value?.projectId).map((member) => ({ ...member, id: member.userId, name: dsp.userById(member.userId)?.name, email: dsp.userById(member.userId)?.email })))
const columns = [{ key: 'name', label: '이름', strong: true }, { key: 'email', label: '이메일' }, { key: 'projectRole', label: '프로젝트 역할' }, { key: 'addedAt', label: '참여일' }]
</script>

<template>
  <div v-if="model && project"><DsPageHeader :title="`${model.name} ${model.version}`" :description="project.name" /><ModelSubnav :model-id="model.id" /><DsTable :columns="columns" :rows="rows"><template #projectRole="{ row }">{{ projectRole[row.projectRole] }}</template><template #addedAt="{ row }">{{ formatDate(row.addedAt) }}</template></DsTable></div>
</template>
