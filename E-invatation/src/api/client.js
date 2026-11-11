import { t } from '../i18n'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const TOKEN_KEY = 'e-invitation-api-token'

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable
  }
}

function extractMessage(body, fallback) {
  if (body?.errors && typeof body.errors === 'object') {
    const first = Object.values(body.errors)[0]
    if (Array.isArray(first) && first.length) return String(first[0])
    if (typeof first === 'string') return first
  }
  return body?.message || fallback
}

async function parseBody(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, formData, auth = true } = options
  const headers = { Accept: 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload
  if (formData) {
    payload = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(t('auth.errors.network'), 0)
  }

  const data = await parseBody(response)

  if (!response.ok) {
    if (response.status === 401) setToken(null)
    throw new ApiError(
      extractMessage(data, t('auth.errors.requestFailed')),
      response.status,
      data?.errors || {},
    )
  }

  return data
}

function unwrap(data) {
  return data && typeof data === 'object' && 'data' in data ? data.data : data
}

export const api = {
  request,
  unwrap,
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: 'PATCH', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  upload: (path, file, field = 'photo', fields = {}) => {
    const formData = new FormData()
    formData.append(field, file, file.name || 'photo.jpg')
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value)
    })
    return request(path, { method: 'POST', formData })
  },
}
