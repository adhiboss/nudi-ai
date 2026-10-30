'use client';

import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

interface PhotoUploadProps {
  selectedFile: File | null;
  onSelectFile: (file: File | null) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ selectedFile, onSelectFile, disabled }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update preview URL whenever selectedFile changes
  React.useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const validateAndSetFile = useCallback((file: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or WEBP image.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    onSelectFile(file);
  }, [onSelectFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUseSample = async (samplePath = '/avatar_boy.png', sampleName = 'avatar_boy.png') => {
    try {
      setError(null);
      const res = await fetch(samplePath);
      const blob = await res.blob();
      const file = new File([blob], sampleName, { type: 'image/png' });
      onSelectFile(file);
    } catch {
      setError('Could not load sample portrait.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#fff0f4] text-[#fa256c] text-xs font-black inline-flex items-center justify-center">1</span>
          <span>Upload Portrait Photo</span>
          {selectedFile && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready
            </span>
          )}
        </label>
      </div>

      {/* Preset Quick Picks */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-500">Quick start with our demo characters:</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleUseSample('/avatar_boy.png', 'avatar_boy.png')}
            disabled={disabled}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-2xl border border-pink-100 hover:border-[#fa256c] bg-[#fff8fa] hover:bg-[#fff0f4] transition text-left cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/avatar_boy.png"
              alt="3D Boy Mascot"
              className="w-10 h-10 rounded-xl object-cover border border-pink-200 group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                3D Boy Avatar
                <Sparkles className="w-3 h-3 text-[#fa256c]" />
              </p>
              <p className="text-[11px] text-neutral-500">Demo portrait</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleUseSample('/sample_portrait.jpg', 'sample_portrait.jpg')}
            disabled={disabled}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-2xl border border-neutral-200 hover:border-[#fa256c] bg-white hover:bg-[#fff0f4] transition text-left cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sample_portrait.jpg"
              alt="Portrait Photo"
              className="w-10 h-10 rounded-xl object-cover border border-neutral-200 group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="text-xs font-bold text-neutral-900">Portrait Photo</p>
              <p className="text-[11px] text-neutral-500">Clean portrait</p>
            </div>
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="photo-upload-input"
      />

      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-7 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            dragOver
              ? 'border-[#fa256c] bg-[#fff0f4]'
              : 'border-pink-200 hover:border-[#fa256c] bg-[#fffdfd]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#fff0f4] border border-pink-100 flex items-center justify-center text-[#fa256c] shadow-xs">
            <UploadCloud className="w-6 h-6 text-[#fa256c]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Click to upload photo <span className="font-normal text-neutral-500">or drag and drop</span>
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              JPG, PNG, or WEBP (Max 10MB) • Clear front-facing photo
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-pink-100 rounded-3xl p-4 bg-white flex items-center gap-4 shadow-sm">
          {previewUrl && (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-pink-50 shrink-0 border border-pink-150">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected portrait preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Image'}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
                className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => onSelectFile(null)}
                disabled={disabled}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
