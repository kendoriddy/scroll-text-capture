"use client";

import { useCallback, useEffect, useState } from "react";
import type { Rect, ResizeHandle } from "@/lib/types";

const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;

function defaultRect(containerWidth: number, containerHeight: number): Rect {
  const width = containerWidth * 0.8;
  const height = containerHeight * 0.3;
  return {
    x: (containerWidth - width) / 2,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
}

function pointerAngleDeg(
  clientX: number,
  clientY: number,
  centerX: number,
  centerY: number,
  containerLeft: number,
  containerTop: number,
): number {
  const x = clientX - containerLeft - centerX;
  const y = clientY - containerTop - centerY;
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function useFocusBox(containerRef: React.RefObject<HTMLElement | null>) {
  const [rect, setRect] = useState<Rect>({
    x: 0,
    y: 0,
    width: 200,
    height: 80,
  });
  const [rotation, setRotation] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || initialized) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setRect(defaultRect(width, height));
        setInitialized(true);
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, initialized]);

  const clampRect = useCallback(
    (r: Rect, maxW: number, maxH: number): Rect => ({
      x: Math.max(0, Math.min(r.x, maxW - MIN_WIDTH)),
      y: Math.max(0, Math.min(r.y, maxH - MIN_HEIGHT)),
      width: Math.max(MIN_WIDTH, Math.min(r.width, maxW - r.x)),
      height: Math.max(MIN_HEIGHT, Math.min(r.height, maxH - r.y)),
    }),
    [],
  );

  const onDragStart = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;

      const bounds = el.getBoundingClientRect();
      const startX = clientX;
      const startY = clientY;
      const startRect = { ...rect };

      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        setRect(
          clampRect(
            {
              ...startRect,
              x: startRect.x + dx,
              y: startRect.y + dy,
            },
            bounds.width,
            bounds.height,
          ),
        );
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [containerRef, rect, clampRect],
  );

  const onResizeStart = useCallback(
    (handle: ResizeHandle, clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;

      const bounds = el.getBoundingClientRect();
      const startX = clientX;
      const startY = clientY;
      const startRect = { ...rect };

      const onMove = (e: PointerEvent) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const next = { ...startRect };

        if (handle.includes("n")) {
          const newY = startRect.y + dy;
          const newH = startRect.height - dy;
          if (newH >= MIN_HEIGHT) {
            next.y = newY;
            next.height = newH;
          }
        }
        if (handle.includes("s")) {
          next.height = Math.max(MIN_HEIGHT, startRect.height + dy);
        }
        if (handle.includes("w")) {
          const newX = startRect.x + dx;
          const newW = startRect.width - dx;
          if (newW >= MIN_WIDTH) {
            next.x = newX;
            next.width = newW;
          }
        }
        if (handle.includes("e")) {
          next.width = Math.max(MIN_WIDTH, startRect.width + dx);
        }

        setRect(clampRect(next, bounds.width, bounds.height));
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [containerRef, rect, clampRect],
  );

  const onRotateStart = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;

      const bounds = el.getBoundingClientRect();
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const startAngle = pointerAngleDeg(
        clientX,
        clientY,
        centerX,
        centerY,
        bounds.left,
        bounds.top,
      );
      const startRotation = rotation;

      const onMove = (e: PointerEvent) => {
        const currentAngle = pointerAngleDeg(
          e.clientX,
          e.clientY,
          centerX,
          centerY,
          bounds.left,
          bounds.top,
        );
        setRotation(startRotation + (currentAngle - startAngle));
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [containerRef, rect, rotation],
  );

  return { rect, rotation, onDragStart, onResizeStart, onRotateStart };
}
