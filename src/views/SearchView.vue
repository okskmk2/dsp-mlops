<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsTabs from '../components/ui/DsTabs.vue'
import { approvalType, modelStage } from '../data/labels'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const tab = ref('project')
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const result = computed(() => dsp.search(q.value))

watch(q, () => {
  tab.value = 'project'
})

function open(kind, row) {
  if (kind === 'project') router.push(row.status === 'draft' ? { path: '/projects/new', query: { draft: row.id } } : `/projects/${row.id}`)
  if (kind === 'model') router.push(`/models/${row.id}`)
  if (kind === 'dataset') router.push(`/datasets/${row.id}`)
  if (kind === 'approval') router.push(`/approvals/${row.id}`)
  if (kind === 'guide') router.push(`/support/guides/${row.id}`)
  if (kind === 'notice') router.push(`/support/notices/${row.id}`)
  if (kind === 'analysisRequest') router.push(`/requests/${row.id}`)
}
</script>

<template>
  <DsPageHeader :title="q ? `검색 · ${q}` : '검색'" description="프로젝트, 모델, 데이터셋, 결재, 지원 글을 권한 범위 안에서 찾습니다." />
  <DsTabs
    v-model="tab"
    :tabs="[
      { id: 'project', label: `프로젝트 ${result.project.length}` },
      { id: 'model', label: `모델 ${result.model.length}` },
      { id: 'dataset', label: `데이터셋 ${result.dataset.length}` },
      { id: 'approval', label: `결재 ${result.approval.length}` },
      { id: 'guide', label: `사용법 ${result.guide.length}` },
      { id: 'notice', label: `공지 ${result.notice.length}` },
      { id: 'analysisRequest', label: `분석요청 ${result.analysisRequest.length}` },
    ]"
  />
  <ul class="list">
    <template v-if="tab === 'project'">
      <li v-for="p in result.project" :key="p.id">
        <button type="button" @click="open('project', p)">
          <span class="ds-body-strong">{{ p.name }}</span>
          <span class="ds-meta">{{ p.goal }}</span>
        </button>
      </li>
    </template>
    <template v-else-if="tab === 'model'">
      <li v-for="m in result.model" :key="m.id">
        <button type="button" @click="open('model', m)">
          <span class="ds-body-strong">{{ m.name }} {{ m.version }}</span>
          <span class="ds-meta">{{ modelStage[m.stage] }} · {{ dsp.projectById(m.projectId)?.name }}</span>
        </button>
      </li>
    </template>
    <template v-else-if="tab === 'dataset'">
      <li v-for="d in result.dataset" :key="d.id">
        <button type="button" @click="open('dataset', d)">
          <span class="ds-body-strong">{{ d.name }}</span>
          <span class="ds-meta mono">{{ d.ref }}</span>
        </button>
      </li>
    </template>
    <template v-else-if="tab === 'approval'">
      <li v-for="a in result.approval" :key="a.id">
        <button type="button" @click="open('approval', a)">
          <span class="ds-body-strong">{{ approvalType[a.type] }}</span>
          <span class="ds-meta">{{ a.id }} · {{ a.status }}</span>
        </button>
      </li>
    </template>
    <template v-else-if="tab === 'guide'">
      <li v-for="g in result.guide" :key="g.id">
        <button type="button" @click="open('guide', g)">
          <span class="ds-body-strong">{{ g.title }}</span>
          <span class="ds-meta">사용법</span>
        </button>
      </li>
    </template>
    <template v-else-if="tab === 'notice'">
      <li v-for="n in result.notice" :key="n.id">
        <button type="button" @click="open('notice', n)">
          <span class="ds-body-strong">{{ n.title }}</span>
          <span class="ds-meta">공지</span>
        </button>
      </li>
    </template>
    <template v-else>
      <li v-for="r in result.analysisRequest" :key="r.id">
        <button type="button" @click="open('analysisRequest', r)">
          <span class="ds-body-strong">{{ r.title }}</span>
          <span class="ds-meta">분석요청</span>
        </button>
      </li>
    </template>
  </ul>
  <DsEmpty v-if="q && result[tab].length === 0" title="결과가 없습니다" />
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  margin-top: var(--ds-space-4);
}

.list li,
.list button,
.list li > div {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
  min-height: 40px;
  padding: var(--ds-space-3) 0;
  text-align: left;
  width: 100%;
}

.list button:hover {
  color: var(--ds-link);
}
</style>
