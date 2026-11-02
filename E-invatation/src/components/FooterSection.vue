<script setup>
import { ref } from 'vue'
import { invitation } from '../stores/invitation'
import { toKhmerNumber } from '../utils/khmer'
import KhmerDivider from './KhmerDivider.vue'

const year = toKhmerNumber(new Date().getFullYear())
const copied = ref(false)

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
  <footer class="footer">
    <div class="glow" aria-hidden="true"></div>
    <div class="container inner">
      <KhmerDivider />

      <p class="blessing">{{ invitation.blessing }}</p>

      <h3 class="names">
        <span class="text-gold">{{ invitation.groom.nameKh }}</span>
        <span class="and">និង</span>
        <span class="text-gold">{{ invitation.bride.nameKh }}</span>
      </h3>

      <p class="date">{{ invitation.dateKh }}</p>
      <p class="venue">{{ invitation.venue.name }}</p>

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
        ចែករំលែកការអញ្ជើញ
      </button>

      <p class="thanks">{{ invitation.thanksText }}</p>
      <p class="credit">
        ធ្វើឡើងដោយក្តីស្រលាញ់ • {{ year }} •
        <a class="edit-link" href="#/edit">កែប្រែការអញ្ជើញ</a>
      </p>
    </div>

    <Transition name="toast">
      <p v-if="copied" class="toast" role="status">បានចម្លងតំណភ្ជាប់</p>
    </Transition>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  padding: clamp(3rem, 7vw, 5.5rem) 0 clamp(2.5rem, 5vw, 3.5rem);
  text-align: center;
  color: var(--ivory);
  background: var(--footer-bg);
}

.footer::before {
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
  width: 460px;
  height: 460px;
  left: 50%;
  bottom: -260px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(201, 162, 92, 0.16);
  filter: blur(90px);
}

.inner {
  position: relative;
  z-index: 2;
}

.divider {
  color: var(--gold-500);
}

.blessing {
  max-width: 620px;
  margin: 1.4rem auto 0;
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  line-height: 2.15;
  color: rgba(246, 232, 201, 0.82);
}

.names {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.1rem 0.9rem;
  margin-top: 1.8rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.3rem, 3.8vw, 1.9rem);
  line-height: 1.8;
}

.and {
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--gold-300);
  opacity: 0.8;
}

.date {
  margin-top: 0.5rem;
  font-size: 0.82rem;
  color: var(--gold-200);
}

.venue {
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: rgba(246, 232, 201, 0.6);
}

.footer .btn {
  margin-top: 1.6rem;
}

.thanks {
  margin-top: 1.8rem;
  font-size: 0.82rem;
  color: rgba(246, 232, 201, 0.7);
}

.credit {
  margin-top: 1.6rem;
  padding-top: 1.3rem;
  border-top: 1px solid rgba(239, 217, 174, 0.16);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  color: rgba(246, 232, 201, 0.4);
}

.edit-link {
  color: rgba(246, 232, 201, 0.55);
  text-decoration: none;
  border-bottom: 1px solid rgba(246, 232, 201, 0.22);
  transition: color 0.25s ease, border-color 0.25s ease;
}

.edit-link:hover {
  color: var(--gold-300);
  border-color: rgba(239, 217, 174, 0.5);
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 1.6rem;
  z-index: 90;
  transform: translateX(-50%);
  padding: 0.55rem 1.2rem;
  border: 1px solid rgba(239, 217, 174, 0.4);
  border-radius: 999px;
  background: rgba(53, 11, 21, 0.94);
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
</style>
