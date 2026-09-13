import { ref } from 'vue'
import { defineStore } from 'pinia'
import { nid } from '../lib/format'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const dialog = ref(null)
  const drawer = ref(null)
  const retrainModelId = ref(null)
  const searchOpen = ref(false)
  const monitorOpen = ref(false)
  const avatarOpen = ref(false)

  function toast(message, tone = 'info') {
    const id = nid('toast')
    toasts.value = [...toasts.value, { id, message, tone }]
    window.setTimeout(() => dismissToast(id), 4200)
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function openDialog(payload) {
    dialog.value = payload
  }

  function closeDialog() {
    dialog.value = null
  }

  function openDrawer(payload) {
    drawer.value = payload
  }

  function closeDrawer() {
    drawer.value = null
  }

  function closeOverlays() {
    searchOpen.value = false
    monitorOpen.value = false
    avatarOpen.value = false
  }

  return {
    toasts,
    dialog,
    drawer,
    retrainModelId,
    searchOpen,
    monitorOpen,
    avatarOpen,
    toast,
    dismissToast,
    openDialog,
    closeDialog,
    openDrawer,
    closeDrawer,
    closeOverlays,
  }
})
