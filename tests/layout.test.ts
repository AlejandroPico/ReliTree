import { describe, expect, it } from 'vitest';
import type { AtlasData, Region, Tradition } from '../src/data/types';
import { positionTraditions, relationPoints, regionWidth, regionX, styledRelationPath, worldWidth, WORLD_LEFT } from '../src/lib/layout';

const regions = [
  { id: 'africa', name: 'África', shortName: 'África', color: '#aa8', order: 0, scope: '', width: 500 },
  { id: 'europe', name: 'Europa', shortName: 'Europa', color: '#5a7', order: 1, scope: '', width: 900 }
] as Region[];

function entity(id: string): Tradition {
  return {
    id, name: id, subtitle: 'subtítulo', alternativeNames: [], regionId: 'africa', regionIds: ['africa'], parentId: null,
    startYear: 1000, endYear: null, lane: .5, placement: { regionId: 'africa', xPercent: 50, autoAvoidOverlap: true },
    kind: 'religion', status: 'active', precision: 'year', confidence: 'high', family: '', summary: '', relationToParent: null,
    sources: [], posterVerified: false, verifierMatched: false, importance: 1
  };
}

describe('layout geográfico variable', () => {
  it('acumula anchuras independientes por región', () => {
    expect(regionWidth(regions[0])).toBe(500);
    expect(regionX(regions[1], regions)).toBe(WORLD_LEFT + 500);
    expect(worldWidth(regions)).toBe(WORLD_LEFT + 500 + 900 + 120);
  });

  it('separa entidades coincidentes sin cambiar sus datos editoriales', () => {
    const first = entity('a');
    const second = entity('b');
    const atlas: AtlasData = {
      regions, traditions: [first, second], events: [], relations: [],
      metadata: { generatedAt: '', version: 'test', presentYear: 2026, referenceNotice: '' }
    };
    const positioned = positionTraditions(atlas);
    expect(positioned[0].startY).toBe(positioned[1].startY);
    expect(Math.abs(positioned[0].x - positioned[1].x)).toBeGreaterThanOrEqual(76);
    expect(first.placement?.xPercent).toBe(50);
    expect(second.placement?.xPercent).toBe(50);
  });

  it('mantiene los extremos unidos y sitúa puntos de paso por territorio y fecha', () => {
    const source = entity('origen');
    const target: Tradition = { ...entity('destino'), regionId: 'europe', regionIds: ['europe'], placement: { regionId: 'europe', xPercent: 75, autoAvoidOverlap: false }, startYear: 1500 };
    const atlas: AtlasData = {
      regions, traditions: [source, target], events: [], relations: [],
      metadata: { generatedAt: '', version: 'test', presentYear: 2026, referenceNotice: '' }
    };
    const positioned = positionTraditions(atlas);
    const relation = {
      id: 'ruta', sourceId: 'origen', targetId: 'destino', kind: 'migration' as const, confidence: 'high' as const, note: '',
      visual: { route: 'straight' as const, waypoints: [{ regionId: 'europe', year: 1200, xPercent: 25, color: '#123456' }] }
    };
    const points = relationPoints(positioned[0], positioned[1], relation, regions);
    expect(points).toHaveLength(3);
    expect(points[0].x).toBe(positioned[0].x);
    expect(points[2].x).toBe(positioned[1].x);
    expect(points[1].regionId).toBe('europe');
    expect(points[1].color).toBe('#123456');
    expect(styledRelationPath(positioned[0], positioned[1], relation, regions)).toContain(`L ${points[1].x} ${points[1].y}`);
  });
});
