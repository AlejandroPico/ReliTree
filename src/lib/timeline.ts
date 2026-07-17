export interface TimelineStop {
  year: number;
  y: number;
  major: boolean;
}

export const PRESENT_YEAR = 2026;
export const WORLD_TOP = 150;
export const WORLD_BOTTOM = 14_450;

export const timelineStops: TimelineStop[] = [
  { year: 2026, y: 180, major: true },
  { year: 2000, y: 270, major: false },
  { year: 1800, y: 570, major: true },
  { year: 1600, y: 870, major: false },
  { year: 1400, y: 1_170, major: true },
  { year: 1200, y: 1_470, major: false },
  { year: 1000, y: 1_770, major: true },
  { year: 800, y: 2_070, major: false },
  { year: 600, y: 2_370, major: true },
  { year: 400, y: 2_670, major: false },
  { year: 200, y: 2_970, major: false },
  { year: 1, y: 3_270, major: true },
  { year: -200, y: 3_570, major: false },
  { year: -400, y: 3_870, major: true },
  { year: -600, y: 4_170, major: false },
  { year: -800, y: 4_470, major: false },
  { year: -1000, y: 4_770, major: true },
  { year: -1500, y: 5_180, major: false },
  { year: -2000, y: 5_590, major: true },
  { year: -2500, y: 6_000, major: false },
  { year: -3000, y: 6_410, major: true },
  { year: -3500, y: 6_820, major: false },
  { year: -4000, y: 7_230, major: true },
  { year: -5000, y: 7_720, major: true },
  { year: -6000, y: 8_170, major: false },
  { year: -7000, y: 8_570, major: true },
  { year: -8000, y: 8_940, major: false },
  { year: -10_000, y: 9_410, major: true },
  { year: -12_500, y: 9_800, major: false },
  { year: -15_000, y: 10_170, major: true },
  { year: -20_000, y: 10_650, major: true },
  { year: -25_000, y: 11_020, major: false },
  { year: -30_000, y: 11_340, major: true },
  { year: -40_000, y: 11_750, major: false },
  { year: -50_000, y: 12_080, major: true },
  { year: -60_000, y: 12_350, major: false },
  { year: -70_000, y: 12_600, major: true },
  { year: -90_000, y: 12_900, major: false },
  { year: -120_000, y: 13_220, major: true },
  { year: -180_000, y: 13_580, major: false },
  { year: -240_000, y: 13_850, major: true },
  { year: -325_000, y: 14_130, major: false },
  { year: -400_000, y: 14_360, major: true }
];

export function yearToY(year: number): number {
  const clamped = Math.max(timelineStops.at(-1)!.year, Math.min(PRESENT_YEAR, year));
  for (let index = 0; index < timelineStops.length - 1; index += 1) {
    const upper = timelineStops[index];
    const lower = timelineStops[index + 1];
    if (clamped <= upper.year && clamped >= lower.year) {
      const ratio = (upper.year - clamped) / (upper.year - lower.year);
      return upper.y + ratio * (lower.y - upper.y);
    }
  }
  return timelineStops.at(-1)!.y;
}

export function yToYear(y: number): number {
  const clamped = Math.max(timelineStops[0].y, Math.min(timelineStops.at(-1)!.y, y));
  for (let index = 0; index < timelineStops.length - 1; index += 1) {
    const upper = timelineStops[index];
    const lower = timelineStops[index + 1];
    if (clamped >= upper.y && clamped <= lower.y) {
      const ratio = (clamped - upper.y) / (lower.y - upper.y);
      return Math.round(upper.year - ratio * (upper.year - lower.year));
    }
  }
  return timelineStops.at(-1)!.year;
}

export function formatYear(year: number, compact = false): string {
  if (year === 1 || year === 0) return 'cambio de era';
  if (year > 0) return `${year.toLocaleString('es-ES')} e. c.`;
  const absolute = Math.abs(year);
  if (compact && absolute >= 10_000) return `${Math.round(absolute / 1000)} ka`;
  return `${absolute.toLocaleString('es-ES')} a. e. c.`;
}

export function dateRange(startYear: number, endYear: number | null): string {
  const start = `desde ${formatYear(startYear)}`;
  return endYear === null ? `${start} · tradición activa` : `${start} hasta ${formatYear(endYear)}`;
}
