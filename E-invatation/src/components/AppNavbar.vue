<script setup>
import { ref, watch } from 'vue'
import Icon from './event/Icon.vue'
import { currentUser, isAuthenticated, logout } from '../stores/auth'
import { isDark, toggleMode } from '../stores/mode'
import { t, toggleLocale } from '../i18n'

const props = defineProps({
  route: { type: String, default: 'home' },
})

const open = ref(false)

watch(
  () => props.route,
  () => {
    open.value = false
  },
)

function close() {
  open.value = false
}

function handleLogout() {
  if (!window.confirm(t('nav.logoutConfirm'))) return
  logout()
  close()
  window.location.hash = '#/register'
}
</script>

<template>
  <header class="app-nav">
    <div class="nav-inner">
      <a class="brand" href="#/" @click="close">
        <img class="brand-logo" src="/favicon.svg" alt="E-invitation" width="40" height="40" />
        <span class="brand-copy">
          <strong>E-invitation</strong>
          <small>{{ t('nav.tagline') }}</small>
        </span>
      </a>

      <div class="nav-actions">
        <span v-if="currentUser" class="user-chip">
          <span class="user-avatar">{{ currentUser.name.slice(0, 1) }}</span>
          <span class="user-name">{{ currentUser.name }}</span>
        </span>

        <button
          class="mode-toggle"
          type="button"
          :aria-label="isDark ? t('nav.lightMode') : t('nav.darkMode')"
          :title="isDark ? t('nav.lightMode') : t('nav.darkMode')"
          @click="toggleMode"
        >
          <Icon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>

        <button
          class="lang-toggle"
          type="button"
          :aria-label="t('nav.switchLanguage')"
          :title="t('nav.switchLanguage')"
          @click="toggleLocale"
        >
          {{ t('nav.languageShort') }}
        </button>

        <button
          class="menu-toggle"
          type="button"
          :aria-expanded="open"
          :aria-label="t('nav.openMenu')"
          @click="open = !open"
        >
          <Icon :name="open ? 'x' : 'menu'" :size="20" />
        </button>
      </div>

      <nav class="nav-links" :class="{ open }">
        <template v-if="isAuthenticated">
          <a
            class="nav-link"
            :class="{ active: route === 'edit' }"
            href="#/edit"
            @click="close"
          >
            <Icon name="file-text" :size="16" />
            <span>{{ t('nav.edit') }}</span>
          </a>
          <a
            class="nav-link"
            :class="{ active: route === 'styles' }"
            href="#/styles"
            @click="close"
          >
            <Icon name="brush" :size="16" />
            <span>{{ t('nav.styles') }}</span>
          </a>
          <a
            class="nav-link"
            :class="{ active: route === 'preview' }"
            href="#/preview"
            @click="close"
          >
            <Icon name="globe" :size="16" />
            <span>{{ t('nav.view') }}</span>
          </a>
          <button class="nav-link" type="button" @click="handleLogout">
            <Icon name="logout" :size="16" />
            <span>{{ t('nav.logout') }}</span>
          </button>
        </template>

        <template v-else>
          <a
            class="nav-link"
            :class="{ active: route === 'preview' }"
            href="#/preview"
            @click="close"
          >
            <Icon name="globe" :size="16" />
            <span>{{ t('nav.viewDemo') }}</span>
          </a>
          <a
            class="nav-link"
            :class="{ active: route === 'login' }"
            href="#/login"
            @click="close"
          >
            <Icon name="user" :size="16" />
            <span>{{ t('nav.login') }}</span>
          </a>
          <a
            class="nav-link nav-register"
            :class="{ active: route === 'register' }"
            href="#/register"
            @click="close"
          >
            <Icon name="sparkles" :size="16" />
            <span>{{ t('nav.register') }}</span>
          </a>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid color-mix(in srgb, var(--maroon-700) 12%, transparent);
  background: color-mix(in srgb, var(--ivory) 94%, transparent);
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 30px -24px color-mix(in srgb, var(--maroon-800) 50%, transparent);
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: min(1180px, 100% - 2rem);
  margin-inline: auto;
  padding: 0.6rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  flex: none;
  text-decoration: none;
}

.brand-logo {
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 12px;
  box-shadow: 0 10px 20px -12px rgba(74, 18, 32, 0.7);
}

.brand-copy {
  display: grid;
  gap: 0.02rem;
  line-height: 1.25;
}

.brand-copy strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--maroon-800);
}

.brand-copy small {
  font-size: 0.62rem;
  color: var(--muted);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 190px;
  padding: 0.3rem 0.65rem 0.3rem 0.35rem;
  border: 1px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 999px;
  background: #fff;
}

.user-avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-200), var(--gold-300));
  color: var(--maroon-800);
  font-size: 0.72rem;
  font-weight: 700;
}

.user-name {
  overflow: hidden;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mode-toggle,
.lang-toggle,
.menu-toggle {
  place-items: center;
  height: 40px;
  border: 1.5px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 12px;
  background: #fff;
  color: var(--maroon-800);
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.mode-toggle {
  display: grid;
  width: 40px;
}

.lang-toggle {
  display: grid;
  min-width: 44px;
  padding: 0 0.55rem;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.mode-toggle:hover,
.lang-toggle:hover {
  background: var(--gold-200);
  border-color: var(--gold-400);
}

.menu-toggle {
  display: none;
  width: 40px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.4rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.nav-link:hover {
  background: var(--gold-200);
  color: var(--maroon-800);
}

.nav-link.active {
  border-color: color-mix(in srgb, var(--gold-500) 35%, #fff);
  background: #fff;
  color: var(--maroon-800);
}

.nav-create,
.nav-register {
  border-color: transparent;
  background: linear-gradient(135deg, var(--maroon-700), var(--maroon-800));
  color: #fff;
  box-shadow: 0 10px 20px -14px color-mix(in srgb, var(--maroon-800) 90%, transparent);
}

.nav-create:hover,
.nav-register:hover {
  background: linear-gradient(135deg, var(--maroon-600), var(--maroon-800));
  color: #fff;
}

.nav-create.active,
.nav-register.active {
  border-color: transparent;
  background: linear-gradient(135deg, var(--maroon-800), var(--maroon-900));
  color: #fff;
}

@media (max-width: 900px) {
  .menu-toggle {
    display: grid;
  }

  .nav-links {
    position: absolute;
    top: calc(100% + 1px);
    left: 0;
    right: 0;
    display: grid;
    gap: 0.3rem;
    margin: 0;
    padding: 0.7rem 1rem 1rem;
    border-bottom: 1px solid color-mix(in srgb, var(--maroon-700) 12%, transparent);
    background: color-mix(in srgb, var(--ivory) 98%, transparent);
    box-shadow: 0 24px 40px -30px color-mix(in srgb, var(--maroon-800) 55%, transparent);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  }

  .nav-links.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-link {
    justify-content: flex-start;
    padding: 0.7rem 0.8rem;
  }

  .user-name {
    display: none;
  }

  .user-chip {
    padding-right: 0.35rem;
  }
}

@media (max-width: 420px) {
  .brand-copy small {
    display: none;
  }
}

@media (max-width: 370px) {
  .brand-copy {
    display: none;
  }
}
</style>
