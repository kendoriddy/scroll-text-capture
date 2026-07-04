"use client";

import { useCallback, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import {
  CameraViewport,
  type CameraViewportHandle,
} from "@/components/CameraViewport";
import { CaptureButton } from "@/components/CaptureButton";
import { TextEditor } from "@/components/TextEditor";
import { Toolbar } from "@/components/Toolbar";
import { cropToDataUrl } from "@/lib/cropImage";

export default function Home() {
  const viewportRef = useRef<CameraViewportHandle>(null);
  const [accumulatedText, setAccumulatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    videoRef,
    imageRef,
    isLoading,
    cameraDenied,
    imageUrl,
    mode,
    startCamera,
    setImageFile,
    getSourceElement,
  } = useCamera();

  const handleCapture = useCallback(async () => {
    const source = getSourceElement();
    const rect = viewportRef.current?.getFocusRect();
    if (!source || !rect) return;

    if (source instanceof HTMLVideoElement && source.readyState < 2) {
      setError("Camera not ready. Please wait a moment.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const image = cropToDataUrl(source, rect);
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not read text. Please try again.");
      }

      const newText = (data.text as string)?.trim();
      if (newText) {
        setAccumulatedText((prev) =>
          prev ? `${prev}\n\n${newText}` : newText,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not read text — try adjusting the focus box.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [getSourceElement]);

  const canCapture =
    !isLoading && (mode === "camera" || (mode === "image" && !!imageUrl));

  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 px-4 py-3 text-center dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Scroll Text Capture
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Frame text, capture, scroll, repeat
        </p>
      </header>

      <CameraViewport
        ref={viewportRef}
        videoRef={videoRef}
        imageRef={imageRef}
        isLoading={isLoading}
        cameraDenied={cameraDenied}
        imageUrl={imageUrl}
        mode={mode}
        onImageFile={setImageFile}
        onRetryCamera={startCamera}
      />

      {error && (
        <div
          className="mx-4 mt-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <TextEditor
        value={accumulatedText}
        onChange={setAccumulatedText}
        isProcessing={isProcessing}
      />

      <Toolbar text={accumulatedText} onClear={() => setAccumulatedText("")} />

      <CaptureButton
        onCapture={handleCapture}
        isProcessing={isProcessing}
        disabled={!canCapture}
      />
    </div>
  );
}
