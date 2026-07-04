import type { Rect } from "./types";

function getSourceDimensions(source: HTMLVideoElement | HTMLImageElement): {
  width: number;
  height: number;
} {
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth, height: source.videoHeight };
  }
  return { width: source.naturalWidth, height: source.naturalHeight };
}

/** Maps a display-space rect to source pixel coords (object-fit: cover). */
export function mapDisplayRectToSourcePixels(
  source: HTMLVideoElement | HTMLImageElement,
  rect: Rect,
): { sx: number; sy: number; sw: number; sh: number } {
  const displayWidth = source.clientWidth;
  const displayHeight = source.clientHeight;
  const { width: sourceWidth, height: sourceHeight } =
    getSourceDimensions(source);

  if (!displayWidth || !displayHeight || !sourceWidth || !sourceHeight) {
    return { sx: 0, sy: 0, sw: sourceWidth, sh: sourceHeight };
  }

  const sourceAspect = sourceWidth / sourceHeight;
  const displayAspect = displayWidth / displayHeight;

  let renderedWidth: number;
  let renderedHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (sourceAspect > displayAspect) {
    renderedHeight = displayHeight;
    renderedWidth = displayHeight * sourceAspect;
    offsetX = (displayWidth - renderedWidth) / 2;
    offsetY = 0;
  } else {
    renderedWidth = displayWidth;
    renderedHeight = displayWidth / sourceAspect;
    offsetX = 0;
    offsetY = (displayHeight - renderedHeight) / 2;
  }

  const scaleX = sourceWidth / renderedWidth;
  const scaleY = sourceHeight / renderedHeight;

  const sx = Math.max(0, (rect.x - offsetX) * scaleX);
  const sy = Math.max(0, (rect.y - offsetY) * scaleY);
  const sw = Math.min(sourceWidth - sx, rect.width * scaleX);
  const sh = Math.min(sourceHeight - sy, rect.height * scaleY);

  return { sx, sy, sw, sh };
}

export function cropToDataUrl(
  source: HTMLVideoElement | HTMLImageElement,
  rect: Rect,
): string {
  const { sx, sy, sw, sh } = mapDisplayRectToSourcePixels(source, rect);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(rect.width));
  canvas.height = Math.max(1, Math.round(rect.height));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/jpeg", 0.85);
}
