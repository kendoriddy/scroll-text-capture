"use client";

import { RotateCw } from "lucide-react";
import type { Rect, ResizeHandle } from "@/lib/types";

interface FocusBoxProps {
  rect: Rect;
  rotation: number;
  onDragStart: (clientX: number, clientY: number) => void;
  onResizeStart: (
    handle: ResizeHandle,
    clientX: number,
    clientY: number,
  ) => void;
  onRotateStart: (clientX: number, clientY: number) => void;
}

const HANDLE_POSITIONS: Record<ResizeHandle, string> = {
  nw: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
  ne: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
  sw: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",
  se: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
};

export function FocusBox({
  rect,
  rotation,
  onDragStart,
  onResizeStart,
  onRotateStart,
}: FocusBoxProps) {
  const { x, y, width, height } = rect;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div
        className="pointer-events-auto absolute border-2 border-white"
        style={{
          left: x,
          top: y,
          width,
          height,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        }}
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

        <div
          className="absolute left-1/2 top-0 flex h-6 w-6 -translate-x-1/2 -translate-y-[calc(100%+8px)] cursor-grab items-center justify-center rounded-full border-2 border-white bg-amber-500 touch-none active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRotateStart(e.clientX, e.clientY);
          }}
          aria-label="Rotate focus area"
        >
          <RotateCw className="h-3 w-3 text-white" />
        </div>
      </div>
    </div>
  );
}
