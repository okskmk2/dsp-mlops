<script setup>
import DsButton from '../ui/DsButton.vue'
import DsModal from '../ui/DsModal.vue'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()

async function confirm() {
  const fn = ui.dialog?.onConfirm
  ui.closeDialog()
  if (fn) await fn()
}
</script>

<template>
  <DsModal v-if="ui.dialog" :title="ui.dialog.title" :size="ui.dialog.size || 'sm'" @close="ui.closeDialog()">
    <p class="ds-body">{{ ui.dialog.body }}</p>
    <slot />
    <template #footer>
      <DsButton variant="ghost" @click="ui.closeDialog()">취소</DsButton>
      <DsButton
        :variant="ui.dialog.variant || 'primary'"
        @click="confirm"
      >
        {{ ui.dialog.confirmLabel || '확인' }}
      </DsButton>
    </template>
  </DsModal>
</template>
