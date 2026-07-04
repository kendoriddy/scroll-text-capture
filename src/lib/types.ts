export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FocusArea {
  rect: Rect;
  rotation: number;
}

export type ResizeHandle = "nw" | "ne" | "sw" | "se";
