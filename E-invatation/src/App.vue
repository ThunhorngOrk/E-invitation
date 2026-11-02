<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import InvitationView from './components/InvitationView.vue'
import EditorPage from './pages/EditorPage.vue'
import AuthPage from './pages/AuthPage.vue'
import StylePage from './pages/StylePage.vue'
import { isAuthenticated } from './stores/auth'
import { hasChosenTheme } from './stores/theme'

const ROUTES = {
  '': 'register',
  '#/': 'register',
  '#/edit': 'edit',
  '#/register': 'register',
  '#/login': 'login',
  '#/styles': 'styles',
  '#/preview': 'preview',
}

// The event form was merged into the edit page; keep the old URL working.
const LEGACY_HASHES = { '#/event': '#/edit' }

function normalizeHash() {
  const target = LEGACY_HASHES[window.location.hash]
  if (target) window.history.replaceState(null, '', target)
}

function parseRoute() {
  return ROUTES[window.location.hash] || 'home'
}

function resolveInitialRoute() {
  normalizeHash()
  const next = parseRoute()
  if (!isAuthenticated.value && (next === 'home' || next === 'edit' || next === 'styles')) {
    window.location.hash = '#/register'
    return 'register'
  }
  if (isAuthenticated.value && next === 'home' && !hasChosenTheme.value) {
    window.location.hash = '#/styles'
    return 'styles'
  }
  if ((next === 'register' || next === 'login') && isAuthenticated.value) {
    return hasChosenTheme.value ? 'edit' : 'styles'
  }
  return next
}

const route = ref(resolveInitialRoute())

function syncRoute() {
  const hash = window.location.hash
  if (hash && !hash.startsWith('#/')) return

  normalizeHash()
  const next = parseRoute()

  if (!isAuthenticated.value && (next === 'home' || next === 'edit' || next === 'styles')) {
    window.location.hash = '#/register'
    return
  }

  if (isAuthenticated.value && next === 'home' && !hasChosenTheme.value) {
    window.location.hash = '#/styles'
    return
  }

  if ((next === 'register' || next === 'login') && isAuthenticated.value) {
    window.location.hash = hasChosenTheme.value ? '#/edit' : '#/styles'
    return
  }

  if (next === route.value) return
  route.value = next
  window.scrollTo({ top: 0, behavior: 'auto' })
}

onMounted(() => {
  window.addEventListener('hashchange', syncRoute)
  syncRoute()
})

onUnmounted(() => window.removeEventListener('hashchange', syncRoute))
</script>

<template>
  <AppNavbar :route="route" />

  <AuthPage v-if="route === 'register' || route === 'login'" :mode="route" />

  <StylePage v-else-if="route === 'styles'" />

  <EditorPage v-else-if="route === 'edit'" />

  <InvitationView v-else />
</template>
