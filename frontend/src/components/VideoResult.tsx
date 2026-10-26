'use client';

import React from 'react';
import { Download, Sparkles, CheckCircle, RotateCcw } from 'lucide-react';
import { getFullMediaUrl } from '../lib/api';

interface VideoResultProps {
  videoUrl: string;
  onReset: () => void;
  scriptText?: string;
}

export default function VideoResult({ videoUrl, onReset, scriptText }: VideoResultProps) {
  const fullUrl = getFullMediaUrl(videoUrl);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = `talking_video_${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              Your Video is Ready!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Synced MP4 video with Piper TTS speech
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Create Another
        </button>
      </div>

      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-[480px] mx-auto shadow-lg border border-zinc-200 dark:border-zinc-800">
        <video
          src={fullUrl}
          controls
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {scriptText && (
        <div className="max-w-[480px] mx-auto bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200/60 dark:border-zinc-800">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
            Script Spoken
          </p>
          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
            &ldquo;{scriptText}&rdquo;
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-[480px] mx-auto">
        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <Download className="w-4 h-4" />
          Download Video (MP4)
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          New Video
        </button>
      </div>
    </div>
  );
}
