import { computed, onUnmounted, ref } from 'vue'

export function useCountdown(targetISO) {
  const target = new Date(targetISO).getTime()
  const now = ref(Date.now())
  const timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  onUnmounted(() => clearInterval(timer))

  const remaining = computed(() => {
    const diff = Math.max(0, target - now.value)
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor(diff / 3_600_000) % 24,
      minutes: Math.floor(diff / 60_000) % 60,
      seconds: Math.floor(diff / 1000) % 60,
    }
  })

  const isPast = computed(() => target - now.value <= 0)

  return { remaining, isPast }
}
