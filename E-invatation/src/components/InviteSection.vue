<script setup>
import { invitation } from '../stores/invitation'
import KhmerDivider from './KhmerDivider.vue'
</script>

<template>
  <section id="invitation" class="section">
    <div class="container">
      <div class="ornate-card invite">
        <p class="eyebrow">{{ invitation.inviteEyebrow }}</p>
        <h2 class="kh-heading">{{ invitation.inviteTitle }}</h2>
        <KhmerDivider />

        <p class="lead">{{ invitation.invitationText }}</p>
        <p class="sub">{{ invitation.invitationSub }}</p>

        <div class="families">
          <div class="family">
            <p class="family-role">{{ invitation.groom.parentsTitle }}</p>
            <p class="family-name">{{ invitation.groom.parents }}</p>
            <p class="family-address">{{ invitation.groom.parentsAddress }}</p>
          </div>

          <div class="family-divider" aria-hidden="true">
            <svg viewBox="0 0 30 30" fill="none">
              <path
                d="M15 3c3.1 3.5 4.8 6.3 4.8 8.4 0 2.2-1.9 4.5-4.8 7.4-2.9-2.9-4.8-5.2-4.8-7.4C10.2 9.3 11.9 6.5 15 3Z"
                fill="currentColor"
              />
              <circle cx="15" cy="23.5" r="1.6" fill="currentColor" opacity=".65" />
            </svg>
          </div>

          <div class="family">
            <p class="family-role">{{ invitation.bride.parentsTitle }}</p>
            <p class="family-name">{{ invitation.bride.parents }}</p>
            <p class="family-address">{{ invitation.bride.parentsAddress }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.invite {
  text-align: center;
}

.lead {
  max-width: 730px;
  margin: 0.5rem auto 0;
  font-size: clamp(0.93rem, 2.2vw, 1.04rem);
  line-height: 2.1;
  color: var(--ink);
}

.sub {
  max-width: 600px;
  margin: 0.9rem auto 0;
  font-size: clamp(0.8rem, 1.9vw, 0.9rem);
  line-height: 1.95;
  color: var(--muted);
}

.families {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: clamp(1rem, 3vw, 2rem);
  margin-top: clamp(2rem, 4vw, 2.8rem);
  padding-top: clamp(1.7rem, 4vw, 2.4rem);
  border-top: 1px dashed rgba(201, 162, 92, 0.45);
}

.family-role {
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  color: var(--gold-600);
}

.family-name {
  margin-top: 0.5rem;
  font-family: var(--font-display);
  font-size: clamp(0.92rem, 2.2vw, 1.08rem);
  line-height: 1.95;
  color: var(--maroon-800);
}

.family-address {
  margin-top: 0.45rem;
  font-size: 0.73rem;
  line-height: 1.85;
  color: var(--muted);
}

.family-divider {
  width: 30px;
  color: var(--gold-500);
  opacity: 0.75;
}

@media (max-width: 740px) {
  .families {
    grid-template-columns: 1fr;
    gap: 1.6rem;
  }

  .family-divider {
    margin-inline: auto;
    transform: rotate(90deg);
  }
}
</style>
