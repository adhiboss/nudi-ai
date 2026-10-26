'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import ScriptInput from '@/components/ScriptInput';
import VoiceSelector from '@/components/VoiceSelector';
import ConsentCheckbox from '@/components/ConsentCheckbox';
import GenerationStatus from '@/components/GenerationStatus';
import VideoResult from '@/components/VideoResult';
import { VoiceInfo, GenerationJob } from '@/types';
import { fetchVoices, createGeneration, getGenerationStatus } from '@/lib/api';
import { Video, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export default function Home() {
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('en_US-lessac-medium');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [script, setScript] = useState<string>('Hello! This is a test of my photo-to-talking-video application.');
  const [consent, setConsent] = useState<boolean>(true);

  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load available voices on mount
  useEffect(() => {
    async function initVoices() {
      const available = await fetchVoices();
      setVoices(available);
      if (available.length > 0 && !available.some(v => v.id === selectedVoiceId)) {
        setSelectedVoiceId(available[0].id);
      }
    }
    initVoices();
  }, []);

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll for job updates
  const startPolling = (jobId: string) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const updated = await getGenerationStatus(jobId);
        setCurrentJob(updated);

        if (updated.status === 'completed' || updated.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsSubmitting(false);
        }
      } catch (err: any) {
        console.error('Error polling job:', err);
      }
    }, 1000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPhoto) {
      setFormError('Please select or upload a portrait photo.');
      return;
    }
    if (!script.trim()) {
      setFormError('Please enter a script for the avatar to say.');
      return;
    }
    if (script.length > 500) {
      setFormError('Script exceeds the 500 character limit.');
      return;
    }
    if (!selectedVoiceId) {
      setFormError('Please select a voice.');
      return;
    }
    if (!consent) {
      setFormError('You must confirm authorization to animate this photo and likeness.');
      return;
    }

    setIsSubmitting(true);
    setCurrentJob(null);

    try {
      const job = await createGeneration(selectedPhoto, script.trim(), selectedVoiceId, consent);
      setCurrentJob(job);
      startPolling(job.id);
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Failed to submit generation request.');
    }
  };

  const handleReset = () => {
    setCurrentJob(null);
    setIsSubmitting(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const isGenerating = Boolean(isSubmitting || (currentJob && (currentJob.status === 'queued' || currentJob.status === 'processing')));
  const isCompleted = Boolean(currentJob && currentJob.status === 'completed' && currentJob.output_video_url);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Page Title & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create a Talking Video
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Upload a portrait photo, enter what they should say, and let AI generate a realistic talking video with synchronized voice audio.
          </p>
        </div>

        {/* Video Result View */}
        {currentJob?.status === 'completed' && currentJob.output_video_url && (
          <VideoResult
            videoUrl={currentJob.output_video_url}
            scriptText={currentJob.script_text}
            onReset={handleReset}
          />
        )}

        {/* Generation Form (Hidden if completed to focus on the result, preserved on error or new video) */}
        {!isCompleted && (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-6 shadow-xs">
              {/* 1. Photo Upload */}
              <PhotoUpload
                selectedFile={selectedPhoto}
                onSelectFile={setSelectedPhoto}
                disabled={isGenerating}
              />

              {/* 2. Script Input */}
              <ScriptInput
                script={script}
                onChange={setScript}
                disabled={isGenerating}
              />

              {/* 3. Voice Selector */}
              <VoiceSelector
                voices={voices}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={setSelectedVoiceId}
                disabled={isGenerating}
              />

              {/* 4. Consent Checkbox */}
              <ConsentCheckbox
                checked={consent}
                onChange={setConsent}
                disabled={isGenerating}
              />

              {/* Form Error Alert */}
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Progress Tracker (Visible when processing or failed) */}
              {currentJob && (
                <GenerationStatus
                  job={currentJob}
                  onRetry={() => {
                    setCurrentJob(null);
                    setIsSubmitting(false);
                  }}
                />
              )}

              {/* 5. Primary Generate Action Button */}
              {!isGenerating && (
                <button
                  type="submit"
                  disabled={!selectedPhoto || !script.trim() || script.length > 500 || !consent}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition shadow-md shadow-indigo-600/20 active:scale-[0.99] cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Video</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </form>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
        <p>Built with Next.js, Piper TTS, and ONNX Runtime • AI Video Generator MVP</p>
      </footer>
    </div>
  );
}
