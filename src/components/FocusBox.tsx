"use client";

import type { Rect, ResizeHandle } from "@/lib/types";

interface FocusBoxProps {
  rect: Rect;
  onDragStart: (clientX: number, clientY: number) => void;
  onResizeStart: (
    handle: ResizeHandle,
    clientX: number,
    clientY: number,
  ) => void;
}

const HANDLE_POSITIONS: Record<ResizeHandle, string> = {
  nw: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
  ne: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
  sw: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
  se: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
};

export function FocusBox({ rect, onDragStart, onResizeStart }: FocusBoxProps) {
  const { x, y, width, height } = rect;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Dim overlay panels */}
      <div
        className="absolute left-0 right-0 top-0 bg-black/50"
        style={{ height: y }}
      />
      <div
        className="absolute left-0 bg-black/50"
        style={{ top: y, width: x, height }}
      />
      <div
        className="absolute bg-black/50"
        style={{ top: y, left: x + width, right: 0, height }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/50"
        style={{ top: y + height }}
      />

      {/* Focus box */}
      <div
        className="pointer-events-auto absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{ left: x, top: y, width, height }}
        onPointerDown={(e) => {
          e.preventDefault();
          onDragStart(e.clientX, e.clientY);
        }}
        role="region"
        aria-label="Focus area for text capture"
      >
        {(Object.keys(HANDLE_POSITIONS) as ResizeHandle[]).map((handle) => (
          <div
            key={handle}
            className={`absolute h-5 w-5 rounded-full border-2 border-white bg-blue-500 touch-none ${HANDLE_POSITIONS[handle]}`}
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onResizeStart(handle, e.clientX, e.clientY);
            }}
            aria-label={`Resize ${handle} corner`}
          />
        ))}
      </div>
    </div>
  );
}
