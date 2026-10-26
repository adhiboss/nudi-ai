'use client';

import React from 'react';
import { Loader2, AlertCircle, RefreshCw, Cpu, AudioWaveform, Film, Sparkles } from 'lucide-react';
import { GenerationJob } from '../types';

interface GenerationStatusProps {
  job: GenerationJob;
  onRetry: () => void;
}

export default function GenerationStatus({ job, onRetry }: GenerationStatusProps) {
  const isFailed = job.status === 'failed';

  // Determine stage icon
  const getStageIcon = () => {
    const msg = (job.stage_message || '').toLowerCase();
    if (msg.includes('piper') || msg.includes('speech') || msg.includes('audio')) {
      return <AudioWaveform className="w-5 h-5 text-indigo-600 animate-pulse" />;
    }
    if (msg.includes('lip') || msg.includes('neural') || msg.includes('frame')) {
      return <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" />;
    }
    if (msg.includes('compositing') || msg.includes('finalizing') || msg.includes('mp4')) {
      return <Film className="w-5 h-5 text-indigo-600 animate-pulse" />;
    }
    return <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />;
  };

  if (isFailed) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
              Video Generation Failed
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
              {job.error_message || 'An unexpected error occurred during processing. Your inputs have been preserved.'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-red-200 dark:border-red-800 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center shadow-xs">
          {getStageIcon()}
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {job.status === 'queued' ? 'In Queue' : 'AI Processing'}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              Live
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {job.stage_message || 'Processing video generation job...'}
          </p>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full w-2/3 animate-[indeterminate_1.5s_infinite_linear]" />
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
        Running local AI neural inference on CPU • Video rendering takes approximately 5–15 seconds
      </p>
    </div>
  );
}
