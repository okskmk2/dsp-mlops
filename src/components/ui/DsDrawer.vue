<script setup>
import { X } from '@lucide/vue'
import { onMounted, onUnmounted } from 'vue'
import DsIconButton from './DsIconButton.vue'

defineProps({
  title: { type: String, required: true },
})

const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="ds-drawer-root">
    <div class="ds-scrim" @click="emit('close')" />
    <aside class="ds-drawer" role="dialog" aria-modal="true" :aria-label="title">
      <header class="ds-drawer-head">
        <h2 class="ds-title-sm">{{ title }}</h2>
        <DsIconButton :icon="X" label="닫기" @click="emit('close')" />
      </header>
      <div class="ds-drawer-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="ds-drawer-foot">
        <slot name="footer" />
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.ds-drawer-root {
  inset: 0;
  position: fixed;
  z-index: var(--ds-z-modal);
}

.ds-scrim {
  background: var(--ds-overlay);
  inset: 0;
  position: absolute;
}

.ds-drawer {
  background: var(--ds-surface-raised);
  border-left: 1px solid var(--ds-border);
  bottom: 0;
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 0;
  width: 26.6667rem;
}

.ds-drawer-head {
  align-items: center;
  border-bottom: 1px solid var(--ds-border-subtle);
  display: flex;
  height: var(--ds-gnb-h);
  justify-content: space-between;
  padding: 0 var(--ds-space-6);
}

.ds-drawer-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-space-4);
  overflow: auto;
  padding: var(--ds-space-6);
}

.ds-drawer-foot {
  border-top: 1px solid var(--ds-border-subtle);
  display: flex;
  gap: var(--ds-space-2);
  justify-content: flex-end;
  padding: var(--ds-space-4) var(--ds-space-6);
}
</style>
