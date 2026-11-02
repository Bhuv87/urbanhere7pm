export type LayoutItemType = 'House' | 'Park' | 'Road' | 'Water Pipe' | string;

export interface LayoutItem {
  id: string;
  type: LayoutItemType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
}

export type LayoutTransformMode = 'translate' | 'rotate' | 'scale';
