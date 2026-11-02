<script setup>
import { useMusic } from '../composables/useMusic'

const { playing, toggle } = useMusic()
</script>

<template>
  <button
    class="music-toggle"
    :class="{ playing }"
    type="button"
    :aria-label="playing ? 'បិទតន្ត្រី' : 'បើកតន្ត្រី'"
    :title="playing ? 'បិទតន្ត្រី' : 'បើកតន្ត្រី'"
    @click="toggle"
  >
    <span class="bars" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </span>
    <span class="sr-only">{{ playing ? 'បិទតន្ត្រី' : 'បើកតន្ត្រី' }}</span>
  </button>
</template>

<style scoped>
.music-toggle {
  position: fixed;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1rem, 3vw, 2rem);
  z-index: 60;
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 1px solid rgba(239, 217, 174, 0.65);
  background: var(--control-bg);
  color: var(--gold-300);
  box-shadow: 0 16px 30px -14px rgba(53, 11, 21, 0.8);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.music-toggle:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 22px 34px -14px rgba(53, 11, 21, 0.85);
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}

.bars i {
  display: block;
  width: 3px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.7;
  transition: height 0.25s ease;
}

.playing .bars i {
  animation: bounce 1s ease-in-out infinite;
  opacity: 1;
}

.playing .bars i:nth-child(1) {
  animation-delay: 0s;
}

.playing .bars i:nth-child(2) {
  animation-delay: 0.15s;
}

.playing .bars i:nth-child(3) {
  animation-delay: 0.3s;
}

.playing .bars i:nth-child(4) {
  animation-delay: 0.45s;
}

@keyframes bounce {
  0%,
  100% {
    height: 6px;
  }
  50% {
    height: 18px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
