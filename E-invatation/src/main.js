import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './styles/themes.css'
import './styles/dark.css'
import './stores/theme'
import './stores/mode'
import './i18n'

const reveal = {
  mounted(element, binding) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    element.classList.add('reveal')
    if (binding.value) {
      element.style.transitionDelay = `${binding.value}ms`
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('is-visible')
            observer.unobserve(element)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )

    observer.observe(element)
    element._revealObserver = observer
  },
  unmounted(element) {
    element._revealObserver?.disconnect()
  },
}

createApp(App).directive('reveal', reveal).mount('#app')
