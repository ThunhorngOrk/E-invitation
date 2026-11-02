<script setup>
import Icon from './Icon.vue'

const model = defineModel({ type: String, default: '' })

defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  rows: { type: Number, default: 3 },
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <div class="field" :class="{ 'has-error': error }">
    <label class="label">
      <span class="label-text">
        {{ label }}<b v-if="required" class="req" aria-hidden="true">*</b>
      </span>

      <span class="control" :class="`control-${type}`">
        <Icon v-if="icon" :name="icon" :size="18" class="leading-icon" />

        <textarea
          v-if="type === 'textarea'"
          v-model="model"
          :rows="rows"
          :placeholder="placeholder"
          class="input"
          v-bind="$attrs"
        />

        <select v-else-if="type === 'select'" v-model="model" class="input select" v-bind="$attrs">
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <input
          v-else
          v-model="model"
          :type="type"
          :placeholder="placeholder"
          class="input"
          v-bind="$attrs"
        />

        <Icon v-if="type === 'select'" name="chevron-down" :size="16" class="trailing-icon" />
      </span>

      <small v-if="error" class="message error">{{ error }}</small>
      <small v-else-if="hint" class="message hint">{{ hint }}</small>
    </label>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 0.35rem;
}

.label {
  display: grid;
  gap: 0.35rem;
}

.label-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--maroon-800);
  line-height: 1.5;
}

.req {
  margin-left: 0.15rem;
  color: var(--maroon-700);
  font-weight: 700;
}

.control {
  position: relative;
  display: flex;
  align-items: center;
}

.leading-icon {
  position: absolute;
  left: 0.85rem;
  z-index: 1;
  color: var(--muted);
  pointer-events: none;
}

.control-textarea .leading-icon {
  top: 0.85rem;
}

.trailing-icon {
  position: absolute;
  right: 0.85rem;
  color: var(--muted);
  pointer-events: none;
}

.input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  border: 1.5px solid color-mix(in srgb, var(--gold-500) 30%, #fff);
  border-radius: 14px;
  background: #fff;
  font-family: inherit;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--ink);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  appearance: none;
}

.control:not(.control-textarea):not(.control-time) .input,
.control-select .input {
  min-height: 48px;
}

.leading-icon ~ .input {
  padding-left: 2.6rem;
}

.control-select .input {
  padding-right: 2.6rem;
  cursor: pointer;
}

.control-textarea .input {
  padding-left: 2.6rem;
  resize: vertical;
  min-height: 88px;
}

.control-time .input {
  min-height: 48px;
}

.input::placeholder {
  color: color-mix(in srgb, var(--muted) 55%, #fff);
}

.input:focus {
  outline: none;
  border-color: var(--maroon-700);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--maroon-700) 12%, transparent);
}

.has-error .input {
  border-color: #e04a4a;
  background: #fff8f8;
}

.has-error .input:focus {
  box-shadow: 0 0 0 4px rgba(224, 74, 74, 0.12);
}

.input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.55;
}

.message {
  font-size: 0.72rem;
  line-height: 1.6;
}

.message.error {
  color: #c62828;
  font-weight: 500;
}

.message.hint {
  color: var(--muted);
}
</style>
