export const DAY = {
  sunday: 1 << 0,
  monday: 1 << 1,
  tuesday: 1 << 2,
  wednesday: 1 << 3,
  thursday: 1 << 4,
  friday: 1 << 5,
  saturday: 1 << 6,
};
export enum TIME_OF_DAY {
  morning = 1,
  afternoon = 2,
  evening = 3,
}
export const EVERY_DAY = Object.values(DAY).reduce((x, y) => x | y, 0);
export function DayValue(days: number[]) {
  return days.reduce((x, y) => x | y);
}
export function IsDayChecked(value: number, day: number) {
  return !!(value & day);
}
