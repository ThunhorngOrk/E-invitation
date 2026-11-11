<script setup>
import { invitation } from '../stores/invitation'
import { pickLocalized } from '../i18n'
</script>

<template>
  <section class="section section-tint">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">{{ invitation.coupleEyebrow }}</p>
        <h2 class="kh-heading">{{ invitation.coupleTitle }}</h2>
        <p class="section-sub">{{ invitation.coupleSub }}</p>
      </div>

      <div class="couple">
        <article class="person">
          <div class="portrait groom">
            <img
              v-if="invitation.groom.photo"
              class="photo"
              :src="invitation.groom.photo"
              :alt="pickLocalized(invitation.groom.nameKh, invitation.groom.nameEn)"
            />
            <template v-else>
              <span class="initial">{{ invitation.groom.initial }}</span>
              <span class="halo" aria-hidden="true"></span>
            </template>
            <span v-if="invitation.groom.photo" class="photo-shade" aria-hidden="true"></span>
          </div>
          <p class="role">{{ invitation.groom.role }}</p>
          <h3 class="name">{{ pickLocalized(invitation.groom.nameKh, invitation.groom.nameEn) }}</h3>
          <p class="name-en">{{ invitation.groom.nameEn }}</p>
          <p class="parents">{{ invitation.groom.parents }}</p>
        </article>

        <div class="knot" aria-hidden="true">
          <span class="knot-line"></span>
          <svg viewBox="0 0 40 40" fill="none">
            <path
              d="M20 4c4.4 5 6.8 9 6.8 12 0 3.1-2.7 6.5-6.8 10.5-4.1-4-6.8-7.4-6.8-10.5C13.2 13 15.6 9 20 4Z"
              stroke="currentColor"
              stroke-width="1.1"
            />
            <circle cx="20" cy="32" r="1.8" fill="currentColor" opacity=".7" />
            <path d="M12 30h16" stroke="currentColor" stroke-width="1" opacity=".45" />
          </svg>
          <span class="knot-line"></span>
        </div>

        <article class="person">
          <div class="portrait bride">
            <img
              v-if="invitation.bride.photo"
              class="photo"
              :src="invitation.bride.photo"
              :alt="pickLocalized(invitation.bride.nameKh, invitation.bride.nameEn)"
            />
            <template v-else>
              <span class="initial">{{ invitation.bride.initial }}</span>
              <span class="halo" aria-hidden="true"></span>
            </template>
            <span v-if="invitation.bride.photo" class="photo-shade" aria-hidden="true"></span>
          </div>
          <p class="role">{{ invitation.bride.role }}</p>
          <h3 class="name">{{ pickLocalized(invitation.bride.nameKh, invitation.bride.nameEn) }}</h3>
          <p class="name-en">{{ invitation.bride.nameEn }}</p>
          <p class="parents">{{ invitation.bride.parents }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.couple {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: clamp(1rem, 4vw, 3rem);
}

.person {
  text-align: center;
}

.portrait {
  position: relative;
  display: grid;
  place-items: center;
  width: min(260px, 74%);
  aspect-ratio: 1 / 1.08;
  margin-inline: auto;
  border: 1px solid rgba(201, 162, 92, 0.55);
  border-radius: 190px 190px 18px 18px;
  box-shadow: 0 30px 50px -34px rgba(53, 11, 21, 0.65);
  overflow: hidden;
  transition: transform 0.5s cubic-bezier(0.22, 0.75, 0.3, 1), box-shadow 0.5s ease;
}

.portrait::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 50% 22%, rgba(255, 255, 255, 0.22), transparent 45%),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 12px);
}

.portrait::after {
  content: '';
  position: absolute;
  inset: 9px;
  border: 1px solid rgba(246, 232, 201, 0.35);
  border-radius: 182px 182px 12px 12px;
}

.portrait.groom {
  background: var(--portrait-groom);
}

.portrait.bride {
  background: var(--portrait-bride);
}

.person:hover .portrait {
  transform: translateY(-6px);
  box-shadow: 0 40px 60px -34px rgba(53, 11, 21, 0.72);
}

.photo {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-shade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(53, 11, 21, 0.04) 45%, rgba(53, 11, 21, 0.34));
}

.initial {
  position: relative;
  z-index: 1;
  font-family: var(--font-display);
  font-size: clamp(3.4rem, 9vw, 5rem);
  line-height: 1;
  color: var(--gold-300);
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.halo {
  position: absolute;
  width: 62%;
  aspect-ratio: 1;
  border: 1px solid rgba(239, 217, 174, 0.28);
  border-radius: 50%;
}

.role {
  margin-top: 1.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--gold-600);
}

.name {
  margin-top: 0.3rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.15rem, 3vw, 1.5rem);
  line-height: 1.8;
  color: var(--maroon-800);
}

.name-en {
  margin-top: 0.1rem;
  font-family: var(--font-serif);
  font-size: 0.76rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--muted);
}

.parents {
  margin-top: 0.8rem;
  font-size: 0.76rem;
  line-height: 1.9;
  color: var(--muted);
}

.knot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  width: 48px;
  color: var(--gold-500);
}

.knot svg {
  width: 40px;
}

.knot-line {
  width: 1px;
  height: clamp(40px, 8vw, 90px);
  background: linear-gradient(180deg, transparent, rgba(201, 162, 92, 0.55), transparent);
}

@media (max-width: 800px) {
  .couple {
    grid-template-columns: 1fr;
    gap: 2.6rem;
  }

  .knot {
    flex-direction: row;
    width: auto;
  }

  .knot-line {
    width: clamp(50px, 22vw, 110px);
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201, 162, 92, 0.55), transparent);
  }

  .portrait {
    width: min(240px, 66%);
  }
}
</style>
