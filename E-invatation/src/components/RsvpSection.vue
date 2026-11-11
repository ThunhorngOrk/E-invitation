<script setup>
import { reactive, ref } from 'vue'
import { invitation, submitRsvp } from '../stores/invitation'
import { formatNumber, t } from '../i18n'

const form = reactive({
  name: '',
  attendance: 'yes',
  guests: 1,
  message: '',
})

const error = ref('')
const loading = ref(false)
const submitted = ref(false)
const savedName = ref('')
const savedAttendance = ref('yes')
const savedGuests = ref(1)

async function submit() {
  if (!form.name) {
    error.value = t('invitation.rsvpNameRequired')
    return
  }
  if (loading.value) return

  error.value = ''
  loading.value = true

  try {
    await submitRsvp({
      name: form.name,
      attendance: form.attendance,
      guests: form.attendance === 'yes' ? form.guests : 1,
      message: form.message || null,
    })

    savedName.value = form.name
    savedAttendance.value = form.attendance
    savedGuests.value = form.guests
    submitted.value = true
  } catch (err) {
    error.value = err?.message || t('invitation.rsvpError')
  } finally {
    loading.value = false
  }
}

function reset() {
  submitted.value = false
  error.value = ''
  form.name = ''
  form.attendance = 'yes'
  form.guests = 1
  form.message = ''
}
</script>

<template>
  <section id="rsvp" class="section">
    <div class="container">
      <div class="ornate-card rsvp">
        <div class="section-head">
          <p class="eyebrow">{{ invitation.rsvpEyebrow }}</p>
          <h2 class="kh-heading">{{ invitation.rsvpTitle }}</h2>
          <p class="section-sub">{{ invitation.rsvpDeadline }}</p>
        </div>

        <form v-if="!submitted" class="form" novalidate @submit.prevent="submit">
          <div class="field">
            <label for="rsvp-name">{{ t('invitation.rsvpName') }} <span class="required">*</span></label>
            <input
              id="rsvp-name"
              v-model.trim="form.name"
              type="text"
              :placeholder="t('invitation.rsvpNamePlaceholder')"
              autocomplete="name"
              :aria-invalid="Boolean(error)"
              @input="error = ''"
            />
            <p v-if="error" class="error" role="alert">{{ error }}</p>
          </div>

          <div class="field">
            <span class="field-label">{{ t('invitation.rsvpAttend') }}</span>
            <div class="choices">
              <label class="choice" :class="{ active: form.attendance === 'yes' }">
                <input v-model="form.attendance" type="radio" value="yes" />
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m5 12.5 4.5 4.5L19 7.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ t('invitation.rsvpYes') }}
              </label>
              <label class="choice" :class="{ active: form.attendance === 'no' }">
                <input v-model="form.attendance" type="radio" value="no" />
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
                {{ t('invitation.rsvpNo') }}
              </label>
            </div>
          </div>

          <div v-if="form.attendance === 'yes'" class="field guests">
            <label for="rsvp-guests">{{ t('invitation.rsvpGuests') }}</label>
            <select id="rsvp-guests" v-model.number="form.guests">
              <option v-for="count in 6" :key="count" :value="count">
                {{ t('invitation.rsvpGuestsUnit', { n: formatNumber(count) }) }}
              </option>
            </select>
          </div>

          <div class="field">
            <label for="rsvp-message">
              {{ t('invitation.rsvpMessage') }} <span class="optional">{{ t('invitation.rsvpOptional') }}</span>
            </label>
            <textarea
              id="rsvp-message"
              v-model.trim="form.message"
              rows="3"
              :placeholder="t('invitation.rsvpMessagePlaceholder')"
            ></textarea>
          </div>

          <button class="btn btn-gold" type="submit" :disabled="loading">
            <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m3.5 11.5 17-7-5.5 16-3.5-6.5-8-2.5Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>
            {{ loading ? t('invitation.sending') : t('invitation.rsvpSend') }}
          </button>
        </form>

        <div v-else class="success">
          <div class="check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="m5 12.5 4.5 4.5L19 7.5"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3>{{ t('invitation.rsvpThanks') }}</h3>
          <p class="success-text">
            {{ t('invitation.rsvpReceived', { name: savedName }) }}
          </p>
          <p v-if="savedAttendance === 'yes'" class="success-sub">
            {{ t('invitation.rsvpSeeYou', { n: formatNumber(savedGuests) }) }}
          </p>
          <p v-else class="success-sub">{{ t('invitation.rsvpMissYou') }}</p>
          <button class="btn btn-outline" type="button" @click="reset">{{ t('invitation.rsvpAgain') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rsvp {
  max-width: 720px;
  margin-inline: auto;
}

.form {
  display: grid;
  gap: 1.15rem;
  max-width: 540px;
  margin-inline: auto;
}

.field {
  display: grid;
  gap: 0.4rem;
  text-align: left;
}

.field label,
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.required {
  color: var(--maroon-600);
}

.optional {
  font-weight: 400;
  font-size: 0.72rem;
  color: var(--muted);
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba(201, 162, 92, 0.45);
  border-radius: 10px;
  background: #fffdf8;
  font-size: 0.88rem;
  color: var(--ink);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #b09a90;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--gold-500);
  box-shadow: 0 0 0 3px rgba(201, 162, 92, 0.2);
}

.field textarea {
  resize: vertical;
  min-height: 96px;
}

.guests {
  max-width: 180px;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.choice {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border: 1px solid rgba(201, 162, 92, 0.4);
  border-radius: 999px;
  background: #fffdf8;
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
}

.choice input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.choice svg {
  width: 15px;
  height: 15px;
  color: var(--muted);
}

.choice.active {
  border-color: var(--maroon-700);
  background: var(--gold-200);
  color: var(--maroon-800);
}

.choice.active svg {
  color: var(--maroon-700);
}

.choice:focus-within {
  outline: 2px solid var(--gold-600);
  outline-offset: 2px;
}

.error {
  font-size: 0.75rem;
  color: #a3213a;
}

.form .btn {
  justify-self: center;
  margin-top: 0.35rem;
}

.success {
  max-width: 460px;
  margin-inline: auto;
  text-align: center;
}

.check {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-inline: auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0dcb2, #c9a25c);
  color: var(--maroon-900);
  box-shadow: 0 18px 30px -16px rgba(201, 162, 92, 0.9);
}

.check svg {
  width: 28px;
}

.success h3 {
  margin-top: 1rem;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.3rem;
  color: var(--maroon-800);
}

.success-text {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--ink);
}

.success-sub {
  margin-top: 0.4rem;
  font-size: 0.82rem;
  line-height: 1.95;
  color: var(--muted);
}

.success .btn {
  margin-top: 1.4rem;
}
</style>
