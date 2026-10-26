'use client';

import React from 'react';
import { MessageSquareText, Sparkles } from 'lucide-react';

interface ScriptInputProps {
  script: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SAMPLE_SCRIPTS = [
  {
    label: 'Test Phrase',
    text: 'Hello! This is a test of my photo-to-talking-video application.'
  },
  {
    label: 'Welcome Intro',
    text: 'Welcome! Today I will demonstrate how AI turns any portrait photo into a talking presenter video in seconds.'
  },
  {
    label: 'Product Pitch',
    text: 'Meet Nudi AI: the simplest way to produce high-impact video explainers without cameras, studios, or editing skills.'
  }
];

export default function ScriptInput({ script, onChange, disabled }: ScriptInputProps) {
  const maxChars = 500;
  const charCount = script.length;
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="script-textarea"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
        >
          <MessageSquareText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>2. What should they say?</span>
        </label>

        <span
          className={`text-xs font-mono font-medium ${
            isOverLimit
              ? 'text-red-600 dark:text-red-400 font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {charCount} / {maxChars} chars ({wordCount} {wordCount === 1 ? 'word' : 'words'})
        </span>
      </div>

      <div className="relative">
        <textarea
          id="script-textarea"
          rows={4}
          value={script}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter the exact script you want the avatar to speak..."
          className={`w-full rounded-2xl p-4 text-sm bg-white dark:bg-zinc-900 border transition outline-none resize-y min-h-[110px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 ${
            isOverLimit
              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
              : 'border-zinc-300 dark:border-zinc-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Preset script suggestions */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick presets:
          </span>
          {SAMPLE_SCRIPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.text)}
              className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {isOverLimit && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          Script is too long. Please shorten it to under {maxChars} characters.
        </p>
      )}
    </div>
  );
}
