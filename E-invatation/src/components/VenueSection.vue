<script setup>
import { computed } from 'vue'
import { invitation } from '../stores/invitation'
import { formatTime, pickLocalized, t } from '../i18n'
import KhmerDivider from './KhmerDivider.vue'

const mapUrl = computed(
  () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venue.mapQuery)}`,
)
</script>

<template>
  <section class="section section-tint">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">{{ invitation.venueEyebrow }}</p>
        <h2 class="kh-heading">{{ invitation.venueTitle }}</h2>
        <p class="section-sub">{{ invitation.venueSub }}</p>
      </div>

      <div class="venue-grid">
        <div class="ornate-card venue-card">
          <h3>{{ pickLocalized(invitation.venue.name, invitation.venue.nameEn) }}</h3>
          <p class="en">{{ invitation.venue.nameEn }}</p>
          <div class="divider-wrap">
            <KhmerDivider />
          </div>

          <div class="venue-row">
            <span class="row-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="1.4" />
              </svg>
            </span>
            <div>
              <p class="label">{{ t('invitation.address') }}</p>
              <p class="value">{{ invitation.venue.address }}</p>
            </div>
          </div>

          <div class="venue-row">
            <span class="row-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="currentColor" stroke-width="1.4" />
                <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <p class="label">{{ t('invitation.eventDate') }}</p>
              <p class="value">{{ pickLocalized(invitation.dateKh, invitation.dateEn) }}</p>
            </div>
          </div>

          <div class="venue-row">
            <span class="row-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.4" />
                <path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </span>
            <div>
              <p class="label">{{ t('invitation.startTime') }}</p>
              <p class="value">{{ formatTime(invitation.eventTime) }}</p>
            </div>
          </div>

          <p class="note">{{ invitation.venue.note }}</p>

          <a class="btn btn-gold" :href="mapUrl" target="_blank" rel="noopener noreferrer">
            <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Zm0 0v14m6-12v14"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('invitation.openMap') }}
          </a>
        </div>

        <div class="map-card">
          <span class="map-badge">{{ invitation.mapBadge }}</span>
          <svg viewBox="0 0 520 400" preserveAspectRatio="xMidYMid slice" role="img" :aria-label="t('invitation.mapAria')">
            <rect width="520" height="400" fill="#f4ecdc" />

            <path
              d="M-40 0c70 55 80 120 40 175s-20 120 30 225h80c-55-115-45-180-5-245s25-115-45-155Z"
              fill="#d7e4dd"
              opacity=".9"
            />

            <g fill="#e8ddc5">
              <rect x="55" y="35" width="90" height="55" rx="8" />
              <rect x="185" y="30" width="120" height="62" rx="8" />
              <rect x="385" y="35" width="105" height="60" rx="8" />
            </g>
            <rect x="185" y="130" width="120" height="90" rx="10" fill="#dfe7d4" />
            <g fill="#e9dfc8">
              <rect x="55" y="150" width="90" height="75" rx="8" />
              <rect x="385" y="140" width="105" height="85" rx="8" />
              <rect x="55" y="290" width="90" height="80" rx="8" />
              <rect x="385" y="285" width="105" height="85" rx="8" />
              <rect x="185" y="300" width="120" height="70" rx="8" />
            </g>

            <g stroke="#fffdf8" stroke-width="20" stroke-linecap="round">
              <path d="M-10 118h540M-10 272h540" />
              <path d="M166 10v390M362 10v390" />
            </g>
            <g stroke="#e7d6b3" stroke-width="1.5" stroke-dasharray="9 12" opacity=".9">
              <path d="M-10 118h540M-10 272h540" />
              <path d="M166 10v390M362 10v390" />
            </g>

            <circle class="pulse" cx="300" cy="186" r="30" fill="rgba(201, 162, 92, 0.3)" />
            <path
              d="M300 146c-13.2 0-23 9.8-23 23 0 16.3 23 36 23 36s23-19.7 23-36c0-13.2-9.8-23-23-23Z"
              fill="#6d1f2e"
              stroke="#dcb97a"
              stroke-width="1.6"
            />
            <circle cx="300" cy="169" r="8" fill="#efd9ae" />

            <g transform="translate(222 244)">
              <rect width="156" height="36" rx="18" fill="#fffdf8" stroke="rgba(201, 162, 92, 0.55)" />
              <text
                x="78"
                y="23.5"
                text-anchor="middle"
                font-family="Kantumruy Pro, sans-serif"
                font-size="13"
                fill="#4a1220"
              >
                {{ t('invitation.mapPin') }}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.venue-grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: clamp(1.2rem, 3vw, 2rem);
  align-items: stretch;
}

.venue-card h3 {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.05rem, 2.5vw, 1.25rem);
  line-height: 1.9;
  color: var(--maroon-800);
}

.venue-card .en {
  margin-top: 0.3rem;
  font-family: var(--font-serif);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.divider-wrap {
  margin: 0.85rem 0 1.1rem;
}

.divider-wrap :deep(.divider) {
  margin-inline: 0;
  width: 170px;
}

.venue-row {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  margin-top: 0.95rem;
}

.row-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(201, 162, 92, 0.4);
  border-radius: 50%;
  background: #fffaf0;
  color: var(--gold-600);
}

.row-icon svg {
  width: 17px;
  height: 17px;
}

.label {
  font-size: 0.68rem;
  letter-spacing: 0.03em;
  color: var(--gold-600);
}

.value {
  margin-top: 0.1rem;
  font-size: 0.81rem;
  line-height: 1.85;
  color: var(--ink);
}

.note {
  margin-top: 1.2rem;
  padding: 0.7rem 0.95rem;
  border-left: 2px solid var(--gold-500);
  border-radius: 0 8px 8px 0;
  background: rgba(239, 217, 174, 0.22);
  font-size: 0.75rem;
  line-height: 1.85;
  color: var(--muted);
}

.venue-card .btn {
  margin-top: 1.35rem;
}

.map-card {
  position: relative;
  min-height: 380px;
  border: 1px solid rgba(201, 162, 92, 0.45);
  border-radius: 20px;
  overflow: hidden;
  background: #f4ecdc;
  box-shadow: var(--shadow);
}

.map-card svg {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

.map-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  padding: 0.35rem 0.85rem;
  border: 1px solid rgba(201, 162, 92, 0.45);
  border-radius: 999px;
  background: rgba(255, 253, 248, 0.86);
  color: var(--maroon-800);
  font-size: 0.72rem;
  backdrop-filter: blur(4px);
}

.pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 2.6s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.55);
    opacity: 0.9;
  }
  70% {
    transform: scale(1.25);
    opacity: 0;
  }
  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}

@media (max-width: 860px) {
  .venue-grid {
    grid-template-columns: 1fr;
  }

  .map-card {
    min-height: 320px;
  }
}
</style>
