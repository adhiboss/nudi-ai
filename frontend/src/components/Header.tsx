'use client';

import React, { useState } from 'react';
import { Video, ShieldCheck, Info, X } from 'lucide-react';

export default function Header() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-40 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                Nudi<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </span>
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                MVP
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Rights</span>
          </button>
        </div>
      </header>

      {/* Privacy & Ethics Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-base">
                <Info className="w-5 h-5 text-indigo-600" />
                <span>Consent & Responsible Use</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-3 leading-relaxed">
              <p>
                <strong>Permission Required:</strong> You must have the explicit right or permission to use any photo uploaded, as well as the consent of any depicted person to animate their likeness.
              </p>
              <p>
                <strong>No Deceptive Impersonation:</strong> This application is intended for education, presentations, and personal creative use. Impersonation of real individuals without permission is strictly prohibited.
              </p>
              <p>
                <strong>Data Privacy:</strong> Uploaded images and synthesized audio are processed privately on the local backend and cleaned up automatically. No user media is sold or shared.
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
