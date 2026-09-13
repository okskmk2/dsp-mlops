<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DsBreadcrumb from '../components/ui/DsBreadcrumb.vue'
import DsButton from '../components/ui/DsButton.vue'
import DsCard from '../components/ui/DsCard.vue'
import DsCheckbox from '../components/ui/DsCheckbox.vue'
import DsField from '../components/ui/DsField.vue'
import DsInput from '../components/ui/DsInput.vue'
import DsPageHeader from '../components/ui/DsPageHeader.vue'
import DsSelect from '../components/ui/DsSelect.vue'
import DsTextarea from '../components/ui/DsTextarea.vue'
import { guideCategory, noticeSeverity } from '../data/labels'
import { boardMeta } from '../lib/support'
import { useDspStore } from '../stores/dsp'
import { useUiStore } from '../stores/ui'

const route = useRoute()
const router = useRouter()
const dsp = useDspStore()
const ui = useUiStore()

const board = computed(() => (route.meta.board === 'notice' ? 'notice' : 'guide'))
const meta = computed(() => boardMeta(board.value))
const editingId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))

const form = reactive({
  title: '',
  body: '',
  category: 'getting_started',
  severity: 'info',
  pinned: false,
  expiresAt: '',
})

const errors = reactive({ title: '', body: '' })

watch(
  editingId,
  (id) => {
    if (!id) {
      Object.assign(form, {
        title: '',
        body: '',
        category: 'getting_started',
        severity: 'info',
        pinned: false,
        expiresAt: '',
      })
      return
    }
    const post = dsp.supportPostById(id)
    if (!post || post.board !== board.value) {
      ui.toast('글을 찾을 수 없습니다.', 'danger')
      router.replace(meta.value.listPath)
      return
    }
    Object.assign(form, {
      title: post.title,
      body: post.body,
      category: post.category || 'getting_started',
      severity: post.severity || 'info',
      pinned: Boolean(post.pinned),
      expiresAt: post.expiresAt ? post.expiresAt.slice(0, 10) : '',
    })
  },
  { immediate: true },
)

function payload(status) {
  return {
    id: editingId.value || undefined,
    board: board.value,
    title: form.title,
    body: form.body,
    category: form.category,
    severity: form.severity,
    pinned: form.pinned,
    expiresAt: form.expiresAt ? `${form.expiresAt}T00:00:00+09:00` : null,
    status,
  }
}

function validate() {
  const e = {}
  if (!form.title.trim()) e.title = '제목을 입력하세요.'
  if (!form.body.trim()) e.body = '본문을 입력하세요.'
  Object.assign(errors, { title: '', body: '' }, e)
  return !Object.keys(e).length
}

function save(status) {
  if (!validate()) {
    ui.toast('필수 항목을 확인하세요.', 'danger')
    return
  }
  const res = dsp.saveSupportPost(payload(status))
  if (res.ok) router.push(`${meta.value.listPath}/${res.id}`)
}
</script>

<template>
  <DsBreadcrumb
    :items="[
      { label: meta.label, to: meta.listPath },
      { label: editingId ? '편집' : '글쓰기' },
    ]"
  />
  <DsPageHeader :title="editingId ? `${meta.label} 편집` : `${meta.label} 글쓰기`" description="본문은 평문입니다. 댓글은 없습니다.">
    <template #actions>
      <DsButton variant="ghost" :to="meta.listPath">취소</DsButton>
      <DsButton variant="secondary" @click="save('draft')">임시저장</DsButton>
      <DsButton variant="primary" @click="save('published')">게시</DsButton>
    </template>
  </DsPageHeader>

  <DsCard>
    <DsField label="제목" required :error="errors.title">
      <DsInput v-model="form.title" width="full" />
    </DsField>
    <DsField v-if="board === 'guide'" label="분류" required>
      <DsSelect
        v-model="form.category"
        :options="Object.entries(guideCategory).map(([value, label]) => ({ value, label }))"
        placeholder=""
      />
    </DsField>
    <template v-else>
      <DsField label="중요도" required>
        <DsSelect
          v-model="form.severity"
          :options="Object.entries(noticeSeverity).map(([value, label]) => ({ value, label }))"
          placeholder=""
        />
      </DsField>
      <DsField label="만료일" hint="비우면 기한 없음">
        <DsInput v-model="form.expiresAt" type="date" width="sm" />
      </DsField>
    </template>
    <DsField label="본문" required :error="errors.body">
      <DsTextarea v-model="form.body" :rows="12" />
    </DsField>
    <DsCheckbox v-model="form.pinned" :label="board === 'notice' ? '홈에 고정' : '목록 상단 고정'" />
  </DsCard>
</template>
