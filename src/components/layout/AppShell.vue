<script setup>
import { RouterView } from 'vue-router'
import Gnb from './Gnb.vue'
import Snb from './Snb.vue'
import GlobalDialog from './GlobalDialog.vue'
import RetrainModal from '../modals/RetrainModal.vue'
import { useUiStore } from '../../stores/ui'

const ui = useUiStore()
</script>

<template>
  <a class="skip-link" href="#main">본문으로</a>
  <div class="shell">
    <Gnb />
    <Snb />
    <main id="main" class="main" tabindex="-1">
      <RouterView />
    </main>
  </div>
  <RetrainModal v-if="ui.retrainModelId" />
  <GlobalDialog />
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: var(--ds-snb-w) minmax(0, 1fr);
  grid-template-rows: var(--ds-gnb-h) 1fr;
  min-height: 100vh;
  width: 100%;
}

.main {
  background: var(--ds-canvas);
  min-width: 0;
  overflow-x: auto;
  padding: var(--ds-page-pad-y) var(--ds-page-pad-x);
}
</style>
