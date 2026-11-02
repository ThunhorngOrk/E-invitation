export const RSVP_STORAGE_KEY = 'khmer-invitation-rsvp'

export function loadResponses() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveResponses(responses) {
  localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(responses))
}

export function addResponse(entry) {
  const responses = loadResponses()
  responses.push(entry)
  saveResponses(responses)
  return responses
}
