import { computed, ref } from 'vue'
import { getTheme, themes } from '../data/themes'

const THEME_KEY = 'khmer-invitation-theme-v1'

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return themes.some((theme) => theme.id === saved) ? saved : ''
  } catch {
    return ''
  }
}

export const activeThemeId = ref(loadTheme())
export const hasChosenTheme = computed(() => Boolean(activeThemeId.value))
export const activeTheme = computed(() => getTheme(activeThemeId.value))

export function applyTheme(id) {
  const theme = getTheme(id)
  activeThemeId.value = theme.id
  document.documentElement.dataset.theme = theme.id
  try {
    localStorage.setItem(THEME_KEY, theme.id)
  } catch {
    // storage unavailable
  }
  return theme
}

export function clearTheme() {
  activeThemeId.value = ''
  delete document.documentElement.dataset.theme
  try {
    localStorage.removeItem(THEME_KEY)
  } catch {
    // storage unavailable
  }
}

if (activeThemeId.value) {
  document.documentElement.dataset.theme = activeThemeId.value
}
