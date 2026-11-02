import { categoryLabel } from '../composables/useEventDraft'

function formatDate(value, locale, options) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return date.toLocaleDateString(locale, options)
  } catch {
    return ''
  }
}

function formatDayLabel(value) {
  return formatDate(value, 'km-KH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function eventToInvitation(form, current = {}) {
  const groomName = form.groomName.trim() || current.groom?.nameKh || ''
  const brideName = form.brideName.trim() || current.bride?.nameKh || ''
  const eventName = form.eventName.trim()
  const notes = form.notes.trim()
  const address = form.venueAddress.trim()
  const category =
    categoryLabel(form.eventCategory)

  const dateKh = formatDate(form.startDate, 'km-KH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const dateEn = formatDate(form.startDate, 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const schedule = []
  form.scheduleDays.forEach((day) => {
    const dayLabel = formatDayLabel(day.date)
    day.activities.forEach((activity) => {
      const title = activity.name.trim()
      if (!title) return
      schedule.push({
        time: activity.time || form.startTime || '09:00',
        title,
        desc: dayLabel,
      })
    })
  })
  schedule.sort((a, b) => a.time.localeCompare(b.time))

  const venueName = address ? address.split(',')[0].trim() : current.venue?.name || ''

  return {
    ...current,
    heroImage: form.coverImage || current.heroImage || '',
    heroKicker: eventName || current.heroKicker || '',
    groom: {
      ...(current.groom || {}),
      nameKh: groomName,
      initial: groomName.slice(0, 1),
    },
    bride: {
      ...(current.bride || {}),
      nameKh: brideName,
      initial: brideName.slice(0, 1),
    },
    eventTime: form.startTime || current.eventTime,
    dateISO:
      form.startDate && form.startTime
        ? `${form.startDate}T${form.startTime}:00+07:00`
        : current.dateISO,
    dateKh: dateKh || current.dateKh,
    dateEn: dateEn || current.dateEn,
    inviteEyebrow: category || current.inviteEyebrow,
    inviteTitle: eventName || current.inviteTitle,
    invitationSub: notes || current.invitationSub,
    venue: {
      ...(current.venue || {}),
      name: venueName || current.venue?.name,
      address: address || current.venue?.address,
      mapQuery: address || current.venue?.mapQuery,
      note: notes || current.venue?.note,
    },
    schedule: schedule.length ? schedule : current.schedule,
  }
}
