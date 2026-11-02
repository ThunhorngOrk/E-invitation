<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import FormField from './FormField.vue'
import { toKhmerNumber } from '../../utils/khmer'

const props = defineProps({
  day: { type: Object, required: true },
  index: { type: Number, required: true },
})

defineEmits(['toggle', 'remove', 'add-activity', 'remove-activity'])

const dateLabel = computed(() => {
  if (!props.day.date) return 'មិនទាន់កំណត់ថ្ងៃ'
  const date = new Date(`${props.day.date}T00:00:00`)
  if (Number.isNaN(date.getTime())) return props.day.date
  try {
    return date.toLocaleDateString('km-KH', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return props.day.date
  }
})
</script>

<template>
  <article class="day" :class="{ open: day.open }">
    <div class="day-head">
      <button class="day-toggle" type="button" :aria-expanded="day.open" @click="$emit('toggle')">
        <span class="day-badge">{{ toKhmerNumber(index + 1) }}</span>
        <span class="day-titles">
          <strong>ថ្ងៃទី {{ toKhmerNumber(index + 1) }}</strong>
          <small>{{ dateLabel }} · {{ toKhmerNumber(day.activities.length) }} សកម្មភាព</small>
        </span>
        <span class="chev-wrap">
          <Icon name="chevron-down" :size="18" class="chev" />
        </span>
      </button>

      <button class="day-remove" type="button" aria-label="លុបថ្ងៃនេះ" @click="$emit('remove')">
        <Icon name="trash" :size="17" />
      </button>
    </div>

    <div class="day-collapse" :class="{ open: day.open }">
      <div class="day-collapse-inner">
        <div class="day-body">
          <FormField
            v-model="day.date"
            label="ថ្ងៃនៃកម្មវិធី"
            icon="calendar"
            type="date"
          />

          <div class="activities-head">
            <span class="activities-title">សកម្មភាព</span>
            <span class="activities-count">{{ toKhmerNumber(day.activities.length) }}</span>
          </div>

          <p v-if="!day.activities.length" class="activities-empty">
            មិនទាន់មានសកម្មភាពនៅឡើយទេ។
          </p>

          <ul v-else class="activities">
            <li v-for="(activity, activityIndex) in day.activities" :key="activity.id" class="activity">
              <span class="activity-index">{{ toKhmerNumber(activityIndex + 1) }}</span>

              <div class="activity-fields">
                <input
                  v-model="activity.name"
                  class="activity-name"
                  type="text"
                  placeholder="ឈ្មោះសកម្មភាព"
                />
                <div class="activity-time">
                  <Icon name="clock" :size="16" />
                  <input v-model="activity.time" type="time" />
                </div>
              </div>

              <button
                class="activity-remove"
                type="button"
                aria-label="លុបសកម្មភាព"
                @click="$emit('remove-activity', activity.id)"
              >
                <Icon name="x" :size="16" />
              </button>
            </li>
          </ul>

          <button class="add-activity" type="button" @click="$emit('add-activity')">
            <Icon name="plus" :size="16" />
            បន្ថែមសកម្មភាព
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.day {
  border: 1.5px solid color-mix(in srgb, var(--gold-500) 30%, #fff);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.day.open {
  border-color: var(--gold-400);
  box-shadow: 0 10px 30px -20px color-mix(in srgb, var(--maroon-800) 55%, transparent);
}

.day-head {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.55rem 0.55rem 0.55rem 0.7rem;
}

.day-toggle {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.35rem 0.2rem;
  border: 0;
  background: transparent;
  text-align: left;
}

.day-badge {
  display: grid;
  place-items: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: linear-gradient(135deg, var(--gold-200), var(--gold-300));
  color: var(--maroon-800);
  font-size: 0.82rem;
  font-weight: 700;
}

.day-titles {
  flex: 1;
  display: grid;
  gap: 0.05rem;
  min-width: 0;
}

.day-titles strong {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--maroon-800);
}

.day-titles small {
  overflow: hidden;
  font-size: 0.68rem;
  color: var(--muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chev-wrap {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: var(--muted);
}

.chev {
  transition: transform 0.25s ease;
}

.day.open .chev {
  transform: rotate(180deg);
}

.day-remove {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 10px;
  background: #fff;
  color: var(--maroon-600);
  transition: background 0.18s ease, border-color 0.18s ease;
}

.day-remove:hover {
  background: #fdecef;
  border-color: #f2b3c3;
}

.day-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.day-collapse.open {
  grid-template-rows: 1fr;
}

.day-collapse-inner {
  overflow: hidden;
}

.day-body {
  display: grid;
  gap: 0.9rem;
  padding: 0.4rem 0.9rem 1rem;
  border-top: 1px dashed color-mix(in srgb, var(--gold-500) 35%, #fff);
  margin-top: 0.1rem;
  padding-top: 0.9rem;
}

.activities-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: -0.25rem;
}

.activities-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--maroon-800);
}

.activities-count {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--gold-200);
  color: var(--maroon-800);
  font-size: 0.68rem;
  font-weight: 700;
}

.activities-empty {
  padding: 0.8rem;
  border: 1px dashed color-mix(in srgb, var(--gold-500) 45%, #fff);
  border-radius: 12px;
  background: #fff8fb;
  color: var(--muted);
  font-size: 0.76rem;
  text-align: center;
}

.activities {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.6rem;
  border: 1px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 13px;
  background: #fffbfc;
}

.activity-index {
  display: grid;
  place-items: center;
  flex: none;
  width: 22px;
  height: 22px;
  margin-top: 0.35rem;
  border-radius: 7px;
  background: var(--gold-200);
  color: var(--maroon-800);
  font-size: 0.66rem;
  font-weight: 700;
}

.activity-fields {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 128px;
  gap: 0.45rem;
  min-width: 0;
}

.activity-name,
.activity-time {
  min-height: 40px;
  border: 1.5px solid color-mix(in srgb, var(--gold-500) 30%, #fff);
  border-radius: 11px;
  background: #fff;
}

.activity-name {
  min-width: 0;
  padding: 0.5rem 0.7rem;
  font-family: inherit;
  font-size: 0.82rem;
  color: var(--ink);
}

.activity-name::placeholder {
  color: color-mix(in srgb, var(--muted) 55%, #fff);
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.55rem;
  color: var(--muted);
}

.activity-time input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.8rem;
  color: var(--ink);
}

.activity-time input:focus,
.activity-name:focus {
  outline: none;
}

.activity-name:focus {
  border-color: var(--maroon-700);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--maroon-700) 10%, transparent);
}

.activity-time:focus-within {
  border-color: var(--maroon-700);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--maroon-700) 10%, transparent);
}

.activity-remove {
  flex: none;
  display: grid;
  place-items: center;
  width: 36px;
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--gold-500) 35%, #fff);
  border-radius: 10px;
  background: #fff;
  color: var(--maroon-600);
  transition: background 0.18s ease;
}

.activity-remove:hover {
  background: #fdecef;
}

.add-activity {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 0.9rem;
  border: 1.5px dashed var(--gold-400);
  border-radius: 12px;
  background: #fff8fb;
  color: var(--maroon-800);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  transition: background 0.18s ease, border-color 0.18s ease;
}

.add-activity:hover {
  background: var(--gold-200);
  border-color: var(--maroon-700);
}

@media (max-width: 420px) {
  .activity-fields {
    grid-template-columns: 1fr;
  }

  .activity-time {
    max-width: 150px;
  }
}
</style>
