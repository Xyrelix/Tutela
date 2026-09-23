'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowSquareOut, Copy, X } from '@phosphor-icons/react';

function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}

// Android Chrome only reliably invokes its "open with" app chooser (or falls
// back gracefully) for custom URI schemes wrapped in an explicit intent://
// link — a plain `wc:` href can silently no-op even when a matching app is
// installed. See https://developer.chrome.com/docs/multidevice/android/intents
function toAndroidIntentUrl(uri: string, fallbackUrl: string): string {
  const separatorIndex = uri.indexOf(':');
  const scheme = separatorIndex === -1 ? 'wc' : uri.slice(0, separatorIndex);
  const rest = separatorIndex === -1 ? uri : uri.slice(separatorIndex + 1);
  return `intent:${rest}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
}

export function WalletConnectPrompt({ uri, onClose }: { uri: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleOpen() {
    window.location.href = isAndroid() ? toAndroidIntentUrl(uri, window.location.href) : uri;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#101217] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] tracking-[0.22em] text-[#6dce9a] uppercase">
                Connect wallet
              </p>
              <h2 className="mt-2 text-lg font-medium tracking-[-0.02em]">Continue in your wallet app</h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cancel"
              className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Tap below to open this connection request in a wallet app installed on your phone.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleOpen}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2457ff] text-sm font-medium shadow-[0_0_30px_rgba(36,87,255,0.2)]"
            >
              <ArrowSquareOut className="h-4 w-4" />
              Open wallet app
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs text-white/60 transition-colors hover:border-white/25 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied to clipboard' : 'Copy connection link'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
