<script setup>
import { X } from '@lucide/vue'
import { onMounted, onUnmounted } from 'vue'
import DsIconButton from './DsIconButton.vue'

const props = defineProps({
  title: { type: String, required: true },
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="ds-modal-root">
    <div class="ds-scrim" @click="emit('close')" />
    <div
      class="ds-modal"
      :class="`is-${size}`"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <header class="ds-modal-head">
        <h2 class="ds-title">{{ title }}</h2>
        <DsIconButton :icon="X" label="닫기" @click="emit('close')" />
      </header>
      <div class="ds-modal-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="ds-modal-foot">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ds-modal-root {
  inset: 0;
  position: fixed;
  z-index: var(--ds-z-modal);
}

.ds-scrim {
  background: var(--ds-overlay);
  inset: 0;
  opacity: 1;
  position: absolute;
  transition: opacity var(--ds-duration-fast) var(--ds-easing);
}

.ds-modal {
  background: var(--ds-surface-raised);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  display: flex;
  flex-direction: column;
  left: 50%;
  margin-left: -284px;
  max-height: calc(100vh - 64px);
  padding: var(--ds-space-6);
  position: absolute;
  top: 64px;
  width: 568px;
}

.ds-modal.is-sm {
  margin-left: -214px;
  width: 428px;
}

.ds-modal.is-lg {
  margin-left: -392px;
  width: 784px;
}

.ds-modal-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--ds-space-5);
}

.ds-modal-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-space-4);
  overflow: auto;
}

.ds-modal-foot {
  display: flex;
  gap: var(--ds-space-2);
  justify-content: flex-end;
  margin-top: var(--ds-space-5);
}
</style>
