export function timeFormat(time) {
  const timeHour = Math.trunc(time);
  const timeMinutes = Math.trunc(60 * (time - timeHour))

  return `${timeHour}:${timeMinutes < 10 ? "0" + timeMinutes : timeMinutes}`
}