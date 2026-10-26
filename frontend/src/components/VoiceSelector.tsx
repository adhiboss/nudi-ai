'use client';

import React from 'react';
import { Volume2, CheckCircle2 } from 'lucide-react';
import { VoiceInfo } from '../types';

interface VoiceSelectorProps {
  voices: VoiceInfo[];
  selectedVoiceId: string;
  onSelectVoice: (id: string) => void;
  disabled?: boolean;
}

export default function VoiceSelector({
  voices,
  selectedVoiceId,
  onSelectVoice,
  disabled
}: VoiceSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>3. Choose a Voice</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {voices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          return (
            <div
              key={voice.id}
              onClick={() => !disabled && onSelectVoice(voice.id)}
              className={`relative rounded-2xl p-4 border transition cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                      {voice.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {voice.gender}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      {voice.language}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                )}
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {voice.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
