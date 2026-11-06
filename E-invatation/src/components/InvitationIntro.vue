<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { invitation } from '../stores/invitation'
import PetalRain from './PetalRain.vue'

const emit = defineEmits(['open'])

const visible = ref(true)
const opening = ref(false)
const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let timer

function openInvitation() {
  if (opening.value) return
  opening.value = true
  document.body.style.overflow = ''
  timer = setTimeout(
    () => {
      visible.value = false
      emit('open')
    },
    reducedMotion ? 0 : 1250,
  )
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  clearTimeout(timer)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="intro"
      :class="{ opening }"
      role="dialog"
      aria-modal="true"
      aria-label="បើកការអញ្ជើញ"
    >
      <div class="panel panel-left">
        <span class="panel-pattern" aria-hidden="true"></span>
      </div>
      <div class="panel panel-right">
        <span class="panel-pattern" aria-hidden="true"></span>
      </div>
      <PetalRain />

      <div class="intro-inner" :class="{ opening }">
        <p class="kicker">{{ invitation.heroKicker }}</p>

        <div class="crest" aria-hidden="true">
          <span class="crest-ring">{{ invitation.groom.initial }}</span>
          <svg class="crest-knot" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3c2.6 2.9 4 5.3 4 7s-1.6 3.8-4 6.2c-2.4-2.4-4-4.5-4-6.2S9.4 5.9 12 3Z"
              fill="currentColor"
            />
            <circle cx="12" cy="18.6" r="1.4" fill="currentColor" opacity=".7" />
          </svg>
          <span class="crest-ring">{{ invitation.bride.initial }}</span>
        </div>

        <h1 class="names">
          <span>{{ invitation.groom.nameKh }}</span>
          <span class="and">និង</span>
          <span>{{ invitation.bride.nameKh }}</span>
        </h1>
        <p class="names-en">{{ invitation.groom.nameEn }} &amp; {{ invitation.bride.nameEn }}</p>

        <div class="divider" aria-hidden="true">
          <span></span>
          <i></i>
          <span></span>
        </div>

        <p class="date">{{ invitation.dateKh }}</p>

        <button class="open-btn" type="button" @click="openInvitation">
          <span class="seal" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7.5 12 13l8-5.5M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-9Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="btn-copy">
            <strong>{{ opening ? 'កំពុងបើក...' : 'បើកការអញ្ជើញ' }}</strong>
            <small>Open Invitation</small>
          </span>
        </button>
      </div>

      <p class="hint" :class="{ opening }">ចុចប៊ូតុងដើម្បីបើកការអញ្ជើញ</p>
    </div>
  </Teleport>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  overflow: hidden;
  background: #2a0811;
  transition: background 0.3s ease 0.7s;
}

.intro.opening {
  background: transparent;
  pointer-events: none;
}

.panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.4%;
  z-index: 0;
  background:
    radial-gradient(circle at 30% 20%, rgba(201, 162, 92, 0.18), transparent 55%),
    radial-gradient(circle at 70% 80%, rgba(138, 44, 62, 0.5), transparent 60%),
    linear-gradient(160deg, #3d0f1a, #2a0811 55%, #1c0510);
  transition: transform 1.15s cubic-bezier(0.77, 0, 0.18, 1);
  will-change: transform;
}

.panel-left {
  left: 0;
  border-right: 1px solid rgba(220, 185, 122, 0.35);
  box-shadow: 20px 0 60px -40px rgba(0, 0, 0, 0.9);
}

.panel-right {
  right: 0;
  border-left: 1px solid rgba(220, 185, 122, 0.35);
  box-shadow: -20px 0 60px -40px rgba(0, 0, 0, 0.9);
}

.panel-pattern {
  position: absolute;
  inset: 14px;
  border: 1px solid rgba(239, 217, 174, 0.16);
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.025) 0 1px, transparent 1px 12px),
    radial-gradient(circle at 50% 50%, rgba(239, 217, 174, 0.06), transparent 60%);
}

.intro.opening .panel-left {
  transform: translateX(-101%);
}

.intro.opening .panel-right {
  transform: translateX(101%);
}

.intro-inner {
  position: relative;
  z-index: 3;
  display: grid;
  justify-items: center;
  width: min(560px, 100%);
  padding: clamp(1.6rem, 5vw, 2.8rem) clamp(1.2rem, 5vw, 2.6rem);
  border: 1px solid rgba(220, 185, 122, 0.4);
  background: rgba(48, 10, 20, 0.32);
  backdrop-filter: blur(4px);
  text-align: center;
  color: var(--ivory);
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.intro-inner::before {
  content: '';
  position: absolute;
  inset: 9px;
  border: 1px solid rgba(239, 217, 174, 0.18);
  pointer-events: none;
}

.intro-inner.opening {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}

.kicker {
  font-size: clamp(0.74rem, 1.8vw, 0.84rem);
  letter-spacing: 0.08em;
  color: var(--gold-300);
  opacity: 0.9;
}

.crest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 1rem;
}

.crest-ring {
  display: grid;
  place-items: center;
  width: clamp(42px, 9vw, 50px);
  height: clamp(42px, 9vw, 50px);
  border: 1px solid rgba(239, 217, 174, 0.5);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  color: var(--gold-300);
  font-family: var(--font-display);
  font-size: clamp(0.95rem, 2.6vw, 1.15rem);
  box-shadow: inset 0 0 0 3px rgba(239, 217, 174, 0.07);
}

.crest-knot {
  width: 17px;
  color: var(--gold-400);
  opacity: 0.85;
}

.names {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.05rem 0.8rem;
  margin-top: 1rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.6rem, 5.6vw, 2.6rem);
  line-height: 1.7;
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.names span {
  background: linear-gradient(180deg, #f6e8c9, #d9b779 55%, #b8862f);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.names .and {
  font-family: var(--font-body);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  color: rgba(239, 217, 174, 0.75);
  -webkit-text-fill-color: rgba(239, 217, 174, 0.75);
}

.names-en {
  margin-top: 0.3rem;
  font-family: var(--font-serif);
  font-size: clamp(0.58rem, 1.4vw, 0.72rem);
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  text-transform: uppercase;
  color: rgba(239, 217, 174, 0.65);
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  width: min(220px, 70%);
  margin: 1.1rem auto 0;
  color: var(--gold-500);
}

.divider span {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 162, 92, 0.65), transparent);
}

.divider i {
  width: 7px;
  height: 7px;
  border: 1px solid rgba(220, 185, 122, 0.8);
  transform: rotate(45deg);
}

.date {
  margin-top: 0.9rem;
  font-size: clamp(0.86rem, 2.2vw, 1rem);
  color: rgba(246, 232, 201, 0.85);
}

.open-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.85rem;
  margin-top: 1.6rem;
  padding: 0.5rem 1.4rem 0.5rem 0.5rem;
  border: 1px solid rgba(239, 217, 174, 0.5);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--ivory);
  font-family: inherit;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
}

.open-btn:hover {
  background: rgba(239, 217, 174, 0.16);
  border-color: rgba(239, 217, 174, 0.8);
  transform: translateY(-2px);
}

.open-btn:focus-visible {
  outline: 2px solid var(--gold-300);
  outline-offset: 3px;
}

.seal {
  position: relative;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f0d8a4, #c9a25c 55%, #8a611f);
  color: #3a0d16;
  box-shadow:
    0 6px 16px -6px rgba(0, 0, 0, 0.7),
    inset 0 0 0 2px rgba(255, 248, 230, 0.25);
}

.seal::after {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(58, 13, 22, 0.35);
  border-radius: 50%;
}

.seal::before {
  content: '';
  position: absolute;
  inset: -7px;
  border: 1px solid rgba(239, 217, 174, 0.55);
  border-radius: 50%;
  animation: seal-pulse 2.6s ease-out infinite;
}

.seal svg {
  width: 24px;
}

.btn-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
}

.btn-copy strong {
  font-size: 0.86rem;
  font-weight: 600;
}

.btn-copy small {
  font-size: 0.58rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(239, 217, 174, 0.7);
}

.hint {
  position: absolute;
  left: 50%;
  bottom: 1.4rem;
  z-index: 3;
  transform: translateX(-50%);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: rgba(239, 217, 174, 0.6);
  white-space: nowrap;
  transition: opacity 0.35s ease;
}

.hint.opening {
  opacity: 0;
}

@keyframes seal-pulse {
  0% {
    transform: scale(0.86);
    opacity: 0.85;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@media (max-width: 480px) {
  .intro-inner {
    padding-block: 2rem;
  }

  .open-btn {
    gap: 0.65rem;
    padding-right: 1.1rem;
  }

  .seal {
    width: 48px;
    height: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel,
  .intro-inner,
  .hint,
  .open-btn {
    transition: none !important;
  }

  .seal::before {
    animation: none;
  }
}
</style>
