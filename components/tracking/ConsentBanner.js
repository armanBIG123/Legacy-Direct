'use client';

import { useEffect, useState } from 'react';
import { META_PIXEL_ID, OPEN_CHOICES_EVENT, getConsent, setConsent, gpcOn } from './consent';

// Small bottom banner asking before any ad tracking loads. Both buttons are
// the same size and weight, so saying no is as easy as saying yes.
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    setGpc(gpcOn());
    if (getConsent() === null) setOpen(true);
    const reopen = () => {
      setGpc(gpcOn());
      setOpen(true);
    };
    window.addEventListener(OPEN_CHOICES_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CHOICES_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (v) => {
    setConsent(v);
    setOpen(false);
  };

  return (
    <div className="ld-consent" role="dialog" aria-live="polite" aria-label="Ad tracking choice">
      {gpc ? (
        <p className="ld-consent-text">
          Your browser&rsquo;s Global Privacy Control is on, so ad tracking stays off.{' '}
          <a href="/privacy#tracking">Privacy Policy</a>
        </p>
      ) : (
        <p className="ld-consent-text">
          May we use Meta&rsquo;s ad pixel to see which of our ads bring people here? It stays off
          unless you allow it, and it never receives your answers.{' '}
          <a href="/privacy#tracking">Privacy Policy</a>
        </p>
      )}
      <div className="ld-consent-actions">
        {gpc ? (
          <button type="button" className="ld-consent-btn" onClick={() => setOpen(false)}>
            OK
          </button>
        ) : (
          <>
            <button type="button" className="ld-consent-btn" onClick={() => choose('denied')}>
              No thanks
            </button>
            <button type="button" className="ld-consent-btn" onClick={() => choose('granted')}>
              Allow
            </button>
          </>
        )}
      </div>
      <style>{`
        .ld-consent{position:fixed;left:12px;right:12px;bottom:12px;z-index:1000;max-width:640px;margin:0 auto;
          background:#241134;color:#EFEAE0;border-radius:12px;padding:12px 14px;display:flex;gap:12px;align-items:center;
          box-shadow:0 8px 30px rgba(0,0,0,.25);font-family:'Inter',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;}
        .ld-consent-text{margin:0;font-size:13px;line-height:1.45;flex:1}
        .ld-consent-text a{color:#E2C465;text-decoration:underline}
        .ld-consent-actions{display:flex;gap:8px;flex-shrink:0}
        .ld-consent-btn{font:inherit;font-size:13px;font-weight:600;border-radius:8px;padding:9px 14px;cursor:pointer;
          background:#EFEAE0;color:#241134;border:0;min-width:92px}
        .ld-consent-btn:hover{background:#fff}
        @media (max-width:560px){.ld-consent{flex-direction:column;align-items:stretch;bottom:8px;left:8px;right:8px}
          .ld-consent-actions .ld-consent-btn{flex:1}}
      `}</style>
    </div>
  );
}
