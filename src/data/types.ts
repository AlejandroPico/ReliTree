export type RegionId =
  | 'africa'
  | 'europe'
  | 'middle-east'
  | 'north-eurasia'
  | 'south-asia'
  | 'east-asia'
  | 'southeast-asia'
  | 'oceania'
  | 'pacific'
  | 'north-america'
  | 'mesoamerica'
  | 'south-america';

export type TraditionKind =
  | 'substrate'
  | 'religion'
  | 'denomination'
  | 'philosophy'
  | 'movement'
  | 'folk'
  | 'ritual-complex';

export type TraditionStatus = 'active' | 'historical' | 'reconstructed' | 'disputed';
export type DatePrecision = 'year' | 'decade' | 'century' | 'millennium' | 'deep-time' | 'disputed';
export type RelationKind = 'descent' | 'reform' | 'influence' | 'syncretism' | 'context' | 'migration';
export type RelationRole = 'primary' | 'secondary' | 'hypothetical' | 'fusion' | 'migration';
export type RelationRoute = 'curve' | 'orthogonal' | 'straight';
export type Confidence = 'high' | 'medium' | 'low' | 'hypothesis';
export type SourceId = 'poster-3' | 'poster-beta' | 'wikipedia-list' | 'academic-synthesis';

export interface ElementVisualStyle {
  color?: string;
  lineWidth?: number;
  lineDash?: string;
  opacity?: number;
  nodeRadius?: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
  parentLineColor?: string;
  parentLineWidth?: number;
  parentLineDash?: string;
  hidden?: boolean;
  gradientColors?: string[];
  route?: RelationRoute;
  curve?: number;
  midpointOffsetX?: number;
  midpointOffsetY?: number;
}

export interface EntityPlacement {
  regionId?: RegionId;
  xPercent?: number;
  offsetX?: number;
  offsetY?: number;
  autoAvoidOverlap?: boolean;
}

export interface EntityIcon {
  path?: string | null;
  embeddedDataUrl?: string | null;
  resolvedPath?: string | null;
  scale?: number;
}

export interface EntityDetails {
  overview?: string;
  history?: string;
  beliefs?: string;
  evidence?: string;
  bibliography?: string;
}

export interface Region {
  id: RegionId;
  name: string;
  shortName: string;
  color: string;
  order: number;
  scope: string;
  width?: number;
  minLaneGap?: number;
}

export interface Tradition {
  id: string;
  name: string;
  subtitle: string;
  alternativeNames: string[];
  regionId: RegionId;
  regionIds?: RegionId[];
  parentId: string | null;
  startYear: number;
  endYear: number | null;
  lane: number;
  kind: TraditionKind;
  status: TraditionStatus;
  precision: DatePrecision;
  confidence: Confidence;
  family: string;
  summary: string;
  relationToParent: RelationKind | null;
  sources: SourceId[];
  posterVerified: boolean;
  verifierMatched: boolean;
  importance: 1 | 2 | 3;
  placement?: EntityPlacement;
  icon?: EntityIcon;
  details?: EntityDetails;
  visual?: ElementVisualStyle;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  regionIds: RegionId[];
  kind: 'migration' | 'contact' | 'state' | 'text' | 'conflict' | 'exchange' | 'archaeology';
  summary: string;
  confidence: Confidence;
  visual?: ElementVisualStyle;
}

export interface CrossRelation {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationKind;
  confidence: Confidence;
  note: string;
  role?: RelationRole;
  strength?: number;
  visual?: ElementVisualStyle;
}

export interface VerifierEntry {
  name: string;
  section: string;
  depth: number;
}

export interface AtlasData {
  metadata: {
    generatedAt: string;
    version: string;
    presentYear: number;
    referenceNotice: string;
    timelineStops?: Array<{ year: number; major?: boolean; label?: string }>;
  };
  regions: Region[];
  traditions: Tradition[];
  events: HistoricalEvent[];
  relations: CrossRelation[];
}

export interface Camera {
  x: number;
  y: number;
  scale: number;
}

export interface PositionedTradition extends Tradition {
  x: number;
  startY: number;
  endY: number;
  labelY: number;
  region: Region;
}
