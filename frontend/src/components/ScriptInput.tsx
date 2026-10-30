'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface ScriptInputProps {
  script: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SAMPLE_SCRIPTS = [
  {
    label: 'Hero Intro',
    text: 'Hey everyone! Welcome to Nudi AI.'
  },
  {
    label: 'Product Pitch',
    text: 'Meet Nudi AI: the simplest way to turn any photo and text into realistic talking videos in seconds.'
  },
  {
    label: 'Demo Greeting',
    text: 'Create realistic talking videos with AI. Just a photo, a script, and a voice. No editing skills required!'
  }
];

export default function ScriptInput({ script, onChange, disabled }: ScriptInputProps) {
  const maxChars = 500;
  const charCount = script.length;
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="script-textarea"
          className="text-sm font-bold text-neutral-900 flex items-center gap-2"
        >
          <span className="w-6 h-6 rounded-full bg-[#fff0f4] text-[#fa256c] text-xs font-black inline-flex items-center justify-center">2</span>
          <span>Add Script / What should they say?</span>
        </label>

        <span
          className={`text-xs font-mono font-medium ${
            isOverLimit
              ? 'text-red-600 font-bold'
              : 'text-neutral-400'
          }`}
        >
          {charCount} / {maxChars} chars ({wordCount} {wordCount === 1 ? 'word' : 'words'})
        </span>
      </div>

      <div className="relative">
        <textarea
          id="script-textarea"
          rows={3}
          value={script}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter the exact script you want the avatar to speak..."
          className={`w-full rounded-2xl p-4 text-sm bg-neutral-50/50 border transition outline-none resize-y min-h-[95px] text-neutral-900 placeholder-neutral-400 ${
            isOverLimit
              ? 'border-red-500 focus:ring-2 focus:ring-red-400/20'
              : 'border-pink-100 focus:border-[#fa256c] focus:bg-white focus:ring-3 focus:ring-pink-500/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>

      {/* Preset script suggestions */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-neutral-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#fa256c]" />
            Quick presets:
          </span>
          {SAMPLE_SCRIPTS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onChange(item.text)}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-[#fff0f4] hover:bg-[#ffe2eb] text-[#fa256c] transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {isOverLimit && (
        <p className="text-xs text-red-600 font-medium">
          Script is too long. Please shorten it to under {maxChars} characters.
        </p>
      )}
    </div>
  );
}
