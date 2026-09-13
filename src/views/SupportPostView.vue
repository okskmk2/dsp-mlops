<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsChip from '../components/ui/DsChip.vue'
import DsEmpty from '../components/ui/DsEmpty.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import {
  guideCategory,
  noticeSeverity,
  noticeSeverityChip,
  postStatus,
  postStatusChip,
} from '../data/labels'
import { formatDateTime } from '../lib/format'
import { canManageSupport } from '../lib/permissions'
import { boardMeta, postEditPath } from '../lib/support'
import { useAuthStore } from '../stores/auth'
import { useDspStore } from '../stores/dsp'

const route = useRoute()
const auth = useAuthStore()
const dsp = useDspStore()

const post = computed(() => dsp.supportPostById(route.params.id))
const allowed = computed(() => post.value && dsp.canSeeSupportPost(post.value))
const meta = computed(() => boardMeta(post.value?.board || route.meta.board))
</script>

<template>
  <DsEmpty v-if="!allowed" title="글을 찾을 수 없습니다">
    <DsButton variant="secondary" :to="meta.listPath">목록</DsButton>
  </DsEmpty>
  <div v-else>
    <DsBreadcrumb :items="[{ label: meta.label, to: meta.listPath }, { label: post.title }]" />
    <DsPageHeader :title="post.title">
      <template #actions>
        <DsButton v-if="canManageSupport(auth.user)" variant="secondary" :to="postEditPath(post)">편집</DsButton>
        <DsButton variant="ghost" :to="meta.listPath">목록</DsButton>
      </template>
    </DsPageHeader>
    <p class="meta">
      <DsChip v-if="post.pinned" tone="info">고정</DsChip>
      <DsChip :tone="postStatusChip[post.status]">{{ postStatus[post.status] }}</DsChip>
      <DsChip v-if="post.board === 'guide'" tone="neutral">{{ guideCategory[post.category] }}</DsChip>
      <DsChip v-else :tone="noticeSeverityChip[post.severity]">{{ noticeSeverity[post.severity] }}</DsChip>
      <span class="ds-meta">{{ dsp.userById(post.authorId)?.name }} · {{ formatDateTime(post.updatedAt) }}</span>
    </p>
    <article class="article ds-body">{{ post.body }}</article>
  </div>
</template>

<style scoped>
.meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
  margin-bottom: var(--ds-section-gap);
}

.article {
  max-width: 840px;
  white-space: pre-wrap;
}
</style>
