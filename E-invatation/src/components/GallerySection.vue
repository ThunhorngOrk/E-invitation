<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { invitation } from '../stores/invitation'
import { formatNumber, t } from '../i18n'

const activeIndex = ref(-1)
const activeItem = computed(() => invitation.gallery[activeIndex.value] ?? null)

function open(index) {
  activeIndex.value = index
}

function close() {
  activeIndex.value = -1
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(activeItem, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">{{ invitation.galleryEyebrow }}</p>
        <h2 class="kh-heading">{{ invitation.galleryTitle }}</h2>
        <p class="section-sub">{{ invitation.gallerySub }}</p>
      </div>

      <div class="gallery">
        <button
          v-for="(item, index) in invitation.gallery"
          :key="item.caption"
          type="button"
          class="tile"
          :class="`tone-${item.tone}`"
          @click="open(index)"
        >
          <img v-if="item.src" class="tile-img" :src="item.src" :alt="item.caption" />
          <span class="pattern" aria-hidden="true"></span>
          <svg v-if="!item.src" class="lotus" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path
              d="M32 10c5 5.6 7.8 10.1 7.8 13.7 0 3.6-2.9 7.5-7.8 12.1-4.9-4.6-7.8-8.5-7.8-12.1C24.2 20.1 27 15.6 32 10Z"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <path
              d="M24.2 23.7c-4.1-1-7-3.6-8.4-7.4 4.3-.5 7.5 1.4 8.4 7.4Zm15.6 0c4.1-1 7-3.6 8.4-7.4-4.3-.5-7.5 1.4-8.4 7.4Z"
              fill="currentColor"
              opacity=".4"
            />
            <circle cx="32" cy="44" r="1.8" fill="currentColor" opacity=".7" />
          </svg>
          <span class="zoom" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.4" />
              <path d="m15.6 15.6 4 4M11 8.4v5.2M8.4 11h5.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </span>
          <span class="tile-caption">
            <span class="tile-num">{{ formatNumber(index + 1, 2) }}</span>
            <span class="tile-text">{{ item.caption }}</span>
          </span>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="lightbox">
        <div v-if="activeItem" class="lightbox" @click.self="close">
          <button type="button" class="lb-close" :aria-label="t('invitation.close')" @click="close">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
          <div
            class="lb-frame"
            :class="[`tone-${activeItem.tone}`, { 'has-photo': activeItem.src }]"
          >
            <img
              v-if="activeItem.src"
              class="lb-img"
              :src="activeItem.src"
              :alt="activeItem.caption"
            />
            <template v-else>
              <span class="pattern" aria-hidden="true"></span>
              <svg class="lb-lotus" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <path
                  d="M32 8c6 6.8 9.4 12.2 9.4 16.5 0 4.4-3.5 9.1-9.4 14.7-5.9-5.6-9.4-10.3-9.4-14.7C22.6 20.2 26 14.8 32 8Z"
                  stroke="currentColor"
                  stroke-width="1.2"
                />
                <circle cx="32" cy="48" r="2" fill="currentColor" opacity=".7" />
                <path d="M20 55h24" stroke="currentColor" stroke-width="1" opacity=".45" />
              </svg>
            </template>
            <span class="lb-overlay" aria-hidden="true"></span>
            <p class="lb-caption">{{ activeItem.caption }}</p>
            <p class="lb-note">{{ t('invitation.galleryNote') }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: clamp(84px, 12vw, 150px);
  gap: clamp(0.55rem, 1.6vw, 1rem);
}

.tile {
  position: relative;
  padding: 0;
  border: 1px solid rgba(255, 253, 248, 0.25);
  border-radius: 16px;
  overflow: hidden;
  color: var(--gold-200);
  cursor: pointer;
  isolation: isolate;
  transition: transform 0.45s cubic-bezier(0.22, 0.75, 0.3, 1), box-shadow 0.45s ease;
}

.tile:nth-child(1) {
  grid-column: span 3;
  grid-row: span 2;
}

.tile:nth-child(2),
.tile:nth-child(3) {
  grid-column: span 3;
}

.tile:nth-child(4) {
  grid-column: span 2;
  grid-row: span 2;
}

.tile:nth-child(5),
.tile:nth-child(6) {
  grid-column: span 4;
}

.tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 50px -30px rgba(53, 11, 21, 0.75);
}

.tile-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.22, 0.75, 0.3, 1);
}

.tile:hover .tile-img {
  transform: scale(1.05);
}

.tile::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, transparent 35%, rgba(30, 6, 12, 0.72) 100%);
}

.tone-wine {
  background: linear-gradient(150deg, #a4515f, #6d1f2e 52%, #3d0f1a);
}

.tone-gold {
  background: linear-gradient(150deg, #e8cf9c, #c9a25c 50%, #96712f);
}

.tone-deep {
  background: linear-gradient(150deg, #6d1f2e, #4a1220 55%, #2a0811);
}

.tone-sand {
  background: linear-gradient(150deg, #f0dcb2, #d9b779 50%, #a9823f);
}

.tone-rose {
  background: linear-gradient(150deg, #d79aa3, #b0606e 50%, #7a2b3b);
}

.tone-plum {
  background: linear-gradient(150deg, #8a4a56, #5a1a27 55%, #300a14);
}

.pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.24), transparent 48%),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 13px);
  mix-blend-mode: soft-light;
}

.lotus {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(48px, 8vw, 82px);
  transform: translate(-50%, -56%);
  color: rgba(255, 253, 248, 0.55);
  opacity: 0.75;
}

.tile-caption {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 0.9rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  text-align: left;
}

.tile-num {
  font-family: var(--font-serif);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  color: var(--gold-300);
  opacity: 0.85;
}

.tile-text {
  font-size: 0.78rem;
  font-weight: 500;
  color: #fff8ea;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.zoom {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 2;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(255, 248, 234, 0.4);
  background: rgba(30, 6, 12, 0.25);
  color: #fff8ea;
  backdrop-filter: blur(4px);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.zoom svg {
  width: 15px;
}

.tile:hover .zoom {
  opacity: 1;
  transform: none;
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(24, 5, 10, 0.78);
  backdrop-filter: blur(8px);
}

.lb-frame {
  position: relative;
  width: min(360px, 100%);
  aspect-ratio: 3 / 3.9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: 1px solid rgba(239, 217, 174, 0.5);
  border-radius: 18px;
  overflow: hidden;
  color: var(--gold-200);
  box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.8);
}

.lb-frame::before {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(255, 248, 234, 0.22);
  border-radius: 12px;
  pointer-events: none;
}

.lb-img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lb-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, transparent 35%, rgba(24, 5, 10, 0.82) 100%);
  pointer-events: none;
}

.lb-lotus {
  width: 90px;
  opacity: 0.75;
}

.lb-caption {
  position: relative;
  z-index: 2;
  margin-top: 0.4rem;
  font-family: var(--font-display);
  font-size: 1.05rem;
  text-align: center;
  padding-inline: 1.5rem;
}

.lb-note {
  position: relative;
  z-index: 2;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  color: rgba(255, 248, 234, 0.65);
}

.has-photo {
  justify-content: flex-end;
  padding-bottom: 1.6rem;
}

.lb-close {
  position: absolute;
  top: clamp(1rem, 4vw, 2rem);
  right: clamp(1rem, 4vw, 2rem);
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgba(239, 217, 174, 0.45);
  background: rgba(53, 11, 21, 0.7);
  color: var(--gold-200);
}

.lb-close svg {
  width: 18px;
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-enter-active .lb-frame,
.lightbox-leave-active .lb-frame {
  transition: transform 0.35s cubic-bezier(0.22, 0.75, 0.3, 1), opacity 0.3s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-from .lb-frame,
.lightbox-leave-to .lb-frame {
  transform: scale(0.94) translateY(12px);
  opacity: 0;
}

@media (max-width: 640px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 40vw;
  }

  .tile:nth-child(1) {
    grid-column: span 2;
    grid-row: span 2;
  }

  .tile:nth-child(2),
  .tile:nth-child(3),
  .tile:nth-child(4),
  .tile:nth-child(5),
  .tile:nth-child(6) {
    grid-column: span 1;
    grid-row: span 1;
  }

  .zoom {
    opacity: 1;
    transform: none;
  }
}
</style>
