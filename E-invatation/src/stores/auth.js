import { computed, reactive } from 'vue'

const USERS_KEY = 'khmer-invitation-users-v1'
const SESSION_KEY = 'khmer-invitation-session-v1'

function readUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object' || !parsed.userId) return null
    return parsed
  } catch {
    return null
  }
}

export const authState = reactive({
  users: readUsers(),
  session: readSession(),
})

export const currentUser = computed(
  () => authState.users.find((user) => user.id === authState.session?.userId) || null,
)

export const isAuthenticated = computed(() => Boolean(currentUser.value))

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createSalt() {
  const bytes = new Uint8Array(16)
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

function fallbackHash(value) {
  let hash = 5381
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }
  return `fallback-${(hash >>> 0).toString(16)}`
}

async function hashPassword(password, salt) {
  const value = `${salt}:${password}`
  if (window.crypto?.subtle && window.isSecureContext) {
    try {
      const data = new TextEncoder().encode(value)
      const digest = await window.crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
    } catch {
      return fallbackHash(value)
    }
  }
  return fallbackHash(value)
}

function persistUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(authState.users))
}

function persistSession() {
  if (authState.session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(authState.session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

export async function register({ name, email, phone, password }) {
  const cleanName = String(name || '').trim()
  const cleanEmail = normalizeEmail(email)
  const cleanPhone = String(phone || '').trim()

  if (cleanName.length < 2) {
    throw new Error('សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('អ៊ីមែលមិនត្រឹមត្រូវ')
  }
  if (String(password || '').length < 6) {
    throw new Error('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ')
  }
  if (authState.users.some((user) => user.email === cleanEmail)) {
    throw new Error('អ៊ីមែលនេះបានចុះឈ្មោះរួចហើយ')
  }

  const salt = createSalt()
  const hash = await hashPassword(password, salt)
  const user = {
    id: createId(),
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  }

  authState.users.push(user)
  persistUsers()
  authState.session = { userId: user.id, createdAt: new Date().toISOString() }
  persistSession()

  return user
}

export async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email)
  const user = authState.users.find((item) => item.email === cleanEmail)
  if (!user) {
    throw new Error('រកមិនឃើញគណនីដែលមានអ៊ីមែលនេះទេ')
  }

  const hash = await hashPassword(password, user.salt)
  if (hash !== user.hash) {
    throw new Error('ពាក្យសម្ងាត់មិនត្រឹមត្រូវ')
  }

  authState.session = { userId: user.id, createdAt: new Date().toISOString() }
  persistSession()

  return user
}

export function logout() {
  authState.session = null
  persistSession()
}

export function updateProfile({ name, phone }) {
  const user = currentUser.value
  if (!user) return

  if (name !== undefined) user.name = String(name).trim() || user.name
  if (phone !== undefined) user.phone = String(phone).trim()
  persistUsers()
}
