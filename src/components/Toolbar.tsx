"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Trash2 } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface ToolbarProps {
  text: string;
  onClear: () => void;
  onAsk: () => void;
  isAsking: boolean;
}

export function Toolbar({ text, onClear, onAsk, isAsking }: ToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleCopy = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 z-40 flex flex-col gap-2 border-t border-zinc-200 bg-white px-4 py-3 pb-safe dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onAsk}
          disabled={!text || isAsking}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Get a short answer from GPT"
        >
          <MessageCircle className="h-5 w-5" />
          {isAsking ? "Getting answer…" : "Get Answer"}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-100 font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            aria-label="Copy all text to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy Text
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            disabled={!text}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            aria-label="Clear all text"
          >
            <Trash2 className="h-5 w-5" />
            Clear All
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear all text?"
        message="This will remove all captured and edited text. This cannot be undone."
        confirmLabel="Clear All"
        onConfirm={() => {
          onClear();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </>
  );
}
