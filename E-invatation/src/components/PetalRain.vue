<script setup>
const petals = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: Math.random() * 100,
  delay: -Math.random() * 20,
  duration: 13 + Math.random() * 10,
  size: 7 + Math.random() * 8,
  tone: index % 3,
}))
</script>

<template>
  <div class="petals" aria-hidden="true">
    <span
      v-for="petal in petals"
      :key="petal.id"
      class="petal"
      :class="`tone-${petal.tone}`"
      :style="{
        left: `${petal.left}%`,
        width: `${petal.size}px`,
        height: `${petal.size * 1.45}px`,
        animationDelay: `${petal.delay}s`,
        animationDuration: `${petal.duration}s`,
      }"
    ></span>
  </div>
</template>

<style scoped>
.petals {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.petal {
  position: absolute;
  top: -8%;
  border-radius: 62% 0 62% 0;
  background: linear-gradient(135deg, #f3dccd 0%, #c9808c 55%, #8a2c3e 100%);
  opacity: 0.4;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.petal.tone-1 {
  background: linear-gradient(135deg, #f6e8c9 0%, #dcb97a 55%, #a9823f 100%);
  opacity: 0.35;
}

.petal.tone-2 {
  background: linear-gradient(135deg, #f0d6c7 0%, #b0606e 60%, #6d1f2e 100%);
  opacity: 0.28;
}

.petal:nth-child(3n) {
  animation-name: fall-left;
}

.petal:nth-child(4n) {
  animation-name: fall-right;
}

@keyframes fall {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(0deg);
  }
  50% {
    transform: translate3d(26px, 52vh, 0) rotate(160deg);
  }
  100% {
    transform: translate3d(-8px, 112vh, 0) rotate(330deg);
  }
}

@keyframes fall-left {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(20deg);
  }
  50% {
    transform: translate3d(-34px, 55vh, 0) rotate(190deg);
  }
  100% {
    transform: translate3d(12px, 112vh, 0) rotate(340deg);
  }
}

@keyframes fall-right {
  0% {
    transform: translate3d(0, -10vh, 0) rotate(-20deg);
  }
  50% {
    transform: translate3d(38px, 48vh, 0) rotate(150deg);
  }
  100% {
    transform: translate3d(-14px, 112vh, 0) rotate(310deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .petals {
    display: none;
  }
}
</style>
