<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AppNavbar from './components/AppNavbar.vue'
import InvitationView from './components/InvitationView.vue'
import EditorPage from './pages/EditorPage.vue'
import AuthPage from './pages/AuthPage.vue'
import StylePage from './pages/StylePage.vue'
import EventFormPage from './pages/EventFormPage.vue'
import { isAuthenticated } from './stores/auth'
import { hasChosenTheme } from './stores/theme'

const ROUTES = {
  '': 'register',
  '#/': 'register',
  '#/edit': 'edit',
  '#/register': 'register',
  '#/login': 'login',
  '#/styles': 'styles',
  '#/event': 'event',
  '#/preview': 'preview',
}

function parseRoute() {
  return ROUTES[window.location.hash] || 'home'
}

function resolveInitialRoute() {
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

  <EventFormPage v-else-if="route === 'event'" />

  <InvitationView v-else />
</template>
