import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const project = JSON.parse(readFileSync(new URL('../data/reli-tree-project.json', import.meta.url), 'utf8'));

describe('plantilla de Atlas Studio', () => {
  it('separa el color semántico del fondo de cada zona', () => {
    expect(project.schemaVersion).toBe(4);
    expect(project.application).toBe('Atlas Studio');
    for (const region of project.atlas.regions) {
      expect(region.appearance.fillColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(region.appearance.fillOpacity).toBeGreaterThanOrEqual(0);
      expect(region.appearance.fillOpacity).toBeLessThanOrEqual(1);
      expect(region.appearance.fillOpacity).toBeLessThan(.1);
    }
  });

  it('conserva dimensiones transformables para la referencia', () => {
    const reference = project.editor.reference;
    expect(reference.width).toBeGreaterThan(0);
    expect(reference.height).toBeGreaterThan(0);
    expect(reference.aspectRatio).toBeCloseTo(reference.width / reference.height);
    expect(reference.lockAspect).toBe(true);
  });
});
