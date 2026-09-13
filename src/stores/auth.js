import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useDspStore } from './dsp'

const USER_KEY = 'dsp-user-id'
const THEME_KEY = 'dsp-theme-pref'

function resolveTheme(pref) {
  if (pref === 'light' || pref === 'dark') return pref
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const useAuthStore = defineStore('auth', () => {
  const currentUserId = ref(localStorage.getItem(USER_KEY) || '')
  const themePref = ref(localStorage.getItem(THEME_KEY) || 'system')
  const theme = ref(resolveTheme(themePref.value))

  const directory = computed(() => useDspStore().users)
  const user = computed(() => directory.value.find((u) => u.id === currentUserId.value) || null)
  const isLoggedIn = computed(() => Boolean(user.value) && user.value.enabled !== false)

  function applyTheme() {
    const next = resolveTheme(themePref.value)
    theme.value = next
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(THEME_KEY, themePref.value)
  }

  function setThemePref(pref) {
    themePref.value = pref
    applyTheme()
  }

  function login(userId) {
    const found = directory.value.find((u) => u.id === userId)
    if (!found || found.enabled === false) return false
    currentUserId.value = found.id
    localStorage.setItem(USER_KEY, found.id)
    return true
  }

  function logout() {
    currentUserId.value = ''
    localStorage.removeItem(USER_KEY)
  }

  applyTheme()

  return {
    directory,
    currentUserId,
    user,
    isLoggedIn,
    themePref,
    theme,
    login,
    logout,
    setThemePref,
    applyTheme,
  }
})
