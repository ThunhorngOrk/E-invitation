<script setup>
import { computed, nextTick, onUnmounted, ref } from 'vue'
import FormField from '../components/event/FormField.vue'
import ScheduleDayCard from '../components/event/ScheduleDayCard.vue'
import Icon from '../components/event/Icon.vue'
import { categoryOptions, useEventDraft } from '../composables/useEventDraft'
import { prepareImage } from '../utils/image'
import { formatNumber, t } from '../i18n'
import { eventToInvitation } from '../utils/eventToInvitation'
import { importInvitation, invitationSnapshot } from '../stores/invitation'

const {
  form,
  errors,
  saving,
  savedAt,
  restored,
  submitted,
  formatSaved,
  loadDraft,
  persist,
  addDay,
  removeDay,
  addActivity,
  removeActivity,
  validate,
} = useEventDraft()

const props = defineProps({
  embedded: { type: Boolean, default: false },
})
const emit = defineEmits(['saved'])

const scheduleOpen = ref(true)
const coverInput = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer

loadDraft()

if (restored.value) {
  nextTick(() => notify(t('form.toastRestored'), 'info'))
}

const totalDays = computed(() => form.scheduleDays.length)
const totalActivities = computed(() =>
  form.scheduleDays.reduce((sum, day) => sum + day.activities.length, 0),
)
const savedLabel = computed(() => (savedAt.value ? formatSaved(savedAt.value) : ''))

const previewDomain = computed(() => {
  const value = form.eventUrl.trim()
  if (!value) return 'example.com'
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return value
  }
})

const previewUrlText = computed(() => {
  const value = form.eventUrl.trim()
  return value || 'https://your-event.com'
})

function notify(message, type = 'success') {
  toast.value = { show: true, message, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

function toggleSchedule() {
  scheduleOpen.value = !scheduleOpen.value
}

function handleAddDay() {
  delete errors.scheduleDays
  const day = addDay()
  scheduleOpen.value = true
  notify(t('form.toastDayAdded'))
  nextTick(() => {
    document.getElementById(`day-${day.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function handleAddActivity(dayId) {
  addActivity(dayId)
  delete errors.activities
}

function handleRemoveDay(day) {
  const message = t('form.confirmRemoveDay')
  if (!window.confirm(message)) return
  removeDay(day.id)
  notify(t('form.toastDayRemoved'))
}

function handleRemoveActivity(dayId, activityId) {
  if (!window.confirm(t('form.confirmRemoveActivity'))) return
  removeActivity(dayId, activityId)
  notify(t('form.toastActivityRemoved'))
}

function triggerCoverUpload() {
  coverInput.value?.click()
}

async function handleCoverChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    form.coverImage = await prepareImage(file, 1200)
    notify(t('form.toastCoverAdded'))
  } catch {
    notify(t('form.toastImageError'), 'error')
  } finally {
    event.target.value = ''
  }
}

function handleRemoveCover() {
  if (!form.coverImage) return
  if (!window.confirm(t('form.confirmRemoveCover'))) return
  form.coverImage = ''
  notify(t('form.toastCoverRemoved'))
}

function goPrevious() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.hash = '#/'
  }
}

function handleSubmit() {
  if (!validate()) {
    notify(t('form.toastValidation'), 'error')
    nextTick(() => {
      const target =
        document.querySelector('.field.has-error') ||
        document.querySelector('.schedule-error') ||
        document.querySelector('.schedule-card')
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return
  }

  submitted.value = true
  const saved = persist()
  importInvitation(eventToInvitation(form, invitationSnapshot()))

  notify(saved ? t('form.toastSaved') : t('form.toastSavedLocal'), saved ? 'success' : 'info')

  if (props.embedded) {
    emit('saved')
    return
  }

  window.setTimeout(() => {
    window.location.hash = '#/preview'
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, 500)
}

onUnmounted(() => clearTimeout(toastTimer))
</script>

<template>
  <div class="event-page" :class="{ embedded }">
    <header v-if="!embedded" class="topbar">
      <div class="topbar-inner">
        <button class="back-btn" type="button" :aria-label="t('form.backAria')" @click="goPrevious">
          <Icon name="arrow-left" :size="19" />
        </button>

        <div class="topbar-title">
          <span class="eyebrow">E-invitation</span>
          <h1>{{ t('form.title') }}</h1>
        </div>

        <span class="save-chip" :class="{ saving }">
          <Icon :name="saving ? 'save' : 'check-circle'" :size="14" />
          <span v-if="saving">{{ t('form.saving') }}</span>
          <span v-else-if="savedLabel">{{ t('form.savedAt', { time: savedLabel }) }}</span>
          <span v-else>{{ t('form.autosave') }}</span>
        </span>
      </div>
    </header>

    <main class="page-body">
      <section class="intro-card">
        <div class="intro-top">
          <span class="intro-badge">
            <Icon name="sparkles" :size="16" />
            {{ t('form.newEvent') }}
          </span>
          <span v-if="submitted" class="submitted-chip">
            <Icon name="check" :size="13" />
            {{ t('form.submitted') }}
          </span>
        </div>
        <h2>{{ t('form.introTitle') }}</h2>
        <p>{{ t('form.introText') }}</p>
        <div class="intro-stats">
          <span class="stat">
            <Icon name="calendar" :size="15" />
            {{ formatNumber(totalDays) }} {{ t('common.days') }}
          </span>
          <span class="stat">
            <Icon name="list" :size="15" />
            {{ formatNumber(totalActivities) }} {{ t('common.activities') }}
          </span>
        </div>
      </section>

      <section class="card">
        <header class="card-head">
          <span class="card-icon">
            <Icon name="file-text" :size="20" />
          </span>
          <div class="card-head-text">
            <h2>{{ t('form.infoTitle') }}</h2>
            <p>{{ t('form.infoText') }}</p>
          </div>
        </header>

        <div class="field-stack">
          <FormField
            v-model="form.eventName"
            :label="t('form.eventName')"
            icon="sparkles"
            required
            :placeholder="t('form.eventNamePlaceholder')"
            :error="errors.eventName"
          />

          <FormField
            v-model="form.eventCategory"
            :label="t('form.category')"
            icon="tag"
            type="select"
            required
            :options="categoryOptions"
          />

          <div class="field-grid">
            <FormField
              v-model="form.brideName"
              :label="t('form.bride')"
              icon="heart"
              required
              :placeholder="t('form.bridePlaceholder')"
              :error="errors.brideName"
            />
            <FormField
              v-model="form.groomName"
              :label="t('form.groom')"
              icon="user"
              required
              :placeholder="t('form.groomPlaceholder')"
              :error="errors.groomName"
            />
          </div>

          <div class="field-grid">
            <FormField
              v-model="form.startDate"
              :label="t('form.startDate')"
              icon="calendar"
              type="date"
              required
              :error="errors.startDate"
            />
            <FormField
              v-model="form.startTime"
              :label="t('form.startTime')"
              icon="clock"
              type="time"
              required
              :error="errors.startTime"
            />
          </div>

          <FormField
            v-model="form.venueAddress"
            :label="t('form.venue')"
            icon="map-pin"
            type="textarea"
            :rows="2"
            :placeholder="t('form.venuePlaceholder')"
          />

          <FormField
            v-model="form.notes"
            :label="t('form.notes')"
            icon="file-text"
            type="textarea"
            :rows="3"
            :placeholder="t('form.notesPlaceholder')"
          />
        </div>
      </section>

      <section
        class="card schedule-card"
        :class="{ open: scheduleOpen, 'has-error': errors.scheduleDays || errors.activities }"
      >
        <div class="schedule-head-row">
          <button
            class="schedule-toggle"
            type="button"
            :aria-expanded="scheduleOpen"
            @click="toggleSchedule"
          >
            <span class="card-icon">
              <Icon name="calendar" :size="20" />
            </span>
            <span class="card-head-text">
              <span class="schedule-title">{{ t('form.scheduleTitle') }}</span>
              <span class="schedule-sub">
                {{ formatNumber(totalDays) }} {{ t('common.days') }} · {{ formatNumber(totalActivities) }} {{ t('common.activities') }}
              </span>
            </span>
            <span class="chev-wrap">
              <Icon name="chevron-down" :size="18" class="chev" />
            </span>
          </button>

          <button class="add-day-btn" type="button" @click="handleAddDay">
            <Icon name="plus" :size="16" />
            <span>{{ t('form.addDay') }}</span>
          </button>
        </div>

        <div class="schedule-collapse" :class="{ open: scheduleOpen }">
          <div class="schedule-collapse-inner">
            <div class="schedule-body">
              <p v-if="errors.scheduleDays" class="schedule-error">{{ errors.scheduleDays }}</p>
              <p v-else-if="errors.activities" class="schedule-error">{{ errors.activities }}</p>

              <div v-if="!form.scheduleDays.length" class="schedule-empty">
                <span class="empty-icon">
                  <Icon name="calendar" :size="24" />
                </span>
                <p class="empty-title">{{ t('form.noDays') }}</p>
                <p class="empty-sub">{{ t('form.noDaysSub') }}</p>
                <button class="empty-btn" type="button" @click="handleAddDay">
                  <Icon name="plus" :size="16" />
                  {{ t('form.addFirstDay') }}
                </button>
              </div>

              <div v-else class="day-list">
                <div v-for="(day, index) in form.scheduleDays" :id="`day-${day.id}`" :key="day.id">
                  <ScheduleDayCard
                    :day="day"
                    :index="index"
                    @toggle="day.open = !day.open"
                    @remove="handleRemoveDay(day)"
                    @add-activity="handleAddActivity(day.id)"
                    @remove-activity="handleRemoveActivity(day.id, $event)"
                  />
                </div>
              </div>

              <button
                v-if="form.scheduleDays.length"
                class="add-day-wide"
                type="button"
                @click="handleAddDay"
              >
                <Icon name="plus" :size="16" />
                {{ t('form.addDays') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <header class="card-head">
          <span class="card-icon">
            <Icon name="link" :size="20" />
          </span>
          <div class="card-head-text">
            <h2>{{ t('form.mediaTitle') }}</h2>
            <p>{{ t('form.mediaText') }}</p>
          </div>
        </header>

        <div class="field-stack">
          <div class="field">
            <span class="cover-label">{{ t('form.cover') }}</span>

            <div v-if="form.coverImage" class="cover-preview">
              <img :src="form.coverImage" :alt="t('form.coverAlt')" />
              <div class="cover-overlay">
                <button type="button" class="cover-action" @click="triggerCoverUpload">
                  <Icon name="upload" :size="15" />
                  {{ t('form.changeCover') }}
                </button>
                <button type="button" class="cover-action danger" @click="handleRemoveCover">
                  <Icon name="trash" :size="15" />
                  {{ t('form.removeCover') }}
                </button>
              </div>
            </div>

            <button v-else type="button" class="cover-drop" @click="triggerCoverUpload">
              <span class="cover-drop-icon">
                <Icon name="image" :size="26" />
              </span>
              <span class="cover-drop-title">{{ t('form.uploadCover') }}</span>
              <span class="cover-drop-hint">{{ t('form.coverHint') }}</span>
            </button>

            <input
              ref="coverInput"
              class="hidden-input"
              type="file"
              accept="image/*"
              @change="handleCoverChange"
            />
          </div>

          <FormField
            v-model="form.eventUrl"
            :label="t('form.url')"
            icon="link"
            type="url"
            placeholder="https://your-event.com/invitation"
            :hint="t('form.urlHint')"
          />

          <div class="preview-block">
            <div class="preview-head">
              <span>
                <Icon name="globe" :size="15" />
                {{ t('form.previewHead') }}
              </span>
              <span class="preview-badge">{{ t('form.previewBadge') }}</span>
            </div>

            <article class="preview-card">
              <div class="preview-media">
                <img v-if="form.coverImage" :src="form.coverImage" alt="" />
                <span v-else class="preview-placeholder">
                  <Icon name="image" :size="26" />
                </span>
              </div>
              <div class="preview-body">
                <span class="preview-domain">{{ previewDomain }}</span>
                <h3>{{ form.eventName || t('form.previewName') }}</h3>
                <p>
                  {{
                    form.notes ||
                    t('form.previewDesc')
                  }}
                </p>
                <span class="preview-url">{{ previewUrlText }}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <button v-if="embedded" class="embedded-submit" type="button" @click="handleSubmit">
        <Icon name="check" :size="18" />
        <span>{{ t('form.confirm') }}</span>
      </button>
    </main>

    <div v-if="!embedded" class="action-bar">
      <div class="action-inner">
        <button class="btn-ghost" type="button" @click="goPrevious">
          <Icon name="arrow-left" :size="18" />
          <span>{{ t('common.back') }}</span>
        </button>
        <button class="btn-primary" type="button" @click="handleSubmit">
          <Icon name="check" :size="18" />
          <span>{{ t('form.confirm') }}</span>
        </button>
      </div>
    </div>

    <Transition name="toast">
      <p v-if="toast.show" class="toast" :class="toast.type" role="status">
        <Icon :name="toast.type === 'error' ? 'info' : 'check-circle'" :size="17" />
        {{ toast.message }}
      </p>
    </Transition>
  </div>
</template>

<style scoped>
.event-page.embedded {
  min-height: 0;
  padding-bottom: 0;
  background: transparent;
}

.event-page.embedded .page-body {
  width: 100%;
  margin: 0;
  gap: 0.9rem;
}

.embedded-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  min-height: 50px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--maroon-700), var(--maroon-800));
  color: #fff;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 14px 26px -16px color-mix(in srgb, var(--maroon-800) 90%, transparent);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.embedded-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px -16px color-mix(in srgb, var(--maroon-800) 95%, transparent);
}

.event-page {
  min-height: 100svh;
  padding-bottom: 7.5rem;
  background:
    radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--maroon-700) 8%, transparent), transparent 38%),
    radial-gradient(circle at 100% 8%, color-mix(in srgb, var(--maroon-700) 6%, transparent), transparent 34%),
    var(--ivory);
  color: var(--ink);
}

.topbar {
  position: relative;
  z-index: 20;
  border-bottom: 1px solid color-mix(in srgb, var(--maroon-700) 10%, transparent);
  background: color-mix(in srgb, var(--ivory) 86%, transparent);
  backdrop-filter: blur(14px);
}

.topbar-inner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: min(760px, 100% - 2rem);
  margin-inline: auto;
  padding: 0.75rem 0;
}

.back-btn {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  border: 1.5px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 13px;
  background: #fff;
  color: var(--maroon-800);
  transition: background 0.18s ease, border-color 0.18s ease;
}

.back-btn:hover {
  background: var(--gold-200);
  border-color: var(--maroon-700);
}

.topbar-title {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.05rem;
}

.eyebrow {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--maroon-700);
}

.topbar-title h1 {
  font-family: var(--font-display, inherit);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.5;
  color: var(--maroon-800);
}

.save-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex: none;
  padding: 0.4rem 0.65rem;
  border: 1px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 999px;
  background: #fff;
  color: var(--muted);
  font-size: 0.62rem;
  white-space: nowrap;
}

.save-chip.saving {
  color: var(--maroon-700);
  border-color: var(--gold-400);
}

.save-chip.saving svg {
  animation: pulse 1s ease-in-out infinite;
}

.page-body {
  display: grid;
  gap: 1rem;
  width: min(760px, 100% - 2rem);
  margin: 1rem auto 0;
}

.intro-card {
  padding: 1.15rem 1.2rem;
  border-radius: 20px;
  background:
    radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.28), transparent 45%),
    linear-gradient(135deg, var(--maroon-700), var(--maroon-800) 70%, var(--maroon-900));
  color: #fff;
  box-shadow: 0 20px 40px -26px color-mix(in srgb, var(--maroon-800) 75%, transparent);
}

.intro-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.intro-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.66rem;
  font-weight: 600;
}

.submitted-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--maroon-800);
  font-size: 0.62rem;
  font-weight: 700;
}

.intro-card h2 {
  margin-top: 0.8rem;
  font-size: 1.12rem;
  font-weight: 700;
  line-height: 1.55;
}

.intro-card p {
  margin-top: 0.35rem;
  font-size: 0.76rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.intro-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.9rem;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.68rem;
  font-weight: 600;
}

.card {
  padding: 1.15rem;
  border: 1px solid color-mix(in srgb, var(--maroon-700) 9%, transparent);
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 42px -34px color-mix(in srgb, var(--maroon-800) 55%, transparent);
}

.card.has-error {
  border-color: #f0b4b4;
}

.card-head {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding-bottom: 0.9rem;
  margin-bottom: 0.9rem;
  border-bottom: 1px dashed color-mix(in srgb, var(--gold-500) 35%, #fff);
}

.card-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--gold-200), var(--gold-300));
  color: var(--maroon-800);
}

.card-head-text {
  flex: 1;
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.card-head-text h2 {
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.5;
  color: var(--maroon-800);
}

.card-head-text p {
  font-size: 0.72rem;
  line-height: 1.65;
  color: var(--muted);
}

.field-stack {
  display: grid;
  gap: 0.95rem;
}

.field-grid {
  display: grid;
  gap: 0.95rem;
}

.schedule-head-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.schedule-toggle {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.schedule-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--maroon-800);
}

.schedule-sub {
  font-size: 0.7rem;
  color: var(--muted);
}

.chev-wrap {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: var(--muted);
}

.chev {
  transition: transform 0.25s ease;
}

.schedule-card.open .chev-wrap .chev {
  transform: rotate(180deg);
}

.add-day-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex: none;
  padding: 0.55rem 0.7rem;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--maroon-700), var(--maroon-800));
  color: #fff;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  box-shadow: 0 10px 20px -14px color-mix(in srgb, var(--maroon-800) 90%, transparent);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.add-day-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px -14px color-mix(in srgb, var(--maroon-800) 90%, transparent);
}

.schedule-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.schedule-collapse.open {
  grid-template-rows: 1fr;
}

.schedule-collapse-inner {
  overflow: hidden;
}

.schedule-body {
  display: grid;
  gap: 0.7rem;
  padding-top: 1rem;
}

.schedule-error {
  padding: 0.55rem 0.75rem;
  border: 1px solid rgba(224, 74, 74, 0.25);
  border-radius: 11px;
  background: #fff6f6;
  color: #c62828;
  font-size: 0.72rem;
  line-height: 1.6;
}

.schedule-empty {
  display: grid;
  justify-items: center;
  gap: 0.35rem;
  padding: 1.4rem 1rem;
  border: 1.5px dashed color-mix(in srgb, var(--gold-500) 45%, #fff);
  border-radius: 16px;
  background: #fff9fb;
  text-align: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 15px;
  background: var(--gold-200);
  color: var(--maroon-700);
}

.empty-title {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--maroon-800);
}

.empty-sub {
  font-size: 0.72rem;
  line-height: 1.65;
  color: var(--muted);
}

.empty-btn,
.add-day-wide {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin-top: 0.4rem;
  padding: 0.6rem 0.9rem;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--maroon-700), var(--maroon-800));
  color: #fff;
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 600;
}

.add-day-wide {
  width: 100%;
  border: 1.5px dashed var(--gold-400);
  background: #fff8fb;
  color: var(--maroon-800);
}

.add-day-wide:hover {
  background: var(--gold-200);
}

.day-list {
  display: grid;
  gap: 0.7rem;
}

.cover-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.cover-drop {
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  width: 100%;
  padding: 1.4rem 1rem;
  border: 1.5px dashed color-mix(in srgb, var(--gold-500) 45%, #fff);
  border-radius: 16px;
  background: #fff9fb;
  color: var(--maroon-800);
  font-family: inherit;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.cover-drop:hover {
  background: var(--gold-200);
  border-color: var(--maroon-700);
}

.cover-drop-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin-bottom: 0.15rem;
  border-radius: 16px;
  background: var(--gold-200);
}

.cover-drop-title {
  font-size: 0.85rem;
  font-weight: 700;
}

.cover-drop-hint {
  font-size: 0.68rem;
  color: var(--muted);
}

.cover-preview {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  background: var(--gold-200);
}

.cover-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.6rem;
  background: linear-gradient(transparent, rgba(45, 10, 24, 0.72));
}

.cover-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-family: inherit;
  font-size: 0.68rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.cover-action.danger {
  border-color: color-mix(in srgb, var(--gold-300) 70%, transparent);
  color: #ffd7e1;
}

.hidden-input {
  display: none;
}

.preview-block {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.15rem;
}

.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.preview-head > span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.preview-badge {
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: var(--gold-200);
  color: var(--maroon-800);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.preview-card {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--gold-500) 30%, #fff);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 14px 30px -26px color-mix(in srgb, var(--maroon-800) 60%, transparent);
}

.preview-media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 8;
  background: linear-gradient(135deg, var(--gold-200), var(--gold-300));
  color: var(--gold-600);
}

.preview-media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-body {
  display: grid;
  gap: 0.25rem;
  padding: 0.8rem 0.9rem 0.95rem;
}

.preview-domain {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--maroon-700);
}

.preview-body h3 {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.5;
  color: var(--maroon-800);
}

.preview-body p {
  font-size: 0.72rem;
  line-height: 1.7;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-url {
  margin-top: 0.15rem;
  overflow: hidden;
  font-size: 0.66rem;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-bar {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 30;
  padding: 0.7rem 0 calc(0.7rem + env(safe-area-inset-bottom));
  border-top: 1px solid color-mix(in srgb, var(--maroon-700) 10%, transparent);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  box-shadow: 0 -18px 40px -30px color-mix(in srgb, var(--maroon-800) 60%, transparent);
}

.action-inner {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 0.6rem;
  width: min(760px, 100% - 2rem);
  margin-inline: auto;
}

.btn-ghost,
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 50px;
  border-radius: 14px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}

.btn-ghost {
  border: 1.5px solid color-mix(in srgb, var(--gold-500) 30%, #fff);
  background: #fff;
  color: var(--muted);
}

.btn-ghost:hover {
  background: var(--gold-200);
  border-color: var(--gold-400);
  color: var(--maroon-800);
}

.btn-primary {
  border: 0;
  background: linear-gradient(135deg, var(--maroon-700), var(--maroon-800));
  color: #fff;
  box-shadow: 0 14px 26px -16px color-mix(in srgb, var(--maroon-800) 90%, transparent);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px -16px color-mix(in srgb, var(--maroon-800) 95%, transparent);
}

.btn-ghost:active,
.btn-primary:active {
  transform: translateY(0);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: calc(6rem + env(safe-area-inset-bottom));
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  max-width: calc(100% - 2rem);
  padding: 0.65rem 0.95rem;
  border-radius: 13px;
  background: var(--ink);
  color: #fff;
  font-size: 0.76rem;
  line-height: 1.5;
  box-shadow: 0 20px 40px -20px color-mix(in srgb, var(--ink) 80%, transparent);
  transform: translateX(-50%);
}

.toast.error {
  background: #b3261e;
}

.toast.info {
  background: #6d1f2e;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@media (min-width: 640px) {
  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card {
    padding: 1.35rem 1.4rem;
  }

  .page-body {
    margin-top: 1.25rem;
    gap: 1.15rem;
  }
}

@media (max-width: 480px) {
  .topbar-inner,
  .page-body,
  .action-inner {
    width: calc(100% - 1.5rem);
  }

  .card {
    padding: 1rem;
  }

  .save-chip {
    display: none;
  }

  .add-day-btn span {
    display: none;
  }

  .add-day-btn {
    padding: 0.55rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .schedule-collapse,
  .day-collapse,
  .chev,
  .toast {
    transition: none;
  }
}
</style>
