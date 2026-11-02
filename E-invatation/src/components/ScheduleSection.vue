<script setup>
import { invitation } from '../stores/invitation'
import { toKhmerTime } from '../utils/khmer'
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">{{ invitation.scheduleEyebrow }}</p>
        <h2 class="kh-heading">{{ invitation.scheduleTitle }}</h2>
        <p class="section-sub">{{ invitation.scheduleSub }}</p>
      </div>

      <div class="timeline">
        <div
          v-for="(item, index) in invitation.schedule"
          :key="item.time"
          class="item"
          v-reveal="index * 70"
        >
          <span class="marker" aria-hidden="true"></span>
          <div class="card">
            <span class="time">{{ toKhmerTime(item.time) }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  position: relative;
  max-width: 880px;
  margin-inline: auto;
  padding-block: 0.5rem;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(201, 162, 92, 0.55) 7%,
    rgba(201, 162, 92, 0.55) 93%,
    transparent
  );
}

.item {
  position: relative;
  width: 50%;
  padding-right: clamp(1.8rem, 4vw, 3.2rem);
  margin-bottom: 1.35rem;
  display: flex;
  justify-content: flex-end;
}

.item:nth-child(even) {
  margin-left: 50%;
  padding-right: 0;
  padding-left: clamp(1.8rem, 4vw, 3.2rem);
  justify-content: flex-start;
}

.marker {
  position: absolute;
  top: 1.85rem;
  right: 0;
  transform: translateX(50%);
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--gold-400);
  box-shadow: 0 0 0 4px rgba(201, 162, 92, 0.18), 0 0 18px 2px rgba(201, 162, 92, 0.45);
}

.item:nth-child(even) .marker {
  right: auto;
  left: 0;
  transform: translateX(-50%);
}

.card {
  position: relative;
  width: 100%;
  max-width: 360px;
  padding: 1.3rem 1.5rem;
  border: 1px solid rgba(201, 162, 92, 0.35);
  border-radius: 14px;
  background: linear-gradient(180deg, #fffdf8, #fbf4e6);
  box-shadow: 0 20px 40px -34px rgba(53, 11, 21, 0.55);
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}

.card:hover {
  transform: translateY(-3px);
  border-color: rgba(201, 162, 92, 0.6);
  box-shadow: 0 26px 46px -30px rgba(53, 11, 21, 0.6);
}

.time {
  display: inline-block;
  padding: 0.2rem 0.8rem;
  border: 1px solid rgba(201, 162, 92, 0.45);
  border-radius: 999px;
  background: var(--gold-200);
  color: var(--maroon-800);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.card h3 {
  margin-top: 0.55rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(0.98rem, 2.2vw, 1.12rem);
  line-height: 1.85;
  color: var(--maroon-800);
}

.card p {
  margin-top: 0.3rem;
  font-size: 0.79rem;
  line-height: 1.9;
  color: var(--muted);
}

@media (max-width: 760px) {
  .timeline::before {
    left: 8px;
  }

  .item,
  .item:nth-child(even) {
    width: 100%;
    margin-left: 0;
    padding-left: 2.4rem;
    padding-right: 0;
    justify-content: flex-start;
  }

  .marker,
  .item:nth-child(even) .marker {
    left: 8px;
    right: auto;
    transform: translateX(-50%);
  }

  .card {
    max-width: none;
  }
}
</style>
