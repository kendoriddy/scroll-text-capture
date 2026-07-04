"use client";

import { ScanText, Loader2 } from "lucide-react";

interface CaptureButtonProps {
  onCapture: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

export function CaptureButton({
  onCapture,
  isProcessing,
  disabled,
}: CaptureButtonProps) {
  return (
    <button
      type="button"
      onClick={onCapture}
      disabled={isProcessing || disabled}
      className="fixed bottom-24 left-1/2 z-50 flex min-h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Capture text from focus area"
    >
      {isProcessing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ScanText className="h-5 w-5" />
      )}
      {isProcessing ? "Processing…" : "Capture Text"}
    </button>
  );
}
