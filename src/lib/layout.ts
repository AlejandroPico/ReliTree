import type { AtlasData, PositionedTradition, Region, RegionId, Tradition } from '../data/types';
import { PRESENT_YEAR, WORLD_BOTTOM, yearToY } from './timeline';

export const REGION_WIDTH = 760;
export const WORLD_LEFT = 140;
export const WORLD_WIDTH = WORLD_LEFT + REGION_WIDTH * 12 + 120;
export const WORLD_HEIGHT = WORLD_BOTTOM + 120;

export function regionX(region: Region): number {
  return WORLD_LEFT + region.order * REGION_WIDTH;
}

export function traditionX(tradition: Tradition, region: Region): number {
  const usableWidth = REGION_WIDTH - 110;
  return regionX(region) + 55 + Math.max(0, Math.min(1, tradition.lane)) * usableWidth;
}

export function positionTraditions(data: AtlasData): PositionedTradition[] {
  const regions = new Map(data.regions.map((region) => [region.id, region]));
  return data.traditions.map((tradition) => {
    const region = regions.get(tradition.regionId);
    if (!region) throw new Error(`Región desconocida: ${tradition.regionId}`);
    const startY = yearToY(tradition.startYear);
    const endY = yearToY(tradition.endYear ?? PRESENT_YEAR);
    return {
      ...tradition,
      x: traditionX(tradition, region),
      startY,
      endY,
      labelY: startY,
      region
    };
  });
}

export function parentPath(child: PositionedTradition, parent: PositionedTradition): string {
  const y = child.startY;
  const bend = Math.max(18, Math.min(64, Math.abs(child.x - parent.x) * 0.22));
  return `M ${parent.x} ${y} C ${parent.x} ${y - bend}, ${child.x} ${y - bend}, ${child.x} ${y}`;
}

export function relationPath(source: PositionedTradition, target: PositionedTradition): string {
  const sourceY = Math.min(source.startY, Math.max(source.endY, target.startY));
  const targetY = target.startY;
  const middleY = (sourceY + targetY) / 2;
  return `M ${source.x} ${sourceY} C ${source.x} ${middleY}, ${target.x} ${middleY}, ${target.x} ${targetY}`;
}

export function regionBounds(regionId: RegionId, regions: Region[]): { x: number; width: number } {
  const region = regions.find((entry) => entry.id === regionId);
  if (!region) return { x: WORLD_LEFT, width: REGION_WIDTH };
  return { x: regionX(region), width: REGION_WIDTH };
}
