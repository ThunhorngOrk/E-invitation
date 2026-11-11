import { computed, ref } from 'vue'
import { getTheme } from '../data/themes'

export const activeThemeId = ref('')
export const hasChosenTheme = computed(() => Boolean(activeThemeId.value))
export const activeTheme = computed(() => getTheme(activeThemeId.value))

export function applyTheme(id) {
  const theme = getTheme(id)
  activeThemeId.value = theme.id
  document.documentElement.dataset.theme = theme.id
  return theme
}

export function clearTheme() {
  activeThemeId.value = ''
  delete document.documentElement.dataset.theme
}

if (activeThemeId.value) {
  document.documentElement.dataset.theme = activeThemeId.value
}
