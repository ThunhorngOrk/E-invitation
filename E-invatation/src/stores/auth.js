import { computed, reactive } from 'vue'
import { api, getToken, setToken } from '../api/client'
import { t } from '../i18n'

export const authState = reactive({
  user: null,
  ready: false,
})

export const currentUser = computed(() => authState.user)
export const isAuthenticated = computed(() => Boolean(authState.user))

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function applySession(payload) {
  const data = api.unwrap(payload) || {}
  const user = data.user || null
  if (data.token) setToken(data.token)
  authState.user = user
  return user
}

function translateAuthError(error) {
  const fieldErrors = error?.errors || {}
  const first = Object.values(fieldErrors).flat?.() || []
  const raw = [error?.message, ...first].filter(Boolean).join(' ')

  if (/already been taken|already been registered|unique/i.test(raw)) {
    return new Error(t('auth.errors.emailTaken'))
  }
  if (/credentials are incorrect|invalid credentials/i.test(raw)) {
    return new Error(t('auth.errors.invalidCredentials'))
  }
  if (/email/i.test(raw) && /valid|format/i.test(raw)) {
    return new Error(t('auth.errors.invalidEmail'))
  }
  if (/password/i.test(raw) && /min|least/i.test(raw)) {
    return new Error(t('auth.errors.passwordLength'))
  }
  return error instanceof Error ? error : new Error(t('auth.errors.requestFailed'))
}

export async function initAuth() {
  if (!getToken()) {
    authState.ready = true
    return false
  }

  try {
    const payload = await api.get('/me')
    const data = api.unwrap(payload) || {}
    authState.user = data.user || null
    return Boolean(authState.user)
  } catch {
    setToken(null)
    authState.user = null
    return false
  } finally {
    authState.ready = true
  }
}

export async function register({ name, email, phone, password }) {
  const cleanName = String(name || '').trim()
  const cleanEmail = normalizeEmail(email)
  const cleanPhone = String(phone || '').trim()

  if (cleanName.length < 2) {
    throw new Error(t('auth.errors.fullNameRequired'))
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('អ៊ីមែលមិនត្រឹមត្រូវ')
  }
  if (String(password || '').length < 6) {
    throw new Error('ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ')
  }

  try {
    const payload = await api.post(
      '/auth/register',
      {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        password,
      },
      { auth: false },
    )
    return applySession(payload)
  } catch (error) {
    throw translateAuthError(error)
  }
}

export async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email)

  try {
    const payload = await api.post(
      '/auth/login',
      { email: cleanEmail, password },
      { auth: false },
    )
    return applySession(payload)
  } catch (error) {
    throw translateAuthError(error)
  }
}

export async function logout() {
  try {
    await api.post('/logout')
  } catch {
    // token may already be invalid
  } finally {
    setToken(null)
    authState.user = null
  }
}

export async function updateProfile({ name, phone }) {
  if (!authState.user) return null

  const payload = {}
  if (name !== undefined) payload.name = String(name).trim()
  if (phone !== undefined) payload.phone = String(phone).trim()

  const response = await api.patch('/me', payload)
  const data = api.unwrap(response) || {}
  authState.user = data.user || authState.user
  return authState.user
}
