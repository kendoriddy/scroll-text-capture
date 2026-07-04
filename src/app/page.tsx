"use client";

import { useCallback, useRef, useState } from "react";
import { useCamera } from "@/hooks/useCamera";
import {
  CameraViewport,
  type CameraViewportHandle,
} from "@/components/CameraViewport";
import { CaptureButtons } from "@/components/CaptureButtons";
import { TextEditor } from "@/components/TextEditor";
import { Toolbar } from "@/components/Toolbar";
import { AnswerPanel } from "@/components/AnswerPanel";
import { cropToDataUrl } from "@/lib/cropImage";

async function fetchAnswer(text: string): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Could not get an answer.");
  }

  return (data.answer as string)?.trim() || "No answer returned.";
}

export default function Home() {
  const viewportRef = useRef<CameraViewportHandle>(null);
  const [accumulatedText, setAccumulatedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

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
    ensureVideoReady,
  } = useCamera();

  const performCapture = useCallback(async (): Promise<string> => {
    const focusArea = viewportRef.current?.getFocusArea();
    if (!focusArea) throw new Error("Focus area not ready.");

    let source = getSourceElement();

    if (mode === "camera") {
      const video = await ensureVideoReady();
      if (!video) {
        throw new Error(
          "Camera not ready. Please wait a moment and try again.",
        );
      }
      source = video;
    }

    if (!source) throw new Error("No image source available.");

    if (source instanceof HTMLImageElement && !source.complete) {
      throw new Error("Image not loaded yet. Please wait a moment.");
    }

    const image = cropToDataUrl(source, focusArea.rect, focusArea.rotation);
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
    if (!newText) {
      throw new Error("No text found in the focus area.");
    }

    return newText;
  }, [getSourceElement, ensureVideoReady, mode]);

  const handleCapture = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const newText = await performCapture();
      setAccumulatedText((prev) => (prev ? `${prev}\n\n${newText}` : newText));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not read text — try adjusting the focus box.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [performCapture]);

  const handleCaptureAndAnswer = useCallback(async () => {
    setIsProcessing(true);
    setIsAsking(false);
    setError(null);
    setAnswer(null);
    setAnswerError(null);

    let newText: string;
    try {
      newText = await performCapture();
      setAccumulatedText((prev) => (prev ? `${prev}\n\n${newText}` : newText));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not read text — try adjusting the focus box.",
      );
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setIsAsking(true);

    try {
      const result = await fetchAnswer(newText);
      setAnswer(result);
    } catch (err) {
      setAnswerError(
        err instanceof Error ? err.message : "Could not get an answer.",
      );
    } finally {
      setIsAsking(false);
    }
  }, [performCapture]);

  const handleAsk = useCallback(async () => {
    if (!accumulatedText.trim()) return;

    setIsAsking(true);
    setAnswer(null);
    setAnswerError(null);

    try {
      const result = await fetchAnswer(accumulatedText);
      setAnswer(result);
    } catch (err) {
      setAnswerError(
        err instanceof Error ? err.message : "Could not get an answer.",
      );
    } finally {
      setIsAsking(false);
    }
  }, [accumulatedText]);

  const handleClear = useCallback(() => {
    setAccumulatedText("");
    setAnswer(null);
    setAnswerError(null);
  }, []);

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

      <AnswerPanel
        answer={answer}
        isLoading={isAsking}
        error={answerError}
        onDismiss={() => {
          setAnswer(null);
          setAnswerError(null);
        }}
      />

      <TextEditor
        value={accumulatedText}
        onChange={setAccumulatedText}
        isProcessing={isProcessing}
      />

      <Toolbar
        text={accumulatedText}
        onClear={handleClear}
        onAsk={handleAsk}
        isAsking={isAsking}
      />

      <CaptureButtons
        onCapture={handleCapture}
        onCaptureAndAnswer={handleCaptureAndAnswer}
        isProcessing={isProcessing}
        isAsking={isAsking}
        disabled={!canCapture}
      />
    </div>
  );
}
