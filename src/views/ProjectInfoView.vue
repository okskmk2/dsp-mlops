<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { platformType, projectStatus, projectStatusChip } from '../data/labels'
import { formatDate, formatWon } from '../lib/format'
import { useDspStore } from '../stores/dsp'
import DsChip from '../components/ui/DsChip.vue'

const route = useRoute()
const dsp = useDspStore()
const project = computed(() => dsp.projectById(route.params.id))
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" description="프로젝트의 목적과 운영 기본정보입니다." />
    <ProjectSubnav :project-id="project.id" />
    <DsCard>
      <template #title>프로젝트 기본정보</template>
      <dl class="ds-dl">
        <div><dt>상태</dt><dd><DsChip :tone="projectStatusChip[project.status]">{{ projectStatus[project.status] }}</DsChip></dd></div>
        <div><dt>오너</dt><dd>{{ dsp.userById(project.ownerUserId)?.name }}</dd></div>
        <div><dt>목표</dt><dd>{{ project.goal }}</dd></div>
        <div><dt>배경</dt><dd>{{ project.background }}</dd></div>
        <div><dt>기술 스택</dt><dd>{{ (project.techStack || []).join(', ') || '—' }}</dd></div>
        <div><dt>기간</dt><dd>{{ formatDate(project.startAt) }} - {{ formatDate(project.endAt) }}</dd></div>
        <div><dt>예산</dt><dd>{{ formatWon(project.budgetAmount) }}</dd></div>
        <div><dt>플랫폼</dt><dd>{{ project.platforms.map((item) => platformType[item]).join(', ') }}</dd></div>
      </dl>
    </DsCard>
  </div>
</template>
