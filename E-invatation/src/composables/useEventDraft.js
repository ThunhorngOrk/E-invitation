import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { locale, t } from '../i18n'

const DRAFT_KEY = 'e-invitation-event-draft-v1'

export const CATEGORY_VALUES = ['wedding', 'engagement', 'birthday', 'corporate', 'religious']

export const categoryOptions = computed(() => {
  locale.value
  return CATEGORY_VALUES.map((value) => ({ value, label: t(`categories.${value}`) }))
})

export function categoryLabel(value) {
  return CATEGORY_VALUES.includes(value) ? t(`categories.${value}`) : ''
}

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function createActivity() {
  return { id: uid(), name: '', time: '' }
}

export function createDay() {
  return { id: uid(), date: '', open: true, activities: [] }
}

function createForm() {
  return {
    eventName: '',
    eventCategory: 'wedding',
    brideName: '',
    groomName: '',
    startDate: '',
    startTime: '',
    venueAddress: '',
    notes: '',
    eventUrl: '',
    coverImage: '',
    scheduleDays: [],
  }
}

function normalizeForm(raw) {
  const next = createForm()
  if (!raw || typeof raw !== 'object') return next

  for (const key of Object.keys(next)) {
    if (key === 'scheduleDays') continue
    if (typeof raw[key] === 'string') next[key] = raw[key]
  }

  if (Array.isArray(raw.scheduleDays)) {
    next.scheduleDays = raw.scheduleDays.map((day) => ({
      id: typeof day?.id === 'string' ? day.id : uid(),
      date: typeof day?.date === 'string' ? day.date : '',
      open: day?.open !== false,
      activities: Array.isArray(day?.activities)
        ? day.activities.map((activity) => ({
            id: typeof activity?.id === 'string' ? activity.id : uid(),
            name: typeof activity?.name === 'string' ? activity.name : '',
            time: typeof activity?.time === 'string' ? activity.time : '',
          }))
        : [],
    }))
  }

  return next
}

function formatSaved(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return date.toLocaleTimeString(locale.value === 'km' ? 'km-KH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return date.toLocaleTimeString()
  }
}

export function useEventDraft() {
  const form = reactive(createForm())
  const errors = reactive({})
  const saving = ref(false)
  const savedAt = ref('')
  const restored = ref(false)
  const submitted = ref(false)
  let saveTimer

  function persist() {
    try {
      const timestamp = new Date().toISOString()
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form, savedAt: timestamp, submitted: submitted.value }),
      )
      savedAt.value = timestamp
      saving.value = false
      return true
    } catch {
      saving.value = false
      return false
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return false
      const data = JSON.parse(raw)
      const draft = data?.form || data
      Object.assign(form, normalizeForm(draft))
      if (data?.savedAt) savedAt.value = data.savedAt
      submitted.value = Boolean(data?.submitted)
      restored.value = true
      return true
    } catch {
      return false
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      return
    }
    savedAt.value = ''
    submitted.value = false
  }

  function addDay() {
    const day = createDay()
    form.scheduleDays.push(day)
    return day
  }

  function removeDay(id) {
    const index = form.scheduleDays.findIndex((day) => day.id === id)
    if (index >= 0) form.scheduleDays.splice(index, 1)
  }

  function addActivity(dayId) {
    const day = form.scheduleDays.find((item) => item.id === dayId)
    if (!day) return
    day.activities.push(createActivity())
  }

  function removeActivity(dayId, activityId) {
    const day = form.scheduleDays.find((item) => item.id === dayId)
    if (!day) return
    const index = day.activities.findIndex((activity) => activity.id === activityId)
    if (index >= 0) day.activities.splice(index, 1)
  }

  function validate() {
    for (const key of Object.keys(errors)) delete errors[key]

    if (!form.eventName.trim()) errors.eventName = t('validation.eventName')
    if (!form.brideName.trim()) errors.brideName = t('validation.brideName')
    if (!form.groomName.trim()) errors.groomName = t('validation.groomName')
    if (!form.startDate) errors.startDate = t('validation.startDate')
    if (!form.startTime) errors.startTime = t('validation.startTime')

    if (!form.scheduleDays.length) {
      errors.scheduleDays = t('validation.scheduleDays')
    } else {
      const hasActivity = form.scheduleDays.some((day) => day.activities.length > 0)
      if (!hasActivity) errors.activities = t('validation.activities')
    }

    return Object.keys(errors).length === 0
  }

  for (const key of ['eventName', 'brideName', 'groomName', 'startDate', 'startTime']) {
    watch(
      () => form[key],
      () => {
        delete errors[key]
      },
    )
  }

  watch(
    form,
    () => {
      saving.value = true
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        persist()
      }, 600)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    clearTimeout(saveTimer)
  })

  return {
    form,
    errors,
    saving,
    savedAt,
    restored,
    submitted,
    formatSaved,
    loadDraft,
    clearDraft,
    persist,
    addDay,
    removeDay,
    addActivity,
    removeActivity,
    validate,
  }
}
