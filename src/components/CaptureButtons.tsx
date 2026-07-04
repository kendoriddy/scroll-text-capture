"use client";

import { Loader2, ScanText, Sparkles } from "lucide-react";

interface CaptureButtonsProps {
  onCapture: () => void;
  onCaptureAndAnswer: () => void;
  isProcessing: boolean;
  isAsking: boolean;
  disabled?: boolean;
}

export function CaptureButtons({
  onCapture,
  onCaptureAndAnswer,
  isProcessing,
  isAsking,
  disabled,
}: CaptureButtonsProps) {
  const busy = isProcessing || isAsking;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center gap-2 px-3">
      <button
        type="button"
        onClick={onCapture}
        disabled={busy || disabled}
        className="flex min-h-14 items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Capture text from focus area"
      >
        {isProcessing && !isAsking ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ScanText className="h-5 w-5" />
        )}
        {isProcessing && !isAsking ? "Processing…" : "Capture Text"}
      </button>

      <button
        type="button"
        onClick={onCaptureAndAnswer}
        disabled={busy || disabled}
        className="flex min-h-16 flex-1 max-w-[220px] items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Capture text and get answer automatically"
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
        {isProcessing && isAsking
          ? "Working…"
          : isProcessing
            ? "Reading…"
            : isAsking
              ? "Answering…"
              : "Capture & Answer"}
      </button>
    </div>
  );
}
