<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ProjectSubnav from '../components/layout/ProjectSubnav.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const dsp = useDspStore()
const id = computed(() => route.params.id)
const project = computed(() => dsp.projectById(id.value))
const tasks = [
  { id: 'task-1', title: '판매 데이터 품질 검증', state: '진행 중', owner: '김민준', tags: ['데이터', 'P1'] },
  { id: 'task-2', title: '수요예측 v1.6 비교 평가', state: '할 일', owner: '이서준', tags: ['모델'] },
  { id: 'task-3', title: '운영 엔드포인트 점검', state: '완료', owner: '박지은', tags: ['운영'] },
  { id: 'task-4', title: '9월 배포 승인 준비', state: '할 일', owner: '김민준', tags: ['릴리스'] },
]
</script>

<template>
  <div v-if="project">
    <DsPageHeader :title="project.name" :description="project.goal">
    </DsPageHeader>
    <ProjectSubnav :project-id="project.id" />

    <section class="work-board">
      <header class="board-head"><h2>작업 보드</h2><DsButton variant="secondary">작업 추가</DsButton></header>
      <div class="board-columns">
        <div v-for="state in ['할 일', '진행 중', '완료']" :key="state" class="board-column"><h3>{{ state }} <span>{{ tasks.filter((task) => task.state === state).length }}</span></h3><article v-for="task in tasks.filter((item) => item.state === state)" :key="task.id" class="task"><strong>{{ task.title }}</strong><div class="task-meta"><span>{{ task.owner }}</span><span>{{ task.tags.join(' · ') }}</span></div></article></div>
      </div>
    </section>
  </div>
  <p v-else class="ds-body">프로젝트를 찾을 수 없습니다.</p>
</template>

<style scoped>
.work-board { margin-bottom: var(--ds-section-gap); }
.board-head { align-items: flex-start; display: flex; justify-content: space-between; margin-bottom: var(--ds-space-3); }
.board-head h2 { font-size: var(--ds-font-title-sm); margin: 0 0 var(--ds-space-1); }
.board-columns { display: grid; gap: var(--ds-space-3); grid-template-columns: repeat(3, minmax(0, 1fr)); }
.board-column { background: var(--ds-canvas-subtle); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-lg); min-height: 170px; padding: var(--ds-space-3); }
.board-column h3 { align-items: center; display: flex; font-size: var(--ds-font-label); justify-content: space-between; margin: 0 0 var(--ds-space-3); }
.board-column h3 span { color: var(--ds-text-secondary); font-size: var(--ds-font-meta); }
.task { background: var(--ds-surface); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-md); display: flex; flex-direction: column; gap: var(--ds-space-3); margin-bottom: var(--ds-space-2); padding: var(--ds-space-3); }
.task-meta { color: var(--ds-text-secondary); display: flex; font-size: var(--ds-font-meta); justify-content: space-between; }
</style>
