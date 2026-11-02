<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { login, register } from '../stores/auth'
import { hasChosenTheme } from '../stores/theme'

const props = defineProps({
  mode: { type: String, default: 'register' },
})

const isLogin = computed(() => props.mode === 'login')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
})

const error = ref('')
const loading = ref(false)

watch(
  () => props.mode,
  () => {
    error.value = ''
    loading.value = false
    form.password = ''
    form.confirm = ''
  },
)

function switchMode(mode) {
  window.location.hash = mode === 'login' ? '#/login' : '#/register'
}

async function submit() {
  if (loading.value) return

  error.value = ''
  if (!isLogin.value && form.password !== form.confirm) {
    error.value = 'ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ'
    return
  }

  loading.value = true
  try {
    if (isLogin.value) {
      await login({ email: form.email, password: form.password })
      window.location.hash = hasChosenTheme.value ? '#/edit' : '#/styles'
    } else {
      await register(form)
      window.location.hash = '#/styles'
    }
  } catch (err) {
    error.value = err?.message || 'មានបញ្ហាមិនបានរំពឹងទុក សូមព្យាយាមម្តងទៀត'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth">
    <div class="glow glow-a" aria-hidden="true"></div>
    <div class="glow glow-b" aria-hidden="true"></div>

    <div class="auth-shell">
      <aside class="brand-panel">
        <p class="brand-eyebrow">E-invitation</p>
        <h1 class="brand-title">សិរីមង្គល<br />អាពាហ៍ពិពាហ៍</h1>
        <p class="brand-sub">
          បង្កើតគណនីរបស់អ្នក បំពេញព័ត៌មានការអញ្ជើញ ជ្រើសរើសរចនាប័ទ្ម
          និងគ្រប់គ្រងការឆ្លើយតបពីភ្ញៀវ — ទាំងអស់នៅក្នុងកន្លែងតែមួយ។
        </p>

        <ul class="brand-list">
          <li>
            <span class="dot" aria-hidden="true"></span>
            បំពេញព័ត៌មានគូស្វាមីភរិយា គ្រួសារ និងកម្មវិធី
          </li>
          <li>
            <span class="dot" aria-hidden="true"></span>
            បន្ថែមរូបថតគម្រប រូបថតគូ និងរូបថតអនុស្សាវរីយ៍
          </li>
          <li>
            <span class="dot" aria-hidden="true"></span>
            ជ្រើសរើសពណ៌ និងរចនាប័ទ្មតាមចិត្តរបស់អ្នក
          </li>
          <li>
            <span class="dot" aria-hidden="true"></span>
            តាមដានការឆ្លើយតបរបស់ភ្ញៀវ និងនាំចេញ CSV
          </li>
        </ul>

        <div class="brand-note">
          <span>ឯកជនភាព</span>
          <p>គណនី និងទិន្នន័យរក្សាទុកក្នុងឧបករណ៍នេះតែមួយ។</p>
        </div>
      </aside>

      <section class="form-panel">
        <div class="form-head">
          <p class="eyebrow">{{ isLogin ? 'Welcome Back' : 'Create Account' }}</p>
          <h2>{{ isLogin ? 'ចូលគណនី' : 'ចុះឈ្មោះគណនី' }}</h2>
          <p class="form-sub">
            {{ isLogin ? 'បញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់ដើម្បីបន្តទៅកែប្រែការអញ្ជើញ។' : 'បំពេញព័ត៌មានខាងក្រោមដើម្បីចាប់ផ្តើមបង្កើតការអញ្ជើញ។' }}
          </p>
        </div>

        <form class="form" novalidate @submit.prevent="submit">
          <label v-if="!isLogin" class="field">
            <span>ឈ្មោះពេញ <b>*</b></span>
            <input
              v-model.trim="form.name"
              type="text"
              autocomplete="name"
              placeholder="ឧ. សុខ ដារា"
            />
          </label>

          <label class="field">
            <span>អ៊ីមែល <b>*</b></span>
            <input
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label v-if="!isLogin" class="field">
            <span>លេខទូរស័ព្ទ</span>
            <input
              v-model.trim="form.phone"
              type="tel"
              autocomplete="tel"
              placeholder="012 345 678"
            />
          </label>

          <label class="field">
            <span>ពាក្យសម្ងាត់ <b>*</b></span>
            <input
              v-model="form.password"
              type="password"
              :autocomplete="isLogin ? 'current-password' : 'new-password'"
              placeholder="យ៉ាងតិច ៦ តួអក្សរ"
            />
          </label>

          <label v-if="!isLogin" class="field">
            <span>បញ្ជាក់ពាក្យសម្ងាត់ <b>*</b></span>
            <input
              v-model="form.confirm"
              type="password"
              autocomplete="new-password"
              placeholder="វាយពាក្យសម្ងាត់ម្តងទៀត"
            />
          </label>

          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <button class="btn btn-gold submit" type="submit" :disabled="loading">
            {{ loading ? 'សូមរង់ចាំ...' : isLogin ? 'ចូលគណនី' : 'ចុះឈ្មោះ និងបន្ត' }}
          </button>
        </form>

        <p class="switch">
          <template v-if="isLogin">
            មិនទាន់មានគណនី?
            <button type="button" @click="switchMode('register')">ចុះឈ្មោះឥឡូវ</button>
          </template>
          <template v-else>
            មានគណនីរួចហើយ?
            <button type="button" @click="switchMode('login')">ចូលគណនី</button>
          </template>
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-items: center;
  padding: clamp(1.2rem, 4vw, 3rem);
  overflow: hidden;
  background: var(--hero-bg);
}

.auth::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.018) 0 1px,
    transparent 1px 9px
  );
  pointer-events: none;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
}

.glow-a {
  width: 420px;
  height: 420px;
  top: -140px;
  left: -100px;
  background: color-mix(in srgb, var(--gold-500) 22%, transparent);
}

.glow-b {
  width: 480px;
  height: 480px;
  right: -160px;
  bottom: -180px;
  background: color-mix(in srgb, var(--rose) 30%, transparent);
}

.auth-shell {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  width: min(980px, 100%);
  margin-inline: auto;
  border: 1px solid color-mix(in srgb, var(--gold-400) 45%, transparent);
  border-radius: 22px;
  overflow: hidden;
  background: color-mix(in srgb, var(--maroon-900) 55%, transparent);
  backdrop-filter: blur(9px);
  box-shadow: 0 50px 90px -50px rgba(0, 0, 0, 0.75);
}

.brand-panel {
  padding: clamp(1.8rem, 4vw, 3rem);
  color: var(--ivory);
  background:
    radial-gradient(circle at 15% 12%, color-mix(in srgb, var(--gold-500) 18%, transparent), transparent 45%),
    linear-gradient(165deg, color-mix(in srgb, var(--maroon-700) 72%, transparent), color-mix(in srgb, var(--maroon-900) 82%, transparent));
}

.brand-eyebrow {
  font-family: var(--font-serif);
  font-size: 0.66rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--gold-400);
}

.brand-title {
  margin-top: 0.8rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.5rem, 3.6vw, 2.15rem);
  line-height: 1.9;
  color: var(--gold-200);
}

.brand-sub {
  margin-top: 0.9rem;
  font-size: 0.8rem;
  line-height: 2;
  color: color-mix(in srgb, var(--gold-200) 68%, transparent);
}

.brand-list {
  display: grid;
  gap: 0.65rem;
  margin: 1.4rem 0 0;
  padding: 0;
  list-style: none;
}

.brand-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.76rem;
  line-height: 1.85;
  color: color-mix(in srgb, var(--gold-200) 76%, transparent);
}

.dot {
  flex: none;
  width: 6px;
  height: 6px;
  margin-top: 0.6rem;
  border-radius: 50%;
  background: var(--gold-400);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold-400) 18%, transparent);
}

.brand-note {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed color-mix(in srgb, var(--gold-400) 32%, transparent);
}

.brand-note span {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--gold-300);
}

.brand-note p {
  margin-top: 0.2rem;
  font-size: 0.7rem;
  line-height: 1.8;
  color: color-mix(in srgb, var(--gold-200) 52%, transparent);
}

.form-panel {
  padding: clamp(1.8rem, 4vw, 3rem);
  background: var(--surface);
}

.form-head .eyebrow {
  color: var(--gold-600);
}

.form-head h2 {
  margin-top: 0.35rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.2rem, 3vw, 1.55rem);
  line-height: 1.8;
  color: var(--maroon-800);
}

.form-sub {
  margin-top: 0.4rem;
  font-size: 0.76rem;
  line-height: 1.9;
  color: var(--muted);
}

.form {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.4rem;
}

.field {
  display: grid;
  gap: 0.3rem;
}

.field > span {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.field b {
  color: var(--maroon-600);
}

.field input {
  width: 100%;
  padding: 0.68rem 0.85rem;
  border: 1px solid color-mix(in srgb, var(--gold-500) 45%, transparent);
  border-radius: 10px;
  background: var(--surface-soft);
  font-size: 0.83rem;
  color: var(--ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input::placeholder {
  color: color-mix(in srgb, var(--muted) 70%, transparent);
}

.field input:focus {
  outline: none;
  border-color: var(--gold-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gold-500) 18%, transparent);
}

.error {
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(180, 60, 60, 0.3);
  border-radius: 9px;
  background: rgba(180, 60, 60, 0.06);
  font-size: 0.73rem;
  line-height: 1.7;
  color: #9a2438;
}

.submit {
  width: 100%;
  margin-top: 0.3rem;
}

.submit:disabled {
  opacity: 0.65;
  cursor: wait;
  transform: none;
}

.switch {
  margin-top: 1.15rem;
  text-align: center;
  font-size: 0.76rem;
  color: var(--muted);
}

.switch button {
  padding: 0;
  border: 0;
  background: none;
  font-size: inherit;
  font-weight: 600;
  color: var(--maroon-700);
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 820px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    display: none;
  }
}

@media (max-width: 480px) {
  .auth {
    padding: 3.6rem 0.9rem 1.4rem;
    align-items: start;
  }

  .auth-shell {
    border-radius: 18px;
  }
}
</style>
