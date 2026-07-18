import type { AtlasData, CrossRelation, PositionedTradition, Region, RegionId, Tradition } from '../data/types';
import { PRESENT_YEAR, WORLD_BOTTOM, yearToY } from './timeline';

export const REGION_WIDTH = 760;
export const WORLD_LEFT = 140;
export const WORLD_WIDTH = WORLD_LEFT + REGION_WIDTH * 12 + 120;
export const WORLD_HEIGHT = WORLD_BOTTOM + 120;

export function regionWidth(region: Region): number {
  return Math.max(180, Math.min(3000, Number(region.width) || REGION_WIDTH));
}

export function orderedRegions(regions: Region[]): Region[] {
  return [...regions].sort((a, b) => a.order - b.order);
}

export function regionX(region: Region, regions: Region[] = []): number {
  if (!regions.length) return WORLD_LEFT + region.order * regionWidth(region);
  return WORLD_LEFT + orderedRegions(regions)
    .filter((entry) => entry.order < region.order)
    .reduce((total, entry) => total + regionWidth(entry), 0);
}

export function worldWidth(regions: Region[]): number {
  return WORLD_LEFT + orderedRegions(regions).reduce((total, region) => total + regionWidth(region), 0) + 120;
}

export function traditionX(tradition: Tradition, region: Region, regions: Region[]): number {
  const width = regionWidth(region);
  const usableWidth = width - 110;
  const percent = tradition.placement?.xPercent ?? tradition.lane * 100;
  return regionX(region, regions) + 55 + Math.max(0, Math.min(100, percent)) / 100 * usableWidth + (tradition.placement?.offsetX ?? 0);
}

export function positionTraditions(data: AtlasData): PositionedTradition[] {
  const regions = new Map(data.regions.map((region) => [region.id, region]));
  const placed: PositionedTradition[] = [];
  for (const tradition of data.traditions) {
    const primaryRegionId = tradition.placement?.regionId ?? tradition.regionId;
    const region = regions.get(primaryRegionId);
    if (!region) throw new Error(`Región desconocida: ${tradition.regionId}`);
    const baseX = traditionX(tradition, region, data.regions);
    const startY = yearToY(tradition.startYear) + (tradition.placement?.offsetY ?? 0);
    const endY = yearToY(tradition.endYear ?? PRESENT_YEAR);
    let x = baseX;
    if (tradition.placement?.autoAvoidOverlap !== false) {
      const width = regionWidth(region);
      const left = regionX(region, data.regions) + 34;
      const right = left + width - 68;
      const candidates = [0, 82, -82, 164, -164, 246, -246, 328, -328];
      const collision = (candidate: number) => placed.some((entry) => entry.region.id === region.id
        && Math.abs(entry.startY - startY) < 42
        && Math.abs(entry.x - candidate) < 76);
      x = candidates.map((offset) => Math.max(left, Math.min(right, baseX + offset))).find((candidate) => !collision(candidate)) ?? baseX;
    }
    placed.push({
      ...tradition,
      x,
      startY,
      endY,
      labelY: startY,
      region
    });
  }
  return placed;
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

export interface RelationPoint { x: number; y: number; regionId?: RegionId; color?: string }

export function relationPoints(source: PositionedTradition, target: PositionedTradition, relation: CrossRelation, regions: Region[]): RelationPoint[] {
  const sourceY = Math.min(source.startY, Math.max(source.endY, target.startY));
  const targetY = target.startY;
  const waypoints = (relation.visual?.waypoints ?? []).map((waypoint) => {
    const region = regions.find((entry) => entry.id === waypoint.regionId) ?? source.region;
    const width = regionWidth(region);
    const percent = Math.max(0, Math.min(100, waypoint.xPercent ?? 50));
    return {
      x: regionX(region, regions) + 55 + percent / 100 * (width - 110) + (waypoint.offsetX ?? 0),
      y: yearToY(waypoint.year) + (waypoint.offsetY ?? 0),
      regionId: region.id,
      color: waypoint.color ?? region.color
    };
  });
  return [
    { x: source.x, y: sourceY, regionId: source.region.id, color: source.visual?.color ?? source.region.color },
    ...waypoints,
    { x: target.x, y: targetY, regionId: target.region.id, color: target.visual?.color ?? target.region.color }
  ];
}

export function styledRelationPath(source: PositionedTradition, target: PositionedTradition, relation: AtlasData['relations'][number], regions: Region[] = [source.region, target.region]): string {
  const points = relationPoints(source, target, relation, regions);
  const first = points[0];
  const last = points.at(-1)!;
  if (points.length > 2) {
    if (relation.visual?.route === 'straight') return `M ${first.x} ${first.y} ${points.slice(1).map((point) => `L ${point.x} ${point.y}`).join(' ')}`;
    if (relation.visual?.route === 'orthogonal') {
      let path = `M ${first.x} ${first.y}`;
      let previous = first;
      for (const point of points.slice(1)) {
        const middleY = (previous.y + point.y) / 2;
        path += ` L ${previous.x} ${middleY} L ${point.x} ${middleY} L ${point.x} ${point.y}`;
        previous = point;
      }
      return path;
    }
    let path = `M ${first.x} ${first.y}`;
    for (let index = 1; index < points.length - 1; index++) {
      const point = points[index];
      const next = points[index + 1];
      const middle = { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 };
      path += ` Q ${point.x} ${point.y} ${middle.x} ${middle.y}`;
    }
    const penultimate = points.at(-2)!;
    path += ` Q ${penultimate.x} ${penultimate.y} ${last.x} ${last.y}`;
    return path;
  }
  const sourceY = first.y;
  const targetY = last.y;
  const mx = (source.x + target.x) / 2 + (relation.visual?.midpointOffsetX ?? 0);
  const my = (sourceY + targetY) / 2 + (relation.visual?.midpointOffsetY ?? 0);
  if (relation.visual?.route === 'straight') return `M ${first.x} ${sourceY} L ${last.x} ${targetY}`;
  if (relation.visual?.route === 'orthogonal') return `M ${first.x} ${sourceY} L ${first.x} ${my} L ${last.x} ${my} L ${last.x} ${targetY}`;
  const curve = Math.max(0, Math.min(1, relation.visual?.curve ?? .5));
  const c1y = sourceY + (my - sourceY) * curve;
  const c2y = targetY + (my - targetY) * curve;
  return `M ${first.x} ${sourceY} C ${first.x} ${c1y}, ${mx} ${my}, ${mx} ${my} S ${last.x} ${c2y}, ${last.x} ${targetY}`;
}

export function regionBounds(regionId: RegionId, regions: Region[]): { x: number; width: number } {
  const region = regions.find((entry) => entry.id === regionId);
  if (!region) return { x: WORLD_LEFT, width: REGION_WIDTH };
  return { x: regionX(region, regions), width: regionWidth(region) };
}
