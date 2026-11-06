import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Share2, X } from 'lucide-react';

interface ShareDialogProps {
  url: string;
  onClose: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Nokopē saiti:', url);
    }
  };

  const shareLink = async () => {
    const text = `Pievienojies Ziemassvētku dāvanu izlozei: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ziemassvētku dāvanu izloze', text, url });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') await copyLink();
      }
      return;
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[#09251c]/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        className="w-full max-w-sm rounded-xl bg-[#fffdf7] p-5 text-[#17392c] shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="share-dialog-title" className="text-xl font-bold">Kopīgot dalībnieku sarakstu</h2>
            <p className="mt-1 text-sm text-[#526258]">Saite kopē sarakstu, nevis sinhronizē izlozi starp ierīcēm.</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Aizvērt kopīgošanu" className="icon-button">
            <X size={20} />
          </button>
        </div>

        {url.length <= 1800 ? (
          <div className="mx-auto mb-4 grid w-fit place-items-center rounded-lg border border-[#d6ded7] bg-white p-3">
            <QRCodeSVG value={url} size={188} level="M" title="Dalībnieku saraksta QR kods" />
          </div>
        ) : (
          <p className="mb-4 rounded-lg border border-[#d6ded7] bg-white p-4 text-sm leading-6 text-[#526258]">Saraksts ir par lielu QR kodam. Nokopē saiti vai izmanto kopīgošanas izvēlni.</p>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={copyLink} className="action-button flex-1">
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? 'Nokopēts' : 'Kopēt saiti'}
          </button>
          <button type="button" onClick={shareLink} className="action-button action-button-primary flex-1">
            <Share2 size={17} /> Kopīgot
          </button>
        </div>
        <p className="sr-only" aria-live="polite">{copied ? 'Saite nokopēta starpliktuvē.' : ''}</p>
      </section>
    </div>
  );
};