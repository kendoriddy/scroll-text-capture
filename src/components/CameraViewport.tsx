"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { FocusBox } from "./FocusBox";
import { useFocusBox } from "@/hooks/useFocusBox";
import type { Rect } from "@/lib/types";

export interface CameraViewportHandle {
  getFocusRect: () => Rect;
}

interface CameraViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
  isLoading: boolean;
  cameraDenied: boolean;
  imageUrl: string | null;
  mode: "camera" | "image";
  onImageFile: (file: File) => void;
  onRetryCamera: () => void;
}

export const CameraViewport = forwardRef<
  CameraViewportHandle,
  CameraViewportProps
>(function CameraViewport(
  {
    videoRef,
    imageRef,
    isLoading,
    cameraDenied,
    imageUrl,
    mode,
    onImageFile,
    onRetryCamera,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { rect, onDragStart, onResizeStart } = useFocusBox(containerRef);

  useImperativeHandle(ref, () => ({ getFocusRect: () => rect }), [rect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageFile(file);
    e.target.value = "";
  };

  const showSource = !isLoading && (mode === "camera" || imageUrl);

  return (
    <div
      ref={containerRef}
      className="relative h-[45vh] min-h-[240px] w-full overflow-hidden bg-zinc-900"
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      )}

      {mode === "camera" && (
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${isLoading ? "invisible" : ""}`}
          playsInline
          muted
          autoPlay
        />
      )}

      {mode === "image" && imageUrl && (
        // Native img required for canvas crop from blob URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Uploaded screenshot"
          className="h-full w-full object-cover"
        />
      )}

      {showSource && (
        <FocusBox
          rect={rect}
          onDragStart={onDragStart}
          onResizeStart={onResizeStart}
        />
      )}

      <div className="absolute bottom-3 left-3 right-3 z-30 flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-800/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
          aria-label="Upload screenshot"
        >
          <ImageUp className="h-4 w-4" />
          Upload
        </button>
        {cameraDenied && (
          <button
            type="button"
            onClick={onRetryCamera}
            className="min-h-11 rounded-lg bg-zinc-800/90 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
          >
            Retry Camera
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
});
