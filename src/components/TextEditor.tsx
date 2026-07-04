"use client";

import { Loader2 } from "lucide-react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  isProcessing: boolean;
}

export function TextEditor({ value, onChange, isProcessing }: TextEditorProps) {
  return (
    <div className="relative flex-1 px-4 py-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Captured text will appear here. You can edit freely."
        className="min-h-[40vh] w-full resize-y rounded-lg border border-zinc-200 bg-white p-4 text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        aria-label="Accumulated text editor"
      />

      {isProcessing && (
        <div
          className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-lg bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Extracting text…
          </p>
          <div className="h-2 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      )}
    </div>
  );
}
