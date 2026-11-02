import { onUnmounted, ref } from 'vue'

const melody = [523.25, 587.33, 659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25, 440, 392, 440]

export function useMusic() {
  const playing = ref(false)
  let context
  let master
  let timer
  let step = 0

  function playNote(frequency, when, duration) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, when)
    gain.gain.exponentialRampToValueAtTime(0.5, when + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
    oscillator.connect(gain)
    gain.connect(master)
    oscillator.start(when)
    oscillator.stop(when + duration + 0.1)
  }

  function tick() {
    if (!context) return
    const when = context.currentTime
    const note = melody[step % melody.length]
    playNote(note, when, 1.5)
    playNote(note / 2, when, 2.4)
    step += 1
  }

  async function start() {
    context = new (window.AudioContext || window.webkitAudioContext)()
    await context.resume()
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1400
    master = context.createGain()
    master.gain.value = 0.065
    master.connect(filter)
    filter.connect(context.destination)
    tick()
    timer = setInterval(tick, 620)
    playing.value = true
  }

  function stop() {
    if (timer) clearInterval(timer)
    timer = null
    playing.value = false
    if (context) {
      context.close()
      context = null
    }
  }

  async function toggle() {
    if (playing.value) {
      stop()
      return
    }
    try {
      await start()
    } catch {
      stop()
    }
  }

  onUnmounted(stop)

  return { playing, toggle }
}
