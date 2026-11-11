import { reactive, ref, watch } from 'vue'
import { defaultInvitation } from '../data/invitation'
import { api } from '../api/client'
import { isAuthenticated } from './auth'
import { activeThemeId, applyTheme } from './theme'
import { dataUrlToBlob } from '../utils/image'
import { t } from '../i18n'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function mergeWithDefaults(saved) {
  const base = clone(defaultInvitation)
  if (!saved || typeof saved !== 'object') {
    return { ...base, theme: '', eventForm: null }
  }

  const merged = { ...base, ...saved }
  merged.venue = { ...base.venue, ...(saved.venue || {}) }
  merged.groom = { ...base.groom, ...(saved.groom || {}) }
  merged.bride = { ...base.bride, ...(saved.bride || {}) }

  if (!Array.isArray(merged.schedule)) merged.schedule = base.schedule
  if (!Array.isArray(merged.gallery)) merged.gallery = base.gallery
  if (typeof merged.heroImage !== 'string') merged.heroImage = ''
  if (typeof merged.theme !== 'string') merged.theme = ''
  if (!merged.eventForm || typeof merged.eventForm !== 'object') merged.eventForm = null

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

export const invitation = reactive(mergeWithDefaults(null))

export const saveState = ref('idle')
export const storageSize = ref(0)

export const invitationMeta = reactive({
  id: null,
  slug: '',
  status: 'draft',
  title: '',
  loaded: false,
})

let saveTimer
let applyingRemote = false
let loading = false

function updateSize() {
  try {
    storageSize.value = new Blob([JSON.stringify(invitation)]).size
  } catch {
    storageSize.value = 0
  }
}

function titleFromContent() {
  const eventName = invitation.eventForm?.eventName
  if (typeof eventName === 'string' && eventName.trim()) return eventName.trim()

  const groom = invitation.groom?.nameKh?.trim()
  const bride = invitation.bride?.nameKh?.trim()
  if (groom || bride) return [groom, bride].filter(Boolean).join(' & ')

  return invitation.heroKicker?.trim() || 'ការអញ្ជើញ'
}

function applyMeta(resource) {
  if (!resource) return
  invitationMeta.id = resource.id ?? invitationMeta.id
  invitationMeta.slug = resource.slug ?? invitationMeta.slug
  invitationMeta.status = resource.status ?? invitationMeta.status
  invitationMeta.title = resource.title ?? invitationMeta.title
}

function applyContent(content) {
  const merged = mergeWithDefaults(content)
  Object.keys(invitation).forEach((key) => {
    delete invitation[key]
  })
  Object.assign(invitation, merged)
}

function schedulePersist() {
  if (!isAuthenticated.value || !invitationMeta.loaded) return
  saveState.value = 'saving'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    persistInvitation()
  }, 600)
}

async function createInvitation() {
  saveState.value = 'saving'
  try {
    const payload = await api.post('/invitations', {
      title: titleFromContent(),
      content: clone(invitation),
      status: 'draft',
    })
    const resource = api.unwrap(payload)
    applyMeta(resource)
    invitationMeta.loaded = true
    saveState.value = 'saved'
    updateSize()
    return resource
  } catch (error) {
    saveState.value = 'error'
    throw error
  }
}

export async function loadInvitation() {
  if (!isAuthenticated.value) {
    clearInvitationState()
    return false
  }
  if (loading || invitationMeta.loaded) return true

  loading = true
  saveState.value = 'saving'
  try {
    const payload = await api.get('/invitations')
    const list = api.unwrap(payload)
    const items = Array.isArray(list) ? list : []

    if (items.length) {
      const resource = items[0]
      applyingRemote = true
      applyMeta(resource)
      applyContent(resource.content || {})
      if (resource.content?.theme) {
        applyTheme(resource.content.theme)
      } else if (activeThemeId.value) {
        invitation.theme = activeThemeId.value
      }
      applyingRemote = false
      invitationMeta.loaded = true
      saveState.value = 'saved'
      updateSize()

      if (!resource.content?.theme && activeThemeId.value) {
        persistInvitation()
      }

      return true
    }

    invitationMeta.loaded = true
    await createInvitation()
    return true
  } catch {
    applyingRemote = false
    saveState.value = 'error'
    return false
  } finally {
    loading = false
  }
}

export async function persistInvitation() {
  if (!isAuthenticated.value) {
    saveState.value = 'idle'
    return false
  }

  if (!invitationMeta.id) {
    try {
      await createInvitation()
      return true
    } catch {
      return false
    }
  }

  clearTimeout(saveTimer)
  saveState.value = 'saving'

  if (activeThemeId.value && invitation.theme !== activeThemeId.value) {
    applyingRemote = true
    invitation.theme = activeThemeId.value
    applyingRemote = false
  }

  try {
    const payload = await api.patch(`/invitations/${invitationMeta.slug}`, {
      title: titleFromContent(),
      content: clone(invitation),
    })
    applyMeta(api.unwrap(payload))
    saveState.value = 'saved'
    updateSize()
    return true
  } catch {
    saveState.value = 'error'
    return false
  }
}

export async function resetInvitation() {
  applyingRemote = true
  const defaults = mergeWithDefaults(null)
  Object.keys(invitation).forEach((key) => {
    delete invitation[key]
  })
  Object.assign(invitation, defaults)
  applyingRemote = false
  updateSize()
  return persistInvitation()
}

export async function importInvitation(data) {
  applyingRemote = true
  applyContent(data)
  applyingRemote = false
  updateSize()
  return persistInvitation()
}

export function exportInvitation() {
  return JSON.stringify(invitation, null, 2)
}

export function invitationSnapshot() {
  return clone(invitation)
}

export async function uploadImage(dataUrl, caption = '') {
  if (!isAuthenticated.value) {
    throw new Error(t('auth.errors.loginRequired'))
  }
  if (!invitationMeta.id) {
    await createInvitation()
  }

  const blob = dataUrlToBlob(dataUrl)
  const payload = await api.upload(
    `/invitations/${invitationMeta.slug}/photos`,
    blob,
    'photo',
    { caption },
  )
  const photo = api.unwrap(payload)
  return photo?.url || ''
}

export async function setPublishStatus(published) {
  if (!invitationMeta.id) {
    await createInvitation()
  }
  const action = published ? 'publish' : 'unpublish'
  const payload = await api.post(`/invitations/${invitationMeta.slug}/${action}`)
  applyMeta(api.unwrap(payload))
  return invitationMeta.status
}

export async function fetchRsvps() {
  if (!invitationMeta.id) {
    return { data: [], meta: { total_responses: 0, attending: 0, declined: 0, total_guests: 0 } }
  }
  const payload = await api.get(`/invitations/${invitationMeta.slug}/rsvps`)
  const list = api.unwrap(payload)
  return {
    data: Array.isArray(list) ? list : [],
    meta: payload?.meta || {
      total_responses: Array.isArray(list) ? list.length : 0,
      attending: 0,
      declined: 0,
      total_guests: 0,
    },
  }
}

export async function deleteRsvp(id) {
  if (!invitationMeta.id) return
  await api.delete(`/invitations/${invitationMeta.slug}/rsvps/${id}`)
}

export async function submitRsvp(payload) {
  if (!invitationMeta.slug || invitationMeta.status !== 'published') {
    throw new Error(t('auth.errors.publishRequired'))
  }
  const response = await api.post(
    `/invitations/${invitationMeta.slug}/rsvps`,
    payload,
    { auth: false },
  )
  return api.unwrap(response)
}

export function clearInvitationState() {
  clearTimeout(saveTimer)
  applyingRemote = true
  Object.keys(invitation).forEach((key) => {
    delete invitation[key]
  })
  Object.assign(invitation, mergeWithDefaults(null))
  applyingRemote = false
  invitationMeta.id = null
  invitationMeta.slug = ''
  invitationMeta.status = 'draft'
  invitationMeta.title = ''
  invitationMeta.loaded = false
  saveState.value = 'idle'
  storageSize.value = 0
}

watch(
  invitation,
  () => {
    if (applyingRemote) return
    updateSize()
    schedulePersist()
  },
  { deep: true, flush: 'sync' },
)

watch(
  activeThemeId,
  (id) => {
    if (applyingRemote || !id) return
    if (invitation.theme !== id) {
      invitation.theme = id
    }
  },
  { flush: 'sync' },
)

window.addEventListener('beforeunload', () => {
  if (saveState.value === 'saving') persistInvitation()
})

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && saveState.value === 'saving') {
    persistInvitation()
  }
})
