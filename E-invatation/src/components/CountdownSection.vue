<script setup>
import { computed } from 'vue'
import { invitation } from '../stores/invitation'
import { useCountdown } from '../composables/useCountdown'
import { formatNumber, pickLocalized, t } from '../i18n'
import KhmerDivider from './KhmerDivider.vue'

const { remaining, isPast } = useCountdown(invitation.dateISO)

const units = computed(() => [
  { key: 'days', label: t('common.days'), pad: 0 },
  { key: 'hours', label: t('common.hours'), pad: 2 },
  { key: 'minutes', label: t('common.minutes'), pad: 2 },
  { key: 'seconds', label: t('common.seconds'), pad: 2 },
])
</script>

<template>
  <section class="countdown">
    <div class="glow glow-a" aria-hidden="true"></div>
    <div class="glow glow-b" aria-hidden="true"></div>

    <div class="container inner">
      <p class="eyebrow">{{ invitation.countdownEyebrow }}</p>
      <h2 class="kh-heading">{{ invitation.countdownTitle }}</h2>
      <KhmerDivider />
      <p class="date">{{ pickLocalized(invitation.dateKh, invitation.dateEn) }}</p>
      <p class="lunar">{{ invitation.lunarKh }}</p>

      <div v-if="!isPast" class="grid">
        <div v-for="unit in units" :key="unit.key" class="unit">
          <span class="number">{{ formatNumber(remaining[unit.key], unit.pad) }}</span>
          <span class="label">{{ unit.label }}</span>
        </div>
      </div>

      <p v-else class="done">{{ invitation.countdownPast }}</p>

      <div class="meta">
        <span>{{ pickLocalized(invitation.venue.name, invitation.venue.nameEn) }}</span>
        <span class="dot" aria-hidden="true">•</span>
        <span>{{ pickLocalized(invitation.dateKh, invitation.dateEn) }}</span>
      </div>

      <a class="btn btn-gold" href="#rsvp">{{ t('invitation.rsvp') }}</a>
    </div>
  </section>
</template>

<style scoped>
.countdown {
  position: relative;
  overflow: hidden;
  padding: clamp(3.5rem, 8vw, 6.5rem) 0;
  color: var(--ivory);
  background: var(--band-bg);
}

.countdown::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.015) 0 1px,
    transparent 1px 10px
  );
  pointer-events: none;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.glow-a {
  width: 380px;
  height: 380px;
  top: -140px;
  left: -100px;
  background: rgba(201, 162, 92, 0.16);
}

.glow-b {
  width: 420px;
  height: 420px;
  right: -120px;
  bottom: -180px;
  background: rgba(138, 44, 62, 0.3);
}

.inner {
  position: relative;
  z-index: 2;
  text-align: center;
}

.eyebrow {
  color: var(--gold-300);
}

.kh-heading {
  color: var(--gold-200);
  margin-top: 0.4rem;
}

.date {
  font-size: clamp(0.92rem, 2.2vw, 1.05rem);
  font-weight: 500;
}

.lunar {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: rgba(246, 232, 201, 0.6);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(0.5rem, 2vw, 1.1rem);
  max-width: 660px;
  margin: clamp(1.8rem, 4vw, 2.6rem) auto 0;
}

.unit {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: clamp(0.8rem, 2.4vw, 1.3rem) 0.4rem;
  border: 1px solid rgba(239, 217, 174, 0.28);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(4px);
}

.unit::before {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(239, 217, 174, 0.1);
  border-radius: 10px;
  pointer-events: none;
}

.number {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 4.5vw, 2.4rem);
  line-height: 1.3;
  color: var(--gold-300);
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  font-variant-numeric: tabular-nums;
}

.label {
  font-size: 0.72rem;
  color: rgba(246, 232, 201, 0.65);
  letter-spacing: 0.02em;
}

.done {
  margin-top: 1.8rem;
  font-size: 1rem;
  color: var(--gold-200);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 0.8rem;
  margin: 1.6rem auto 0;
  max-width: 620px;
  font-size: 0.76rem;
  color: rgba(246, 232, 201, 0.62);
}

.dot {
  color: var(--gold-500);
}

.inner .btn {
  margin-top: 1.7rem;
}

@media (max-width: 560px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 300px;
  }

  .unit {
    padding-block: 1.05rem;
  }
}
</style>
