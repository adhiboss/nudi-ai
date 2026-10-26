'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ConsentCheckbox({ checked, onChange, disabled }: ConsentCheckboxProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="mt-1 w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
        />
        <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed select-none">
          <span className="font-semibold text-zinc-900 dark:text-zinc-200">
            Likeness and Content Authorization:
          </span>{' '}
          I confirm that I own or have obtained all necessary rights and consent to use this image and animate any person depicted. I agree not to create deceptive, defamatory, or unlawful synthetic media.
        </div>
      </label>
    </div>
  );
}
