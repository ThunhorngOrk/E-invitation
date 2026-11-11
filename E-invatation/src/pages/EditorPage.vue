<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  invitation,
  saveState,
  storageSize,
  resetInvitation,
  importInvitation,
  exportInvitation,
  invitationMeta,
  uploadImage,
  fetchRsvps,
  deleteRsvp,
  setPublishStatus,
} from '../stores/invitation'
import { prepareImage } from '../utils/image'
import { currentUser } from '../stores/auth'
import { activeTheme } from '../stores/theme'
import { formatNumber, locale, pickLocalized, t } from '../i18n'
import EventFormPage from './EventFormPage.vue'

const tabs = computed(() => [
  { id: 'event', label: t('editor.tabs.event') },
  { id: 'couple', label: t('editor.tabs.couple') },
  { id: 'invite', label: t('editor.tabs.invite') },
  { id: 'labels', label: t('editor.tabs.labels') },
  { id: 'date', label: t('editor.tabs.date') },
  { id: 'schedule', label: t('editor.tabs.schedule') },
  { id: 'gallery', label: t('editor.tabs.gallery') },
  { id: 'design', label: t('editor.tabs.design') },
  { id: 'responses', label: t('editor.tabs.responses') },
])

const people = computed(() => [
  { key: 'groom', label: t('editor.people.groom') },
  { key: 'bride', label: t('editor.people.bride') },
])

const tones = computed(() => [
  { value: 'wine', label: t('editor.tones.wine') },
  { value: 'gold', label: t('editor.tones.gold') },
  { value: 'deep', label: t('editor.tones.deep') },
  { value: 'sand', label: t('editor.tones.sand') },
  { value: 'rose', label: t('editor.tones.rose') },
  { value: 'plum', label: t('editor.tones.plum') },
])

const activeTab = ref('event')
const importInput = ref(null)
const responses = ref([])
const publishing = ref(false)
const toast = reactive({ show: false, message: '', type: 'success' })
let toastTimer

const dateInput = computed({
  get: () => (invitation.dateISO || '').slice(0, 16),
  set: (value) => {
    invitation.dateISO = value ? `${value}:00+07:00` : ''
  },
})

const confirmed = computed(() => responses.value.filter((item) => item.attendance === 'yes'))

const totalGuests = computed(() =>
  confirmed.value.reduce((sum, item) => sum + (Number(item.guests) || 1), 0),
)

const statusText = computed(() => {
  if (saveState.value === 'saving') return t('editor.status.saving')
  if (saveState.value === 'saved') return t('editor.status.saved')
  if (saveState.value === 'error') return t('editor.status.error')
  return t('editor.status.idle')
})

const sizeText = computed(() => {
  const bytes = storageSize.value
  if (!bytes) return `${formatNumber(0)} KB`
  if (bytes >= 1_048_576) {
    return `${formatNumber((bytes / 1_048_576).toFixed(1))} MB`
  }
  return `${formatNumber(Math.round(bytes / 1024))} KB`
})

function notify(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.show = false
  }, 2800)
}

async function pickPhoto(event, target) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const data = await prepareImage(file)
    const url = await uploadImage(data, target)
    if (target === 'hero') {
      invitation.heroImage = url
    } else {
      invitation[target].photo = url
    }
    notify(t('editor.toasts.photoAdded'))
  } catch {
    notify(t('editor.toasts.photoError'), 'error')
  } finally {
    event.target.value = ''
  }
}

async function replaceGalleryPhoto(event, index) {
  const file = event.target.files?.[0]
  if (!file || !invitation.gallery[index]) return
  try {
    const data = await prepareImage(file)
    const url = await uploadImage(data, invitation.gallery[index].caption || 'gallery')
    invitation.gallery[index].src = url
    notify(t('editor.toasts.photoUpdated'))
  } catch {
    notify(t('editor.toasts.photoError'), 'error')
  } finally {
    event.target.value = ''
  }
}

async function addGalleryPhotos(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  const room = 12 - invitation.gallery.length
  if (room <= 0) {
    notify(t('editor.toasts.maxPhotos'), 'error')
    event.target.value = ''
    return
  }

  const accepted = files.slice(0, room)
  let added = 0

  for (const file of accepted) {
    try {
      const data = await prepareImage(file)
      const caption = file.name.replace(/\.[^.]+$/, '')
      const src = await uploadImage(data, caption || 'gallery')
      invitation.gallery.push({ caption: caption || 'អនុស្សាវរីយ៍', tone: 'wine', src })
      added += 1
    } catch {
      notify(t('editor.toasts.somePhotosFailed'), 'error')
    }
  }

  if (added) notify(t('editor.toasts.photosAdded', { n: formatNumber(added) }))
  event.target.value = ''
}

function addGalleryItem() {
  if (invitation.gallery.length >= 12) {
    notify(t('editor.toasts.maxPhotos'), 'error')
    return
  }
  invitation.gallery.push({ caption: 'អនុស្សាវរីយ៍ថ្មី', tone: 'wine', src: '' })
}

function removeGallery(index) {
  invitation.gallery.splice(index, 1)
}

function addSchedule() {
  invitation.schedule.push({ time: '09:00', title: 'ពិធីថ្មី', desc: '' })
}

function removeSchedule(index) {
  invitation.schedule.splice(index, 1)
}

function moveSchedule(index, direction) {
  const next = index + direction
  if (next < 0 || next >= invitation.schedule.length) return
  const [item] = invitation.schedule.splice(index, 1)
  invitation.schedule.splice(next, 0, item)
}

function triggerImport() {
  importInput.value?.click()
}

async function handleImport(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const data = JSON.parse(await file.text())
    if (!data || typeof data !== 'object' || !data.groom || !data.bride || !Array.isArray(data.schedule)) {
      throw new Error('invalid')
    }
    if (!window.confirm(t('editor.confirms.import'))) {
      event.target.value = ''
      return
    }
    await importInvitation(data)
    await refreshResponses()
    notify(t('editor.toasts.imported'))
  } catch {
    notify(t('editor.toasts.invalidJson'), 'error')
  } finally {
    event.target.value = ''
  }
}

function downloadFile(content, fileName, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function handleExport() {
  downloadFile(exportInvitation(), 'khmer-invitation-backup.json', 'application/json')
  notify(t('editor.toasts.exportDone'))
}

async function handleReset() {
  if (!window.confirm(t('editor.confirms.reset'))) {
    return
  }
  await resetInvitation()
  activeTab.value = 'couple'
  notify(t('editor.toasts.resetDone'))
}

async function refreshResponses() {
  try {
    const result = await fetchRsvps()
    responses.value = result.data.map((item) => ({
      ...item,
      createdAt: item.created_at || item.createdAt,
    }))
  } catch {
    responses.value = []
  }
}

async function removeResponse(response) {
  try {
    await deleteRsvp(response.id)
    await refreshResponses()
    notify(t('editor.toasts.responseDeleted'))
  } catch {
    notify(t('editor.toasts.responseDeleteError'), 'error')
  }
}

async function clearResponses() {
  if (!responses.value.length) return
  if (!window.confirm(t('editor.confirms.clearResponses'))) return
  try {
    await Promise.all(responses.value.map((item) => deleteRsvp(item.id)))
    await refreshResponses()
    notify(t('editor.toasts.responsesCleared'))
  } catch {
    notify(t('editor.toasts.responseDeleteError'), 'error')
  }
}

async function togglePublish() {
  if (publishing.value) return
  publishing.value = true
  const next = invitationMeta.status !== 'published'
  try {
    await setPublishStatus(next)
    notify(next ? t('editor.toasts.published') : t('editor.toasts.unpublished'))
  } catch {
    notify(t('editor.toasts.publishError'), 'error')
  } finally {
    publishing.value = false
  }
}

function csvEscape(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function exportResponses() {
  if (!responses.value.length) {
    notify(t('editor.toasts.noResponses'), 'error')
    return
  }

  const header = 'Name,Attendance,Guests,Message,Submitted'
  const rows = responses.value.map((item) =>
    [
      item.name,
      item.attendance === 'yes' ? 'Yes' : 'No',
      item.guests || 1,
      item.message,
      item.createdAt,
    ]
      .map(csvEscape)
      .join(','),
  )

  downloadFile(`\uFEFF${[header, ...rows].join('\n')}`, 'rsvp-responses.csv', 'text/csv;charset=utf-8;')
  notify(t('editor.toasts.responsesExported'))
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return date.toLocaleString(locale.value === 'km' ? 'km-KH' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return date.toLocaleString()
  }
}

onMounted(refreshResponses)

onUnmounted(() => clearTimeout(toastTimer))
</script>

<template>
  <div class="editor">
    <header class="editor-head">
      <div class="head-inner">
        <div class="brand">
          <p class="brand-eyebrow">E-invitation Editor</p>
          <h1>{{ t('editor.title') }}</h1>
          <p class="brand-sub">{{ t('editor.sub') }}</p>
        </div>

        <div class="head-side">
          <div class="account-chip">
            <span class="account-avatar" aria-hidden="true">
              {{ (currentUser?.name || '?').slice(0, 1) }}
            </span>
            <span class="account-text">
              <strong>{{ currentUser?.name || t('editor.user') }}</strong>
              <small>{{ currentUser?.email || '' }}</small>
            </span>
          </div>

          <span class="status" :class="saveState">
            <span class="status-dot" aria-hidden="true"></span>
            {{ statusText }}
          </span>
          <div class="head-actions">
            <button
              class="btn btn-ghost btn-sm"
              type="button"
              :disabled="publishing"
              @click="togglePublish"
            >
              {{ invitationMeta.status === 'published' ? t('editor.unpublish') : t('editor.publish') }}
            </button>
            <button class="btn btn-ghost btn-sm" type="button" @click="handleExport">
              {{ t('editor.exportJson') }}
            </button>
            <button class="btn btn-ghost btn-sm" type="button" @click="triggerImport">
              {{ t('editor.importJson') }}
            </button>
            <button class="btn btn-ghost btn-sm danger-ghost" type="button" @click="handleReset">
              {{ t('editor.reset') }}
            </button>
          </div>
          <input
            ref="importInput"
            class="file-input"
            type="file"
            accept="application/json,.json"
            @change="handleImport"
          />
        </div>
      </div>
    </header>

    <div class="editor-body">
      <aside class="tabs" :aria-label="t('editor.tabsAria')">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="tab-dot" aria-hidden="true"></span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.id === 'responses' && responses.length" class="tab-badge">
            {{ formatNumber(responses.length) }}
          </span>
        </button>

        <div class="storage-card">
          <p class="storage-label">{{ t('editor.storageLabel') }}</p>
          <p class="storage-value">{{ sizeText }}</p>
          <p class="storage-hint">{{ t('editor.storageHint') }}</p>
        </div>
      </aside>

      <div class="panels">
        <section v-show="activeTab === 'event'" class="panel event-panel">
          <EventFormPage embedded @saved="notify(t('editor.savedEvent'))" />
        </section>

        <section v-show="activeTab === 'couple'" class="panel">
          <div class="panel-head">
            <h2>{{ t('editor.coupleTitle') }}</h2>
            <p>{{ t('editor.coupleText') }}</p>
          </div>

          <article v-for="person in people" :key="person.key" class="sub-card">
            <div class="sub-head">
              <h3>{{ person.label }}</h3>
              <span class="sub-note">{{ invitation[person.key].nameEn }}</span>
            </div>

            <div class="photo-row">
              <div class="photo-preview">
                <img
                  v-if="invitation[person.key].photo"
                  :src="invitation[person.key].photo"
                  alt=""
                />
                <span v-else>{{ invitation[person.key].initial }}</span>
              </div>
              <div class="photo-actions">
                <div class="photo-buttons">
                  <label class="mini-btn">
                    {{ invitation[person.key].photo ? t('editor.changePhoto') : t('editor.addPhoto') }}
                    <input type="file" accept="image/*" @change="pickPhoto($event, person.key)" />
                  </label>
                  <button
                    v-if="invitation[person.key].photo"
                    class="mini-btn danger"
                    type="button"
                    @click="invitation[person.key].photo = ''"
                  >
                    {{ t('editor.removePhoto') }}
                  </button>
                </div>
                <p class="hint">{{ t('editor.photoHint') }}</p>
              </div>
            </div>

            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.nameKm') }}</span>
                <input v-model="invitation[person.key].nameKh" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.nameEn') }}</span>
                <input v-model="invitation[person.key].nameEn" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.monogram') }}</span>
                <input v-model="invitation[person.key].initial" type="text" maxlength="2" />
              </label>
              <label class="field">
                <span>{{ t('editor.role') }}</span>
                <input v-model="invitation[person.key].role" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.familyTitle') }}</span>
                <input v-model="invitation[person.key].parentsTitle" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.parents') }}</span>
                <input v-model="invitation[person.key].parents" type="text" />
              </label>
            </div>

            <label class="field">
              <span>{{ t('editor.familyAddress') }}</span>
              <input v-model="invitation[person.key].parentsAddress" type="text" />
            </label>
          </article>
        </section>

        <section v-show="activeTab === 'invite'" class="panel">
          <div class="panel-head">
            <h2>{{ t('editor.inviteTitle') }}</h2>
            <p>{{ t('editor.inviteText') }}</p>
          </div>

          <label class="field">
            <span>{{ t('editor.leadMessage') }}</span>
            <textarea v-model="invitation.invitationText" rows="4"></textarea>
          </label>

          <label class="field">
            <span>{{ t('editor.extraMessage') }}</span>
            <textarea v-model="invitation.invitationSub" rows="3"></textarea>
          </label>

          <label class="field">
            <span>{{ t('editor.blessing') }}</span>
            <textarea v-model="invitation.blessing" rows="3"></textarea>
          </label>

          <div class="grid-2">
            <label class="field">
              <span>{{ t('editor.rsvpDeadline') }}</span>
              <input v-model="invitation.rsvpDeadline" type="text" />
            </label>
            <label class="field">
              <span>{{ t('editor.heroKicker') }}</span>
              <input v-model="invitation.heroKicker" type="text" />
            </label>
          </div>

          <label class="field">
            <span>{{ t('editor.thanksText') }}</span>
            <input v-model="invitation.thanksText" type="text" />
          </label>
        </section>

        <section v-show="activeTab === 'labels'" class="panel">
          <div class="panel-head">
            <h2>{{ t('editor.labelsTitle') }}</h2>
            <p>{{ t('editor.labelsText') }}</p>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionInvite') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.inviteEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.inviteTitle" type="text" />
              </label>
            </div>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionCouple') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.coupleEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.coupleTitle" type="text" />
              </label>
            </div>
            <label class="field">
              <span>{{ t('editor.summary') }}</span>
              <textarea v-model="invitation.coupleSub" rows="2"></textarea>
            </label>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionCountdown') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.countdownEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.countdownTitle" type="text" />
              </label>
            </div>
            <label class="field">
              <span>{{ t('editor.past') }}</span>
              <input v-model="invitation.countdownPast" type="text" />
            </label>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionSchedule') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.scheduleEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.scheduleTitle" type="text" />
              </label>
            </div>
            <label class="field">
              <span>{{ t('editor.summary') }}</span>
              <textarea v-model="invitation.scheduleSub" rows="2"></textarea>
            </label>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionGallery') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.galleryEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.galleryTitle" type="text" />
              </label>
            </div>
            <label class="field">
              <span>{{ t('editor.summary') }}</span>
              <textarea v-model="invitation.gallerySub" rows="2"></textarea>
            </label>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionVenue') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.venueEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.venueTitle" type="text" />
              </label>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.summary') }}</span>
                <textarea v-model="invitation.venueSub" rows="2"></textarea>
              </label>
              <label class="field">
                <span>{{ t('editor.mapBadge') }}</span>
                <input v-model="invitation.mapBadge" type="text" />
              </label>
            </div>
          </div>

          <div class="sub-card">
            <div class="sub-head">
              <h3>{{ t('editor.sectionRsvp') }}</h3>
            </div>
            <div class="grid-2">
              <label class="field">
                <span>{{ t('editor.eyebrow') }}</span>
                <input v-model="invitation.rsvpEyebrow" type="text" />
              </label>
              <label class="field">
                <span>{{ t('editor.heading') }}</span>
                <input v-model="invitation.rsvpTitle" type="text" />
              </label>
            </div>
          </div>
        </section>

        <section v-show="activeTab === 'date'" class="panel">
          <div class="panel-head">
            <h2>{{ t('editor.dateTitle') }}</h2>
            <p>{{ t('editor.dateText') }}</p>
          </div>

          <div class="grid-2">
            <label class="field">
              <span>{{ t('editor.dateTime') }}</span>
              <input v-model="dateInput" type="datetime-local" />
            </label>
            <label class="field">
              <span>{{ t('editor.dateKh') }}</span>
              <input v-model="invitation.dateKh" type="text" />
            </label>
            <label class="field">
              <span>{{ t('editor.dateEn') }}</span>
              <input v-model="invitation.dateEn" type="text" />
            </label>
            <label class="field">
              <span>{{ t('editor.lunar') }}</span>
              <input v-model="invitation.lunarKh" type="text" />
            </label>
            <label class="field">
              <span>{{ t('editor.startTime') }}</span>
              <input v-model="invitation.eventTime" type="time" />
            </label>
          </div>

          <div class="block-divider"></div>
          <h3 class="block-title">{{ t('editor.venueBlockTitle') }}</h3>

          <div class="grid-2">
            <label class="field">
              <span>{{ t('editor.venueName') }}</span>
              <input v-model="invitation.venue.name" type="text" />
            </label>
            <label class="field">
              <span>{{ t('editor.venueNameEn') }}</span>
              <input v-model="invitation.venue.nameEn" type="text" />
            </label>
          </div>

          <label class="field">
            <span>{{ t('editor.address') }}</span>
            <textarea v-model="invitation.venue.address" rows="2"></textarea>
          </label>

          <label class="field">
            <span>{{ t('editor.venueNote') }}</span>
            <textarea v-model="invitation.venue.note" rows="2"></textarea>
          </label>

          <label class="field">
            <span>{{ t('editor.mapQuery') }}</span>
            <input v-model="invitation.venue.mapQuery" type="text" />
            <small>{{ t('editor.mapHint') }}</small>
          </label>
        </section>

        <section v-show="activeTab === 'schedule'" class="panel">
          <div class="panel-head-row">
            <div class="panel-head">
              <h2>{{ t('editor.scheduleBlockTitle') }}</h2>
              <p>{{ t('editor.scheduleBlockText') }}</p>
            </div>
            <button class="btn btn-gold btn-sm" type="button" @click="addSchedule">
              {{ t('editor.addSchedule') }}
            </button>
          </div>

          <p v-if="!invitation.schedule.length" class="empty">{{ t('editor.emptySchedule') }}</p>

          <article v-for="(item, index) in invitation.schedule" :key="index" class="item-card">
            <div class="item-top">
              <span class="item-index">{{ formatNumber(index + 1) }}</span>
              <div class="item-actions">
                <button
                  class="icon-btn"
                  type="button"
                  :disabled="index === 0"
                  :aria-label="t('editor.moveUp')"
                  @click="moveSchedule(index, -1)"
                >
                  ↑
                </button>
                <button
                  class="icon-btn"
                  type="button"
                  :disabled="index === invitation.schedule.length - 1"
                  :aria-label="t('editor.moveDown')"
                  @click="moveSchedule(index, 1)"
                >
                  ↓
                </button>
                <button
                  class="icon-btn danger"
                  type="button"
                  :aria-label="t('editor.removeSchedule')"
                  @click="removeSchedule(index)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="grid-time">
              <label class="field">
                <span>{{ t('editor.time') }}</span>
                <input v-model="item.time" type="time" />
              </label>
              <label class="field">
                <span>{{ t('editor.activityTitle') }}</span>
                <input v-model="item.title" type="text" />
              </label>
            </div>

            <label class="field">
              <span>{{ t('editor.description') }}</span>
              <textarea v-model="item.desc" rows="2"></textarea>
            </label>
          </article>
        </section>

        <section v-show="activeTab === 'gallery'" class="panel">
          <div class="panel-head-row">
            <div class="panel-head">
              <h2>{{ t('editor.galleryBlockTitle') }}</h2>
              <p>{{ t('editor.galleryBlockText') }}</p>
            </div>
            <div class="head-buttons">
              <label class="mini-btn primary">
                {{ t('editor.addGalleryPhotos') }}
                <input type="file" accept="image/*" multiple @change="addGalleryPhotos" />
              </label>
              <button class="mini-btn" type="button" @click="addGalleryItem">
                {{ t('editor.addEmptyTile') }}
              </button>
            </div>
          </div>

          <p v-if="!invitation.gallery.length" class="empty">{{ t('editor.emptyGallery') }}</p>

          <div class="gallery-edit">
            <article v-for="(item, index) in invitation.gallery" :key="index" class="gallery-card">
              <div class="gallery-preview" :class="item.src ? '' : `tone-${item.tone}`">
                <img v-if="item.src" :src="item.src" :alt="item.caption" />
                <svg v-else viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path
                    d="M32 10c5 5.6 7.8 10.1 7.8 13.7 0 3.6-2.9 7.5-7.8 12.1-4.9-4.6-7.8-8.5-7.8-12.1C24.2 20.1 27 15.6 32 10Z"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <circle cx="32" cy="44" r="1.8" fill="currentColor" opacity=".7" />
                </svg>
                <span class="gallery-index">{{ formatNumber(index + 1, 2) }}</span>
              </div>

              <label class="field">
                <span>{{ t('editor.caption') }}</span>
                <input v-model="item.caption" type="text" />
              </label>

              <label v-if="!item.src" class="field">
                <span>{{ t('editor.tone') }}</span>
                <select v-model="item.tone">
                  <option v-for="tone in tones" :key="tone.value" :value="tone.value">
                    {{ tone.label }}
                  </option>
                </select>
              </label>

              <div class="gallery-actions">
                <label class="mini-btn">
                  {{ item.src ? t('editor.changePhoto') : t('editor.addPhoto') }}
                  <input type="file" accept="image/*" @change="replaceGalleryPhoto($event, index)" />
                </label>
                <button v-if="item.src" class="mini-btn" type="button" @click="item.src = ''">
                  {{ t('editor.removePhoto') }}
                </button>
                <button class="mini-btn danger" type="button" @click="removeGallery(index)">
                  {{ t('editor.removeTile') }}
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-show="activeTab === 'design'" class="panel">
          <div class="panel-head">
            <h2>{{ t('editor.designTitle') }}</h2>
            <p>{{ t('editor.designText') }}</p>
          </div>

          <div class="design-grid">
            <div class="cover-preview">
              <img v-if="invitation.heroImage" :src="invitation.heroImage" alt="" />
              <div v-else class="cover-placeholder">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <path
                    d="M32 10c5 5.6 7.8 10.1 7.8 13.7 0 3.6-2.9 7.5-7.8 12.1-4.9-4.6-7.8-8.5-7.8-12.1C24.2 20.1 27 15.6 32 10Z"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <circle cx="32" cy="44" r="1.8" fill="currentColor" opacity=".7" />
                  <path d="M20 52h24" stroke="currentColor" stroke-width="1" opacity=".5" />
                </svg>
                <p>{{ t('editor.noCover') }}</p>
              </div>
              <div class="cover-text">
                <span>{{ invitation.heroKicker }}</span>
                <strong>{{ pickLocalized(invitation.groom.nameKh, invitation.groom.nameEn) }} {{ t('invitation.and') }} {{ pickLocalized(invitation.bride.nameKh, invitation.bride.nameEn) }}</strong>
              </div>
            </div>

            <div class="design-info">
              <h3>{{ t('editor.coverTitle') }}</h3>
              <p>
                {{ t('editor.coverText') }}
              </p>
              <div class="photo-buttons">
                <label class="mini-btn primary">
                  {{ invitation.heroImage ? t('editor.changePhoto') : t('editor.addPhoto') }}
                  <input type="file" accept="image/*" @change="pickPhoto($event, 'hero')" />
                </label>
                <button
                  v-if="invitation.heroImage"
                  class="mini-btn danger"
                  type="button"
                  @click="invitation.heroImage = ''"
                >
                  {{ t('editor.removePhoto') }}
                </button>
              </div>

              <div class="design-note">
                <p>{{ t('editor.currentStyle') }}</p>
                <span>{{ t('editor.styleInUse', { name: pickLocalized(activeTheme.name, activeTheme.nameEn) }) }}</span>
                <a class="mini-btn primary theme-link" href="#/styles">{{ t('editor.changeStyle') }}</a>
              </div>

              <div class="design-note">
                <p>{{ t('editor.musicTitle') }}</p>
                <span>
                  {{ t('editor.musicText') }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section v-show="activeTab === 'responses'" class="panel">
          <div class="panel-head">
            <h2>{{ t('editor.responsesTitle') }}</h2>
            <p>{{ t('editor.responsesText') }}</p>
          </div>

          <div class="response-summary">
            <div class="stat">
              <span>{{ t('editor.totalResponses') }}</span>
              <strong>{{ formatNumber(responses.length) }}</strong>
            </div>
            <div class="stat">
              <span>{{ t('editor.attending') }}</span>
              <strong>{{ formatNumber(confirmed.length) }}</strong>
            </div>
            <div class="stat">
              <span>{{ t('editor.totalGuests') }}</span>
              <strong>{{ formatNumber(totalGuests) }}</strong>
            </div>
            <div class="stat">
              <span>{{ t('editor.declined') }}</span>
              <strong>{{ formatNumber(responses.length - confirmed.length) }}</strong>
            </div>
          </div>

          <div class="response-toolbar">
            <button class="mini-btn" type="button" @click="refreshResponses">{{ t('editor.refresh') }}</button>
            <button class="mini-btn" type="button" @click="exportResponses">{{ t('editor.downloadCsv') }}</button>
            <button
              class="mini-btn danger"
              type="button"
              :disabled="!responses.length"
              @click="clearResponses"
            >
              {{ t('editor.clearAll') }}
            </button>
          </div>

          <p v-if="!responses.length" class="empty">{{ t('editor.emptyResponses') }}</p>

          <ul v-else class="response-list">
            <li
              v-for="(response, index) in responses"
              :key="`${response.createdAt}-${index}`"
              class="response-card"
            >
              <div class="response-top">
                <div>
                  <strong>{{ response.name }}</strong>
                  <span class="response-badge" :class="response.attendance">
                    {{ response.attendance === 'yes' ? t('editor.attending') : t('editor.declined') }}
                  </span>
                </div>
                <button
                  class="icon-btn danger"
                  type="button"
                  :aria-label="t('editor.removeResponse')"
                  @click="removeResponse(response)"
                >
                  ✕
                </button>
              </div>
              <p class="response-meta">
                {{ t('editor.guestCount', { n: formatNumber(response.guests || 1) }) }} • {{ formatDate(response.createdAt) }}
              </p>
              <p v-if="response.message" class="response-message">“{{ response.message }}”</p>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <Transition name="toast">
      <p v-if="toast.show" class="toast" :class="toast.type" role="status">{{ toast.message }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.editor {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.editor-head {
  padding: clamp(1.6rem, 4vw, 2.6rem) 0 clamp(2.4rem, 5vw, 3.6rem);
  color: var(--ivory);
  background: var(--band-bg);
}

.head-inner {
  width: min(1180px, 100% - 2.5rem);
  margin-inline: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}

.brand-eyebrow {
  font-family: var(--font-serif);
  font-size: 0.64rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold-400);
}

.brand h1 {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.4rem, 3.4vw, 2rem);
  line-height: 1.8;
  color: var(--gold-200);
}

.brand-sub {
  max-width: 560px;
  margin-top: 0.4rem;
  font-size: 0.78rem;
  line-height: 1.9;
  color: rgba(246, 232, 201, 0.62);
}

.head-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.8rem;
}

.account-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.9rem 0.35rem 0.4rem;
  border: 1px solid rgba(239, 217, 174, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
}

.account-avatar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gold-gradient);
  color: var(--maroon-900);
  font-family: var(--font-display);
  font-size: 0.85rem;
}

.account-text {
  display: grid;
  gap: 0.02rem;
  line-height: 1.3;
}

.account-text strong {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--gold-200);
}

.account-text small {
  font-size: 0.62rem;
  color: rgba(246, 232, 201, 0.55);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.32rem 0.85rem;
  border: 1px solid rgba(239, 217, 174, 0.32);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--gold-200);
  font-size: 0.68rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #82bf90;
  box-shadow: 0 0 0 3px rgba(130, 191, 144, 0.15);
}

.status.saving .status-dot {
  background: var(--gold-400);
  animation: blink 1s ease-in-out infinite;
}

.status.error {
  color: #f2bcbc;
  border-color: rgba(210, 120, 120, 0.5);
}

.status.error .status-dot {
  background: #dd8a8a;
  box-shadow: 0 0 0 3px rgba(221, 138, 138, 0.15);
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.55rem 0.95rem;
  font-size: 0.75rem;
}

.danger-ghost {
  color: #f0c9c9;
  border-color: rgba(240, 180, 180, 0.32);
}

.danger-ghost:hover {
  background: rgba(180, 60, 60, 0.18);
}

.file-input {
  display: none;
}

.editor-body {
  width: min(1180px, 100% - 2.5rem);
  margin: 1.6rem auto 0;
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  align-items: start;
  gap: 1.4rem;
}

.tabs {
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.6rem;
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: 0 20px 40px -34px rgba(53, 11, 21, 0.5);
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.62rem 0.75rem;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  font-size: 0.82rem;
  color: var(--ink);
  transition: background 0.2s ease, color 0.2s ease;
}

.tab:hover {
  background: rgba(239, 217, 174, 0.35);
}

.tab.active {
  background: linear-gradient(135deg, #f6e8c9, #efd9ae);
  color: var(--maroon-800);
  font-weight: 600;
}

.tab-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: rgba(201, 162, 92, 0.5);
}

.tab.active .tab-dot {
  background: var(--maroon-700);
  box-shadow: 0 0 0 3px rgba(109, 31, 46, 0.12);
}

.tab-label {
  flex: 1;
}

.tab-badge {
  min-width: 20px;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background: var(--maroon-700);
  color: var(--gold-200);
  font-size: 0.62rem;
  text-align: center;
}

.storage-card {
  margin-top: 0.5rem;
  padding: 0.8rem 0.75rem 0.3rem;
  border-top: 1px dashed rgba(201, 162, 92, 0.4);
}

.storage-label {
  font-size: 0.64rem;
  letter-spacing: 0.06em;
  color: var(--gold-600);
}

.storage-value {
  margin-top: 0.15rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
  color: var(--maroon-800);
}

.storage-hint {
  margin-top: 0.2rem;
  font-size: 0.62rem;
  line-height: 1.7;
  color: var(--muted);
}

.panel {
  padding: clamp(1.1rem, 3vw, 1.9rem);
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 24px 50px -44px rgba(53, 11, 21, 0.6);
}

.panel.event-panel {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.panel-head {
  margin-bottom: 1.3rem;
}

.panel-head h2 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--maroon-800);
}

.panel-head p {
  max-width: 640px;
  margin-top: 0.25rem;
  font-size: 0.78rem;
  line-height: 1.9;
  color: var(--muted);
}

.panel-head-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.panel-head-row .panel-head {
  margin-bottom: 0;
}

.head-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.sub-card {
  margin-top: 1rem;
  padding: clamp(0.9rem, 2.4vw, 1.3rem);
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 14px;
  background: var(--card-bg);
}

.sub-card:first-of-type {
  margin-top: 0;
}

.sub-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}

.sub-head h3 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 0.98rem;
  color: var(--maroon-800);
}

.sub-note {
  font-family: var(--font-serif);
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.photo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem;
  border: 1px dashed rgba(201, 162, 92, 0.45);
  border-radius: 12px;
  background: #fffaf0;
}

.photo-preview {
  display: grid;
  place-items: center;
  flex: none;
  width: 72px;
  height: 72px;
  overflow: hidden;
  border: 1px solid rgba(201, 162, 92, 0.5);
  border-radius: 50%;
  background: var(--control-bg);
  color: var(--gold-300);
  font-family: var(--font-display);
  font-size: 1.25rem;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-actions {
  flex: 1;
  min-width: 200px;
}

.photo-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.hint {
  margin-top: 0.45rem;
  font-size: 0.67rem;
  line-height: 1.8;
  color: var(--muted);
}

.mini-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid rgba(201, 162, 92, 0.5);
  border-radius: 999px;
  background: var(--surface);
  color: var(--maroon-700);
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.mini-btn:hover {
  background: var(--gold-200);
  border-color: var(--gold-500);
}

.mini-btn.primary {
  border-color: transparent;
  background: linear-gradient(135deg, #f0dcb2, #d9b779);
  color: var(--maroon-900);
  font-weight: 600;
}

.mini-btn.danger {
  color: #9a2438;
  border-color: rgba(154, 36, 56, 0.3);
}

.mini-btn.danger:hover {
  background: rgba(154, 36, 56, 0.08);
}

.mini-btn input {
  display: none;
}

.mini-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem 1rem;
  margin-top: 0.9rem;
}

.grid-time {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 0.85rem;
  margin-top: 0.9rem;
}

.field {
  display: grid;
  gap: 0.3rem;
  margin-top: 0.85rem;
}

.field > span {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgba(201, 162, 92, 0.4);
  border-radius: 9px;
  background: #fff;
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--gold-500);
  box-shadow: 0 0 0 3px rgba(201, 162, 92, 0.18);
}

.field textarea {
  min-height: 70px;
  line-height: 1.8;
  resize: vertical;
}

.field small {
  font-size: 0.66rem;
  line-height: 1.7;
  color: var(--muted);
}

.block-divider {
  height: 1px;
  margin: 1.5rem 0 1rem;
  background: linear-gradient(90deg, transparent, rgba(201, 162, 92, 0.45), transparent);
}

.block-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 0.95rem;
  color: var(--maroon-800);
}

.item-card {
  margin-top: 0.85rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 12px;
  background: #fffefb;
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.item-index {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gold-200);
  color: var(--maroon-800);
  font-family: var(--font-display);
  font-size: 0.68rem;
}

.item-actions {
  display: flex;
  gap: 0.3rem;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(201, 162, 92, 0.4);
  border-radius: 8px;
  background: #fffdf8;
  color: var(--maroon-700);
  font-size: 0.82rem;
  line-height: 1;
  transition: background 0.2s ease;
}

.icon-btn:hover {
  background: var(--gold-200);
}

.icon-btn.danger {
  color: #9a2438;
  border-color: rgba(154, 36, 56, 0.28);
}

.icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.gallery-edit {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 0.9rem;
}

.gallery-card {
  padding: 0.7rem;
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 12px;
  background: #fffefb;
}

.gallery-preview {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 9px;
  color: rgba(255, 248, 234, 0.75);
}

.gallery-preview img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-preview svg {
  width: 42px;
  opacity: 0.8;
}

.gallery-index {
  position: absolute;
  top: 0.4rem;
  left: 0.5rem;
  z-index: 1;
  padding: 0.05rem 0.4rem;
  border-radius: 999px;
  background: rgba(30, 6, 12, 0.4);
  color: #fff8ea;
  font-size: 0.6rem;
  backdrop-filter: blur(2px);
}

.gallery-card .field {
  margin-top: 0.6rem;
}

.gallery-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.6rem;
}

.gallery-actions .mini-btn {
  padding: 0.35rem 0.6rem;
  font-size: 0.66rem;
}

.tone-wine {
  background: linear-gradient(150deg, #a4515f, #6d1f2e 52%, #3d0f1a);
}

.tone-gold {
  background: linear-gradient(150deg, #e8cf9c, #c9a25c 50%, #96712f);
}

.tone-deep {
  background: linear-gradient(150deg, #6d1f2e, #4a1220 55%, #2a0811);
}

.tone-sand {
  background: linear-gradient(150deg, #f0dcb2, #d9b779 50%, #a9823f);
}

.tone-rose {
  background: linear-gradient(150deg, #d79aa3, #b0606e 50%, #7a2b3b);
}

.tone-plum {
  background: linear-gradient(150deg, #8a4a56, #5a1a27 55%, #300a14);
}

.design-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: start;
  gap: 1.2rem;
}

.cover-preview {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border: 1px solid rgba(201, 162, 92, 0.4);
  border-radius: 14px;
  background: linear-gradient(155deg, #6d1f2e, #350b15);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75;
}

.cover-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.5rem;
  color: rgba(239, 217, 174, 0.6);
  text-align: center;
  font-size: 0.72rem;
  padding: 1rem;
}

.cover-placeholder svg {
  width: 54px;
}

.cover-text {
  position: absolute;
  inset: auto 0 0 0;
  padding: 1rem;
  background: linear-gradient(transparent, rgba(30, 6, 12, 0.85));
  color: #fff8ea;
  text-align: center;
}

.cover-text span {
  display: block;
  font-size: 0.62rem;
  letter-spacing: 0.05em;
  opacity: 0.75;
}

.cover-text strong {
  display: block;
  margin-top: 0.25rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1rem;
  color: var(--gold-200);
}

.design-info h3 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1rem;
  color: var(--maroon-800);
}

.design-info > p {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  line-height: 1.9;
  color: var(--muted);
}

.design-info .photo-buttons {
  margin-top: 0.85rem;
}

.design-note {
  margin-top: 1rem;
  padding: 0.8rem 0.9rem;
  border-left: 2px solid var(--gold-500);
  border-radius: 0 8px 8px 0;
  background: rgba(239, 217, 174, 0.22);
}

.design-note p {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.design-note span {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.7rem;
  line-height: 1.8;
  color: var(--muted);
}

.theme-link {
  margin-top: 0.55rem;
  text-decoration: none;
}

.response-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.stat {
  padding: 0.7rem 0.8rem;
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 12px;
  background: #fffaf0;
}

.stat span {
  font-size: 0.66rem;
  color: var(--muted);
}

.stat strong {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.15rem;
  color: var(--maroon-800);
}

.response-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.response-list {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.response-card {
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(201, 162, 92, 0.32);
  border-radius: 12px;
  background: #fffefb;
}

.response-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
}

.response-top strong {
  font-size: 0.85rem;
  color: var(--ink);
}

.response-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.08rem 0.55rem;
  border-radius: 999px;
  font-size: 0.62rem;
  vertical-align: middle;
}

.response-badge.yes {
  background: rgba(84, 140, 95, 0.14);
  color: #3f7a4d;
}

.response-badge.no {
  background: rgba(154, 36, 56, 0.1);
  color: #9a2438;
}

.response-meta {
  margin-top: 0.3rem;
  font-size: 0.68rem;
  color: var(--muted);
}

.response-message {
  margin-top: 0.4rem;
  padding-left: 0.6rem;
  border-left: 2px solid rgba(201, 162, 92, 0.5);
  font-size: 0.78rem;
  line-height: 1.8;
  color: var(--ink);
}

.empty {
  padding: 2rem 1rem;
  border: 1px dashed rgba(201, 162, 92, 0.4);
  border-radius: 12px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  z-index: 120;
  max-width: calc(100% - 2rem);
  padding: 0.6rem 1.2rem;
  transform: translateX(-50%);
  border: 1px solid rgba(239, 217, 174, 0.4);
  border-radius: 999px;
  background: #350b15;
  color: var(--gold-200);
  font-size: 0.78rem;
  text-align: center;
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.5);
}

.toast.error {
  border-color: rgba(220, 120, 120, 0.5);
  color: #f3c2c2;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

@media (max-width: 900px) {
  .editor-body {
    grid-template-columns: 1fr;
  }

  .tabs {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .storage-card {
    display: none;
  }

  .head-side {
    align-items: flex-start;
  }

  .head-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .head-inner,
  .editor-body {
    width: min(1180px, 100% - 1.75rem);
  }

  .grid-2,
  .design-grid,
  .response-summary {
    grid-template-columns: 1fr;
  }

  .response-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-time {
    grid-template-columns: 1fr;
  }

  .tab {
    padding: 0.5rem 0.6rem;
    font-size: 0.75rem;
  }

  .gallery-edit {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
