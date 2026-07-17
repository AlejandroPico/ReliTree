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
export type Confidence = 'high' | 'medium' | 'low' | 'hypothesis';
export type SourceId = 'poster-3' | 'poster-beta' | 'wikipedia-list' | 'academic-synthesis';

export interface Region {
  id: RegionId;
  name: string;
  shortName: string;
  color: string;
  order: number;
  scope: string;
}

export interface Tradition {
  id: string;
  name: string;
  alternativeNames: string[];
  regionId: RegionId;
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
}

export interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  regionIds: RegionId[];
  kind: 'migration' | 'contact' | 'state' | 'text' | 'conflict' | 'exchange' | 'archaeology';
  summary: string;
  confidence: Confidence;
}

export interface CrossRelation {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationKind;
  confidence: Confidence;
  note: string;
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
