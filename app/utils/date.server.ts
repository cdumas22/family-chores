export function formatISODateWithOffset(request: Request, date: Date) {
  return dateWithOffset(request, date).toISOString();
}
export function dateWithOffset(request: Request, date: Date) {
  const clockOffset = request.headers.get("Cookie")?.match(/clockOffset=(\d+)/);
  return clockOffset ? offsetDate(date, Number(clockOffset[1])) : date;
}
function offsetDate(date: Date, offset: number = 0) {
  date.setMinutes(date.getMinutes() + offset + new Date().getTimezoneOffset());
  return date;
}
