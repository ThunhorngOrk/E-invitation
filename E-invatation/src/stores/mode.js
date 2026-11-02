import { computed, ref } from 'vue'

const MODE_KEY = 'e-invitation-mode-v1'

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function loadMode() {
  try {
    const saved = localStorage.getItem(MODE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    // storage unavailable
  }
  return prefersDark() ? 'dark' : 'light'
}

export const mode = ref(loadMode())
export const isDark = computed(() => mode.value === 'dark')

export function applyMode(next) {
  mode.value = next === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.mode = mode.value
  try {
    localStorage.setItem(MODE_KEY, mode.value)
  } catch {
    // storage unavailable
  }
  return mode.value
}

export function toggleMode() {
  return applyMode(isDark.value ? 'light' : 'dark')
}

document.documentElement.dataset.mode = mode.value
