import { describe, expect, it } from 'vitest';
import { formatYear, yearToY, yToYear } from '../src/lib/timeline';

describe('escala temporal', () => {
  it('mantiene el presente arriba y la prehistoria abajo', () => {
    expect(yearToY(2026)).toBeLessThan(yearToY(0));
    expect(yearToY(0)).toBeLessThan(yearToY(-10_000));
  });

  it('es aproximadamente reversible', () => {
    for (const year of [2026, 1700, 622, 1, -500, -3200, -12_000, -70_000, -300_000]) {
      expect(Math.abs(yToYear(yearToY(year)) - year)).toBeLessThanOrEqual(1);
    }
  });

  it('formatea las eras en español', () => {
    expect(formatYear(622)).toContain('e. c.');
    expect(formatYear(-2500)).toContain('a. e. c.');
  });
});
