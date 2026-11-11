<script setup>
import { computed, ref } from 'vue'
import { themes } from '../data/themes'
import { activeThemeId, applyTheme } from '../stores/theme'
import { currentUser } from '../stores/auth'
import { invitation } from '../stores/invitation'
import { pickLocalized, t } from '../i18n'

const selected = ref(activeThemeId.value || 'classic')

const selectedTheme = computed(
  () => themes.find((theme) => theme.id === selected.value) || themes[0],
)

function select(id) {
  selected.value = id
  applyTheme(id)
}

function continueToEditor() {
  applyTheme(selected.value)
  window.location.hash = '#/edit'
}
</script>

<template>
  <div class="styles-page">
    <header class="page-head">
      <div class="head-inner">
        <div>
          <p class="brand-eyebrow">E-invitation</p>
          <h1>{{ t('styles.title') }}</h1>
          <p class="brand-sub">
            {{ t('styles.sub', { name: currentUser?.name || t('common.user') }) }}
          </p>
        </div>
      </div>
    </header>

    <main class="container body">
      <div class="theme-grid">
        <button
          v-for="theme in themes"
          :key="theme.id"
          type="button"
          class="theme-card"
          :class="{ selected: selected === theme.id }"
          :aria-pressed="selected === theme.id"
          @click="select(theme.id)"
        >
          <div class="preview" :data-theme="theme.id">
            <div class="preview-hero">
              <span class="preview-kicker">{{ invitation.heroKicker }}</span>
              <span class="preview-names">
                {{ pickLocalized(invitation.groom.nameKh, invitation.groom.nameEn) }}
                <i>{{ t('common.and') }}</i>
                {{ pickLocalized(invitation.bride.nameKh, invitation.bride.nameEn) }}
              </span>
              <span class="preview-line" aria-hidden="true"></span>
              <span class="preview-date">{{ pickLocalized(invitation.dateKh, invitation.dateEn) }}</span>
            </div>
            <div class="preview-body">
              <span class="preview-dot" aria-hidden="true"></span>
              <span class="preview-label">{{ t('styles.previewLabel') }}</span>
              <span class="preview-bar" aria-hidden="true"></span>
            </div>
            <span class="check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>

          <div class="card-foot">
            <div>
              <h2>{{ pickLocalized(theme.name, theme.nameEn) }}</h2>
              <p class="card-en">{{ theme.nameEn }}</p>
            </div>
            <div class="swatches" aria-hidden="true">
              <span
                v-for="color in theme.swatches"
                :key="color"
                class="swatch"
                :style="{ background: color }"
              ></span>
            </div>
          </div>
          <p class="card-desc">{{ pickLocalized(theme.description, theme.descriptionEn) }}</p>
        </button>
      </div>

      <div class="selection-bar">
        <div class="selection-info">
          <span>{{ t('styles.selected') }}</span>
          <strong>{{ pickLocalized(selectedTheme.name, selectedTheme.nameEn) }}</strong>
        </div>
        <button class="btn btn-gold" type="button" @click="continueToEditor">
          {{ t('styles.continue') }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.styles-page {
  min-height: 100vh;
  padding-bottom: 3rem;
}

.page-head {
  padding: clamp(1.8rem, 4vw, 2.8rem) 0 clamp(2rem, 4vw, 3rem);
  color: var(--ivory);
  background: var(--band-bg);
}

.head-inner {
  width: min(1120px, 100% - 2.5rem);
  margin-inline: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.4rem;
}

.brand-eyebrow {
  font-family: var(--font-serif);
  font-size: 0.64rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold-400);
}

.page-head h1 {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.4rem, 3.4vw, 2rem);
  line-height: 1.9;
  color: var(--gold-200);
}

.brand-sub {
  max-width: 600px;
  margin-top: 0.45rem;
  font-size: 0.78rem;
  line-height: 1.95;
  color: color-mix(in srgb, var(--gold-200) 62%, transparent);
}

.head-side {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.55rem 0.95rem;
  font-size: 0.74rem;
}

.body {
  margin-top: clamp(1.6rem, 4vw, 2.6rem);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.1rem;
}

.theme-card {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--gold-500) 38%, transparent);
  border-radius: 18px;
  background: var(--surface);
  text-align: left;
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.theme-card:hover {
  transform: translateY(-4px);
  border-color: var(--gold-500);
  box-shadow: 0 26px 50px -34px rgba(0, 0, 0, 0.45);
}

.theme-card.selected {
  border-color: var(--gold-500);
  box-shadow: 0 0 0 2px var(--gold-500), 0 26px 50px -34px rgba(0, 0, 0, 0.45);
}

.preview {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: var(--ivory);
}

.preview-hero {
  display: grid;
  place-items: center;
  gap: 0.35rem;
  padding: 1.5rem 1rem 1.2rem;
  text-align: center;
  color: var(--ivory);
  background: var(--hero-bg);
}

.preview-kicker {
  font-size: 0.5rem;
  letter-spacing: 0.08em;
  color: var(--gold-300);
  opacity: 0.85;
}

.preview-names {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.2rem 0.35rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  line-height: 1.7;
  color: var(--gold-200);
}

.preview-names i {
  font-family: var(--font-body);
  font-size: 0.52rem;
  font-style: normal;
  color: var(--gold-300);
  opacity: 0.8;
}

.preview-line {
  width: 46px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-400), transparent);
}

.preview-date {
  font-size: 0.5rem;
  color: color-mix(in srgb, var(--gold-200) 78%, transparent);
}

.preview-body {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 0.8rem;
  background: var(--ivory);
}

.preview-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--gold-500);
}

.preview-label {
  font-size: 0.54rem;
  color: var(--maroon-800);
}

.preview-bar {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--gold-500) 30%, transparent);
}

.check {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--gold-gradient);
  color: var(--maroon-900);
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.check svg {
  width: 14px;
}

.theme-card.selected .check {
  opacity: 1;
  transform: none;
}

.card-foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.8rem;
  padding-inline: 0.2rem;
}

.card-foot h2 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--maroon-800);
}

.card-en {
  margin-top: 0.1rem;
  font-family: var(--font-serif);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
}

.swatches {
  display: flex;
  gap: 0.25rem;
}

.swatch {
  width: 15px;
  height: 15px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.card-desc {
  margin-top: 0.35rem;
  padding-inline: 0.2rem;
  font-size: 0.7rem;
  line-height: 1.85;
  color: var(--muted);
}

.selection-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.6rem;
  padding: 1rem 1.2rem;
  border: 1px solid color-mix(in srgb, var(--gold-500) 40%, transparent);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: 0 20px 40px -34px rgba(0, 0, 0, 0.35);
}

.selection-info span {
  display: block;
  font-size: 0.68rem;
  color: var(--muted);
}

.selection-info strong {
  display: block;
  margin-top: 0.1rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1rem;
  color: var(--maroon-800);
}

@media (max-width: 640px) {
  .head-inner,
  .body {
    width: min(1120px, 100% - 1.75rem);
  }

  .head-side {
    width: 100%;
  }

  .selection-bar .btn {
    width: 100%;
  }
}
</style>
