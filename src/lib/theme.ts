export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function resolveSolarTheme(date = new Date(), latitude = 41.3874): ResolvedTheme {
  const day = dayOfYear(date);
  const seasonal = Math.cos(((day - 172) / 365.25) * Math.PI * 2);
  const daylight = 12 + 4.2 * Math.cos((latitude * Math.PI) / 180) * seasonal;
  const sunrise = 12 - daylight / 2;
  const sunset = 12 + daylight / 2;
  const hour = date.getHours() + date.getMinutes() / 60;
  return hour >= sunrise && hour < sunset ? 'light' : 'dark';
}
