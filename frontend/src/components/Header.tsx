'use client';

import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Info, X } from 'lucide-react';

export default function Header() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'how-it-works'>('home');

  const scrollToSection = (id: string, tab: 'home' | 'features' | 'how-it-works') => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('hero', 'home');
            }}
            className="flex items-center gap-1 group cursor-pointer"
          >
            <span className="font-extrabold text-2xl sm:text-[26px] tracking-tight text-neutral-900 group-hover:opacity-90 transition-opacity">
              Nudi
            </span>
            <span className="font-extrabold text-2xl sm:text-[26px] tracking-tight text-[#fa256c] flex items-center gap-0.5">
              AI
              <span className="inline-flex items-center justify-center ml-0.5">
                <svg
                  className="w-5 h-5 text-[#fa256c] fill-[#fa256c] stroke-[#fa256c] transition-transform group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </span>
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-neutral-600">
            <button
              type="button"
              onClick={() => scrollToSection('hero', 'home')}
              className={`relative py-2 transition cursor-pointer ${
                activeTab === 'home'
                  ? 'text-neutral-900 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#fa256c] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('features', 'features')}
              className={`relative py-2 transition cursor-pointer ${
                activeTab === 'features'
                  ? 'text-neutral-900 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Features
              {activeTab === 'features' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#fa256c] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('how-it-works', 'how-it-works')}
              className={`relative py-2 transition cursor-pointer ${
                activeTab === 'how-it-works'
                  ? 'text-neutral-900 font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              How it Works
              {activeTab === 'how-it-works' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#fa256c] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Header Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-800 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              title="Privacy & Rights Policy"
            >
              <ShieldCheck className="w-4 h-4 text-[#fa256c]" />
              <span>Ethics</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const studioEl = document.getElementById('studio');
                if (studioEl) {
                  studioEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#fa256c] hover:bg-[#e0165a] text-white text-sm font-bold shadow-md shadow-pink-500/25 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-0.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </header>

      {/* Privacy & Ethics Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-base">
                <Info className="w-5 h-5 text-[#fa256c]" />
                <span>Consent & Responsible AI Policy</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-neutral-600 space-y-3 leading-relaxed">
              <p>
                <strong>Permission Required:</strong> You must have explicit consent to animate any portrait photo or likeness.
              </p>
              <p>
                <strong>No Deceptive Impersonation:</strong> Nudi AI is intended for creative storytelling, educational avatars, and personal presentations. Impersonation of real individuals without authorization is strictly prohibited.
              </p>
              <p>
                <strong>Private & Local Processing:</strong> Uploaded media and audio are processed privately on the local backend and cleaned up automatically.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 bg-[#fa256c] hover:bg-[#e0165a] text-white rounded-full text-sm font-bold transition shadow-sm shadow-pink-500/20"
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
