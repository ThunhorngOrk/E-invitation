import { reactive, ref, watch } from 'vue'
import { defaultInvitation } from '../data/invitation'

const STORAGE_KEY = 'khmer-invitation-content-v2'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function mergeWithDefaults(saved) {
  const base = clone(defaultInvitation)
  if (!saved || typeof saved !== 'object') return base

  const merged = { ...base, ...saved }
  merged.venue = { ...base.venue, ...(saved.venue || {}) }
  merged.groom = { ...base.groom, ...(saved.groom || {}) }
  merged.bride = { ...base.bride, ...(saved.bride || {}) }

  if (!Array.isArray(merged.schedule)) merged.schedule = base.schedule
  if (!Array.isArray(merged.gallery)) merged.gallery = base.gallery
  if (typeof merged.heroImage !== 'string') merged.heroImage = ''

  merged.schedule = merged.schedule.map((item) => ({
    time: item?.time || '09:00',
    title: item?.title || '',
    desc: item?.desc || '',
  }))

  merged.gallery = merged.gallery.map((item) => ({
    caption: item?.caption || '',
    tone: item?.tone || 'wine',
    src: item?.src || '',
  }))

  return merged
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const savedContent = loadSaved()

export const invitation = reactive(mergeWithDefaults(savedContent))
export const saveState = ref(savedContent ? 'saved' : 'idle')
export const storageSize = ref(0)
export const STORAGE_KEY_INVITATION = STORAGE_KEY

let saveTimer
let currentSize = 0

if (savedContent) {
  try {
    currentSize = new Blob([JSON.stringify(invitation)]).size
  } catch {
    currentSize = 0
  }
  storageSize.value = currentSize
}

export function persistInvitation() {
  saveState.value = 'saving'
  try {
    const data = JSON.stringify(invitation)
    localStorage.setItem(STORAGE_KEY, data)
    currentSize = new Blob([data]).size
    storageSize.value = currentSize
    saveState.value = 'saved'
    return true
  } catch {
    saveState.value = 'error'
    return false
  }
}

watch(
  invitation,
  () => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(persistInvitation, 350)
  },
  { deep: true },
)

export function resetInvitation() {
  clearTimeout(saveTimer)
  const defaults = clone(defaultInvitation)
  Object.keys(invitation).forEach((key) => {
    delete invitation[key]
  })
  Object.assign(invitation, defaults)
  localStorage.removeItem(STORAGE_KEY)
  saveState.value = 'saved'
  storageSize.value = 0
}

export function importInvitation(data) {
  const merged = mergeWithDefaults(data)
  clearTimeout(saveTimer)
  Object.keys(invitation).forEach((key) => {
    delete invitation[key]
  })
  Object.assign(invitation, merged)
  persistInvitation()
}

export function exportInvitation() {
  return JSON.stringify(invitation, null, 2)
}

export function invitationSnapshot() {
  return clone(invitation)
}

window.addEventListener('beforeunload', () => {
  if (saveState.value === 'saving') persistInvitation()
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && saveState.value === 'saving') {
    persistInvitation()
  }
})
