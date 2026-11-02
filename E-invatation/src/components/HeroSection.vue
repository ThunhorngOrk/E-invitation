<script setup>
import { ref } from 'vue'
import { invitation } from '../stores/invitation'
import KhmerDivider from './KhmerDivider.vue'
import CornerOrnament from './CornerOrnament.vue'
import PetalRain from './PetalRain.vue'

const copied = ref(false)

function openInvitation() {
  document.getElementById('invitation')?.scrollIntoView({ behavior: 'smooth' })
}

async function share() {
  const data = {
    title: document.title,
    text: `${invitation.groom.nameKh} និង ${invitation.bride.nameKh}`,
    url: window.location.href,
  }

  if (navigator.share) {
    try {
      await navigator.share(data)
      return
    } catch {
      return
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2400)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <section id="home" class="hero">
    <div class="glow glow-a" aria-hidden="true"></div>
    <div class="glow glow-b" aria-hidden="true"></div>
    <PetalRain />

    <div
      v-if="invitation.heroImage"
      class="hero-photo"
      :style="{ backgroundImage: `url(${invitation.heroImage})` }"
      aria-hidden="true"
    ></div>

    <div class="frame">
      <CornerOrnament class="corner tl" />
      <CornerOrnament class="corner tr" />
      <CornerOrnament class="corner br" />
      <CornerOrnament class="corner bl" />

      <div class="inner">
        <p class="kicker">{{ invitation.heroKicker }}</p>

        <div class="monogram" aria-hidden="true">
          <span class="ring">{{ invitation.groom.initial }}</span>
          <svg class="knot" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3c2.6 2.9 4 5.3 4 7s-1.6 3.8-4 6.2c-2.4-2.4-4-4.5-4-6.2S9.4 5.9 12 3Z"
              fill="currentColor"
            />
            <circle cx="12" cy="18.6" r="1.4" fill="currentColor" opacity=".7" />
          </svg>
          <span class="ring">{{ invitation.bride.initial }}</span>
        </div>

        <h1 class="names">
          <span class="name text-gold">{{ invitation.groom.nameKh }}</span>
          <span class="and">និង</span>
          <span class="name text-gold">{{ invitation.bride.nameKh }}</span>
        </h1>

        <p class="names-en">{{ invitation.groom.nameEn }} &amp; {{ invitation.bride.nameEn }}</p>

        <KhmerDivider />

        <p class="date">{{ invitation.dateKh }}</p>
        <p class="lunar">{{ invitation.lunarKh }}</p>

        <div class="actions">
          <button class="btn btn-gold" type="button" @click="openInvitation">
            បើកការអញ្ជើញ
            <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 5v14m0 0 5-5m-5 5-5-5"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button class="btn btn-ghost" type="button" @click="share">
            <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8.7 10.6 15.4 7m-6.7 6.4 6.7 3.6M6 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm12-5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Zm0 12a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            ចែករំលែក
          </button>
        </div>

        <p class="venue-line">{{ invitation.venue.name }}</p>

        <a class="scroll-cue" href="#invitation" aria-label="អូសចុះក្រោម">
          <span class="line"></span>
          អូសចុះក្រោម
        </a>
      </div>
    </div>

    <Transition name="toast">
      <p v-if="copied" class="toast" role="status">បានចម្លងតំណភ្ជាប់</p>
    </Transition>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: clamp(1.1rem, 4vw, 3rem);
  overflow: hidden;
  color: var(--ivory);
  background: var(--hero-bg);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.018) 0 1px,
    transparent 1px 9px
  );
  pointer-events: none;
}

.hero-photo {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.38;
}

.hero-photo::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--hero-shade);
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.glow-a {
  width: 420px;
  height: 420px;
  top: -120px;
  left: -80px;
  background: rgba(201, 162, 92, 0.22);
}

.glow-b {
  width: 500px;
  height: 500px;
  right: -140px;
  bottom: -160px;
  background: rgba(138, 44, 62, 0.35);
}

.frame {
  position: relative;
  z-index: 2;
  width: min(860px, 100%);
  padding: clamp(2.1rem, 6vw, 4.4rem) clamp(1.2rem, 5vw, 3.8rem);
  border: 1px solid rgba(220, 185, 122, 0.55);
  background: rgba(48, 10, 20, 0.28);
  backdrop-filter: blur(6px);
  box-shadow: inset 0 0 90px rgba(0, 0, 0, 0.28);
}

.frame::before {
  content: '';
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(239, 217, 174, 0.22);
  pointer-events: none;
}

.corner {
  position: absolute;
  z-index: 3;
}

.tl {
  top: 11px;
  left: 11px;
}

.tr {
  top: 11px;
  right: 11px;
  transform: rotate(90deg);
}

.br {
  right: 11px;
  bottom: 11px;
  transform: rotate(180deg);
}

.bl {
  bottom: 11px;
  left: 11px;
  transform: rotate(270deg);
}

.inner {
  position: relative;
  z-index: 2;
  text-align: center;
}

.inner > * {
  animation: rise 0.9s cubic-bezier(0.22, 0.75, 0.3, 1) both;
}

.inner > :nth-child(1) {
  animation-delay: 0.08s;
}

.inner > :nth-child(2) {
  animation-delay: 0.18s;
}

.inner > :nth-child(3) {
  animation-delay: 0.3s;
}

.inner > :nth-child(4) {
  animation-delay: 0.4s;
}

.inner > :nth-child(5) {
  animation-delay: 0.48s;
}

.inner > :nth-child(6) {
  animation-delay: 0.56s;
}

.inner > :nth-child(7) {
  animation-delay: 0.64s;
}

.inner > :nth-child(8) {
  animation-delay: 0.72s;
}

.inner > :nth-child(9) {
  animation-delay: 0.8s;
}

.inner > :nth-child(10) {
  animation-delay: 0.88s;
}

.kicker {
  font-size: clamp(0.76rem, 1.8vw, 0.86rem);
  letter-spacing: 0.06em;
  color: var(--gold-300);
  opacity: 0.9;
}

.monogram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 1.15rem;
}

.ring {
  display: grid;
  place-items: center;
  width: clamp(42px, 8vw, 50px);
  height: clamp(42px, 8vw, 50px);
  border: 1px solid rgba(239, 217, 174, 0.55);
  border-radius: 50%;
  color: var(--gold-300);
  font-family: var(--font-display);
  font-size: clamp(0.95rem, 2.4vw, 1.15rem);
  background: rgba(255, 255, 255, 0.035);
  box-shadow: inset 0 0 0 3px rgba(239, 217, 174, 0.08);
}

.knot {
  width: 17px;
  color: var(--gold-400);
  opacity: 0.85;
}

.names {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.1rem 1rem;
  margin-top: 1rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.85rem, 6.6vw, 3.45rem);
  line-height: 1.7;
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.name {
  display: inline-block;
}

.and {
  font-family: var(--font-body);
  font-size: clamp(0.85rem, 1.9vw, 1.05rem);
  color: var(--gold-300);
  opacity: 0.8;
  letter-spacing: 0.02em;
}

.names-en {
  margin-top: 0.35rem;
  font-family: var(--font-serif);
  font-size: clamp(0.62rem, 1.5vw, 0.76rem);
  letter-spacing: 0.34em;
  text-indent: 0.34em;
  text-transform: uppercase;
  color: rgba(239, 217, 174, 0.7);
}

.date {
  font-size: clamp(0.95rem, 2.3vw, 1.1rem);
  font-weight: 500;
  color: var(--ivory);
}

.lunar {
  margin-top: 0.2rem;
  font-size: clamp(0.74rem, 1.8vw, 0.84rem);
  color: rgba(246, 232, 201, 0.62);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
  margin-top: clamp(1.4rem, 4vw, 2rem);
}

.venue-line {
  margin-top: 1.25rem;
  font-size: clamp(0.72rem, 1.7vw, 0.8rem);
  color: rgba(239, 217, 174, 0.62);
}

.scroll-cue {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  margin-top: clamp(1.4rem, 4vw, 2.3rem);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  color: rgba(239, 217, 174, 0.65);
  text-decoration: none;
}

.line {
  width: 1px;
  height: 34px;
  background: linear-gradient(180deg, var(--gold-400), transparent);
  animation: cue 2.2s ease-in-out infinite;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 1.6rem;
  z-index: 5;
  transform: translateX(-50%);
  padding: 0.55rem 1.2rem;
  border: 1px solid rgba(239, 217, 174, 0.4);
  border-radius: 999px;
  background: rgba(53, 11, 21, 0.92);
  color: var(--gold-300);
  font-size: 0.8rem;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes cue {
  0%,
  100% {
    transform: scaleY(0.55);
    opacity: 0.4;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .frame {
    padding-block: 2.4rem;
  }

  .names {
    gap: 0 0.6rem;
  }

  .ring {
    width: 38px;
    height: 38px;
  }
}
</style>
