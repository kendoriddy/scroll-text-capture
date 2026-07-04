"use client";

import { Loader2, X } from "lucide-react";

interface AnswerPanelProps {
  answer: string | null;
  isLoading: boolean;
  error: string | null;
  onDismiss: () => void;
}

export function AnswerPanel({
  answer,
  isLoading,
  error,
  onDismiss,
}: AnswerPanelProps) {
  if (!isLoading && !answer && !error) return null;

  return (
    <div className="mx-4 mb-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <div className="flex items-center justify-between border-b border-blue-200 px-4 py-2 dark:border-blue-900">
        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Answer
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900"
          aria-label="Dismiss answer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}

        {answer && !isLoading && (
          <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
            {answer}
          </p>
        )}
      </div>
    </div>
  );
}
