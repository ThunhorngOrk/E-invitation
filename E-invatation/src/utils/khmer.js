const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']

export function toKhmerNumber(value, pad = 0) {
  return String(value)
    .padStart(pad, '0')
    .replace(/\d/g, (digit) => khmerDigits[Number(digit)])
}

export function toKhmerTime(time) {
  const [hours = '00', minutes = '00'] = String(time || '00:00').split(':')
  return `${toKhmerNumber(hours, 2)}:${toKhmerNumber(minutes, 2)}`
}
