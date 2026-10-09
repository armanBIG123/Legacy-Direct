'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TermHeader from './TermHeader';
import CallButton from './CallButton';
import ProgressTrack from '../apply/ProgressTrack';
import Turnstile from '../apply/Turnstile';
import { TURNSTILE_SITE_KEY, leadsConfigured } from '../apply/leadConfig';
import { SAVE_NOTICE, CONTACT_NOTICE, CALL_NOTICE, CONSENT_WORDING } from './disclosures';
import { NEEDS, INCOME_MULTIPLE, AGENT_PHONE_DISPLAY, suggestedCoverage, formatMoney, shortMoney } from './termConfig';
import { sendSnapshot, submitTermLead, hasAnyAnswer, hasContact, parseDob, ageFrom, phoneDigits } from './submitTermLead';
import { captureAttribution } from './attribution';
import { trackEvent } from './track';

const INITIAL = {
  need: null,
  income: 60000,
  incomeTouched: false,
  mortgage: 250000,
  mortgageTouched: false,
  tobacco: null,
  dob: '', // "MM/DD/YYYY"
  zip: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  wantsTexts: false, // calls + texts incl. automated (see disclosures.js)
  consentAt: null,
  website: '', // honeypot — real people never fill this
  completed: false,
  callClickedAt: null,
};

const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((e || '').trim());

function dobProblem(text) {
  if ((text || '').length < 10) return null;
  const iso = parseDob(text);
  if (!iso) return 'That doesn’t look like a real date — use MM/DD/YYYY.';
  const age = ageFrom(iso);
  if (age < 18) return 'You need to be 18 or older to apply for your own coverage.';
  if (age > 85) return 'Online options are limited past 85 — call us and an agent will help.';
  return null;
}

// Six screens. `auto` = picking an answer moves on by itself.
const STEPS = [
  { id: 'need', auto: true, valid: (d) => !!d.need },
  { id: 'amount', valid: () => true },
  { id: 'tobacco', auto: true, valid: (d) => !!d.tobacco },
  { id: 'dob', valid: (d) => !!parseDob(d.dob) && !dobProblem(d.dob) },
  { id: 'zip', valid: (d) => /^\d{5}$/.test(d.zip) },
  {
    id: 'contact',
    valid: (d) => d.firstName.trim() && d.lastName.trim() && validEmail(d.email) && (!d.phone || phoneDigits(d.phone).length === 10),
  },
];

const CHIPS = {
  income: [40000, 60000, 80000, 100000, 150000, 200000],
  mortgage: [100000, 200000, 300000, 400000, 500000, 750000],
};
const RANGE = {
  income: { min: 10000, max: 400000, step: 5000, top: '$400K+' },
  mortgage: { min: 10000, max: 1500000, step: 10000, top: '$1.5M+' },
};

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// "0113198" → "01/13/198"
function maskDob(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "5015551212" → "(501) 555-1212"
function maskPhone(v) {
  const d = phoneDigits(v).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function Choice({ selected, onClick, title, body, tag }) {
  return (
    <button type="button" aria-pressed={selected} className={`apply-choice-row ${selected ? 'is-selected' : ''}`} onClick={onClick}>
      <span className="apply-choice-text">
        <span className="apply-choice-label">
          {title}
          {tag && <span className="term-choice-tag">{tag}</span>}
        </span>
        {body && <span className="apply-choice-body">{body}</span>}
      </span>
      <span className="apply-choice-arrow" aria-hidden="true">→</span>
    </button>
  );
}

export default function TermFlow() {
  const [data, setData] = useState(INITIAL);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tried, setTried] = useState(false);
  const [token, setToken] = useState('');
  const [tsKey, setTsKey] = useState(0);
  const [pendingSave, setPendingSave] = useState(null);
  const [callNote, setCallNote] = useState(false);
  const sessionId = useRef(null);
  const advancing = useRef(false);
  const lastSaved = useRef('');
  const latest = useRef(data);
  latest.current = data;
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const update = (patch) => setData((d) => ({ ...d, ...patch }));
  const step = STEPS[stepIndex];

  // One id per visit, where they came from, and a need picked on the landing
  // page (?need=mortgage skips straight to the amount question).
  useEffect(() => {
    sessionId.current = newSessionId();
    captureAttribution();
    const need = new URLSearchParams(window.location.search).get('need');
    if (NEEDS[need]) {
      setData((d) => ({ ...d, need }));
      setStepIndex(1);
      trackEvent('term_start', { need, from: 'landing' });
    }
  }, []);

  useEffect(() => {
    if (!done) trackEvent('term_step', { step: STEPS[stepIndex].id, number: stepIndex + 1 });
  }, [stepIndex, done]);

  function freshToken() {
    setToken('');
    setTsKey((k) => k + 1);
  }

  // Save a snapshot in the background, skipping exact repeats. If the
  // security check hasn't finished yet, queue it until it does.
  function save(snapshot, { force = false } = {}) {
    if (!hasAnyAnswer(snapshot)) return;
    const key = JSON.stringify({ ...snapshot, website: undefined });
    if (!force && key === lastSaved.current) return;
    if (tokenRef.current) {
      if (sendSnapshot(sessionId.current, tokenRef.current, snapshot)) {
        lastSaved.current = key;
        freshToken();
      }
    } else {
      setPendingSave(snapshot);
    }
  }

  useEffect(() => {
    if (pendingSave && token) {
      const s = pendingSave;
      setPendingSave(null);
      save(s, { force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSave, token]);

  // Tapped Call: save what they've entered. Never blocks the call.
  function handleCall() {
    const snapshot = {
      ...latest.current,
      callClickedAt: latest.current.callClickedAt || new Date().toISOString(),
      lastStep: done ? 'done' : STEPS[stepIndex].id,
    };
    setData((d) => ({ ...d, callClickedAt: snapshot.callClickedAt }));
    setCallNote(true);
    trackEvent('term_call', { step: snapshot.lastStep });
    save(snapshot, { force: true });
  }

  // Typed a usable email or phone but hasn't hit submit yet? Save quietly
  // after a pause, so an abandoned form is still a lead you can follow up.
  useEffect(() => {
    if (done || step.id !== 'contact' || !hasContact(data)) return;
    const t = setTimeout(() => save({ ...latest.current, lastStep: 'contact' }), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email, data.phone, data.firstName, data.lastName, step.id, done]);

  // Leaving the page mid-form: one last save if we can reach them.
  useEffect(() => {
    function onHide() {
      if (document.visibilityState !== 'hidden') return;
      const d = latest.current;
      if (!d.completed && hasContact(d)) save({ ...d, lastStep: 'left_page' });
    }
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goTo(i) {
    setStepIndex(i);
    setTried(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function next(patch = {}) {
    const d = { ...data, ...patch };
    setData(d);
    if (!STEPS[stepIndex].valid(d)) {
      setTried(true);
      return;
    }
    if (stepIndex < STEPS.length - 1) goTo(stepIndex + 1);
  }

  function choose(patch) {
    if (advancing.current) return;
    advancing.current = true;
    setData((d) => ({ ...d, ...patch }));
    if (patch.need) trackEvent('term_start', { need: patch.need, from: 'quiz' });
    setTimeout(() => {
      advancing.current = false;
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
      setTried(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  }

  function back() {
    if (stepIndex > 0) goTo(stepIndex - 1);
  }

  async function submit() {
    if (submitting) return;
    if (!step.valid(data)) {
      setTried(true);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitTermLead(sessionId.current, token, data);
      setData((d) => ({ ...d, completed: true }));
      setDone(true);
      trackEvent('term_lead', { need: data.need, coverage: suggestedCoverage(data) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      freshToken();
    }
  }

  function onFormSubmit(e) {
    e.preventDefault();
    if (step.id === 'contact') submit();
    else if (!step.auto) next(step.id === 'amount' ? amountPatch() : {});
  }

  const coverage = suggestedCoverage(data);
  const need = NEEDS[data.need];
  const amountKey = need?.basis === 'mortgage' ? 'mortgage' : 'income';
  const range = RANGE[amountKey];
  const amountValue = amountKey === 'mortgage' ? data.mortgage : data.income;
  const amountPatch = () => (amountKey === 'mortgage' ? { mortgageTouched: true } : { incomeTouched: true });
  const setAmount = (v) => update(amountKey === 'mortgage' ? { mortgage: v, mortgageTouched: true } : { income: v, incomeTouched: true });
  const valid = step.valid(data);
  const checking = leadsConfigured && !token;
  const dobErr = dobProblem(data.dob);

  // Field-level hints on the contact step, shown after they try to submit.
  const contactErrors = {
    firstName: !data.firstName.trim() && 'Add your first name',
    lastName: !data.lastName.trim() && 'Add your last name',
    email: !validEmail(data.email) && 'Enter a valid email',
    phone: data.phone && phoneDigits(data.phone).length !== 10 && 'Enter a 10-digit number, or leave it blank',
  };

  return (
    <div className="apply-page term-page">
      <TermHeader onCall={handleCall} />

      <main className="apply-main term-main">
        <div className="apply-layout">
          <div className="apply-content">
            {callNote && !done && (
              <div className="term-callnote" role="status">
                <strong>Connecting you with a licensed agent.</strong> If the call didn&rsquo;t start, dial{' '}
                <strong>{AGENT_PHONE_DISPLAY}</strong>. Your answers so far are saved, so you won&rsquo;t have to repeat them.
              </div>
            )}

            {done ? (
              <div className="done">
                <div className="done-badge" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M8 15.5l4.5 4.5L22 10.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="done-title">You&rsquo;re all set, {data.firstName}.</h1>
                <p className="done-lede">
                  A licensed agent will reach out{data.phone ? <> at <strong>{maskPhone(data.phone)}</strong></> : null} to go over your{' '}
                  {need ? need.title.toLowerCase() : 'term'} options
                  {coverage ? <> starting around <strong>{formatMoney(coverage)}</strong></> : null}.
                </p>
                <div className="done-card term-done-call">
                  <div className="done-card-label">Want your price faster?</div>
                  <p>A licensed agent can walk you through your options and price on the phone.</p>
                  <CallButton onCall={handleCall} variant="solid" label="Call a licensed agent" />
                </div>
                <div className="done-card">
                  <div className="done-card-label">What happens next</div>
                  <ol className="done-steps">
                    <li><span className="done-step-num">1</span><div><div className="done-step-title">An agent reviews your answers</div><div className="done-step-body">Then reaches out using the contact info you gave.</div></div></li>
                    <li><span className="done-step-num">2</span><div><div className="done-step-title">You get real prices</div><div className="done-step-body">From the insurers that fit your age, health and budget.</div></div></li>
                    <li><span className="done-step-num">3</span><div><div className="done-step-title">You decide</div><div className="done-step-body">No pressure, no obligation.</div></div></li>
                  </ol>
                </div>
                <p className="done-fine">
                  Coverage, price and eligibility are decided by the insurance company after you apply.{' '}
                  <a href="/data-use">How your information is used</a>
                </p>
                <Link href="/term" className="apply-nav-back">Back to term coverage</Link>
              </div>
            ) : (
              <form className="apply-question-wrap" key={step.id} onSubmit={onFormSubmit} noValidate>
                <ProgressTrack total={STEPS.length} current={stepIndex} />

                {step.id === 'need' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">Term coverage</div>
                      <h1>What do you want your coverage to protect?</h1>
                      <p className="apply-subtitle">Pick the one that matters most right now.</p>
                    </div>
                    <div className="apply-choice-list">
                      {Object.values(NEEDS).map((n) => (
                        <Choice key={n.key} selected={data.need === n.key} onClick={() => choose({ need: n.key })} title={n.title} tag={n.tag} body={n.body} />
                      ))}
                    </div>
                    <p className="term-save-notice">
                      {SAVE_NOTICE} <a href="/data-use#term">How we use your information</a>
                    </p>
                  </>
                )}

                {step.id === 'amount' && need && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">{need.title}</div>
                      <h1>{amountKey === 'mortgage' ? 'About how much is left on your mortgage?' : 'About how much do you earn in a year?'}</h1>
                      <p className="apply-subtitle">Tap the closest amount — a rough number is fine.</p>
                    </div>
                    <div className="term-chips" role="group" aria-label="Quick amounts">
                      {CHIPS[amountKey].map((v, i, arr) => (
                        <button
                          type="button"
                          key={v}
                          className={`term-chip ${amountValue === v && (amountKey === 'mortgage' ? data.mortgageTouched : data.incomeTouched) ? 'is-on' : ''}`}
                          onClick={() => setAmount(v)}
                        >
                          {shortMoney(v)}{i === arr.length - 1 ? '+' : ''}
                        </button>
                      ))}
                    </div>
                    <div className="apply-slider term-slider">
                      <div className="apply-slider-value">
                        {amountValue >= range.max ? range.top : formatMoney(amountValue)}
                        {amountKey === 'income' && <span className="term-per">/yr</span>}
                      </div>
                      <input
                        type="range"
                        min={range.min}
                        max={range.max}
                        step={range.step}
                        value={amountValue}
                        aria-label={amountKey === 'mortgage' ? 'Mortgage balance' : 'Yearly income'}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        style={{ '--fill': `${((amountValue - range.min) / (range.max - range.min)) * 100}%` }}
                      />
                      <div className="apply-slider-scale">
                        <span>$10K</span>
                        <span>{range.top}</span>
                      </div>
                    </div>
                    {coverage && (
                      <div className="term-estimate">
                        <div className="term-estimate-label">Your starting coverage</div>
                        <div className="term-estimate-amount">{formatMoney(coverage)}</div>
                        <div className="term-estimate-note">
                          {amountKey === 'mortgage' ? 'Matched to your mortgage balance.' : `${shortMoney(data.income)} income × ${INCOME_MULTIPLE}.`} An agent will fine-tune it with you.
                        </div>
                      </div>
                    )}
                  </>
                )}

                {step.id === 'tobacco' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">Health basics</div>
                      <h1>Have you used tobacco or nicotine in the last 2 years?</h1>
                      <p className="apply-subtitle">Cigarettes, vapes, cigars, chew or nicotine pouches.</p>
                    </div>
                    <div className="apply-choice-list">
                      <Choice selected={data.tobacco === 'no'} onClick={() => choose({ tobacco: 'no' })} title="No" body="Non-tobacco rates" />
                      <Choice selected={data.tobacco === 'yes'} onClick={() => choose({ tobacco: 'yes' })} title="Yes" body="Tobacco rates apply — options are still available" />
                    </div>
                  </>
                )}

                {step.id === 'dob' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">About you</div>
                      <h1>What&rsquo;s your date of birth?</h1>
                      <p className="apply-subtitle">Age is the biggest factor in your price.</p>
                    </div>
                    <div className="apply-field term-field-md">
                      <label htmlFor="t-dob">Date of birth</label>
                      <input
                        id="t-dob"
                        className={`apply-input term-input-lg ${dobErr || (tried && !parseDob(data.dob)) ? 'has-error' : ''}`}
                        inputMode="numeric"
                        autoComplete="bday"
                        placeholder="MM/DD/YYYY"
                        autoFocus
                        value={data.dob}
                        onChange={(e) => update({ dob: maskDob(e.target.value) })}
                      />
                      {(dobErr || (tried && !parseDob(data.dob))) && (
                        <p className="term-field-error">{dobErr || 'Enter your date of birth as MM/DD/YYYY.'}</p>
                      )}
                    </div>
                  </>
                )}

                {step.id === 'zip' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">About you</div>
                      <h1>What&rsquo;s your ZIP code?</h1>
                      <p className="apply-subtitle">Options and prices vary by state.</p>
                    </div>
                    <div className="apply-field term-field-md">
                      <label htmlFor="t-zip">ZIP code</label>
                      <input
                        id="t-zip"
                        className={`apply-input term-input-lg ${tried && !valid ? 'has-error' : ''}`}
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="72201"
                        maxLength={5}
                        autoFocus
                        value={data.zip}
                        onChange={(e) => {
                          const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
                          update({ zip });
                          // Five digits = done; move on without a tap.
                          if (zip.length === 5 && data.zip.length < 5) setTimeout(() => goTo(stepIndex + 1), 250);
                        }}
                      />
                      {tried && !valid && <p className="term-field-error">Enter a 5-digit ZIP code.</p>}
                    </div>
                  </>
                )}

                {step.id === 'contact' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">Last step</div>
                      <h1>Where should we send your options?</h1>
                      <p className="apply-subtitle">A licensed agent will follow up with real prices. No spam.</p>
                    </div>
                    <div className="term-contact-notice" role="note">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>
                        {CONTACT_NOTICE} <a href="/data-use#term">Learn more</a>
                      </span>
                    </div>
                    <div className="apply-name-row">
                      <div className="apply-field">
                        <label htmlFor="t-first">First name</label>
                        <input id="t-first" autoComplete="given-name" autoFocus className={`apply-input ${tried && contactErrors.firstName ? 'has-error' : ''}`}
                          value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} />
                        {tried && contactErrors.firstName && <p className="term-field-error">{contactErrors.firstName}</p>}
                      </div>
                      <div className="apply-field">
                        <label htmlFor="t-last">Last name</label>
                        <input id="t-last" autoComplete="family-name" className={`apply-input ${tried && contactErrors.lastName ? 'has-error' : ''}`}
                          value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} />
                        {tried && contactErrors.lastName && <p className="term-field-error">{contactErrors.lastName}</p>}
                      </div>
                    </div>
                    <div className="apply-field">
                      <label htmlFor="t-email">Email</label>
                      <input id="t-email" type="email" inputMode="email" autoComplete="email" className={`apply-input ${tried && contactErrors.email ? 'has-error' : ''}`}
                        value={data.email} onChange={(e) => update({ email: e.target.value })} />
                      {tried && contactErrors.email && <p className="term-field-error">{contactErrors.email}</p>}
                    </div>
                    <div className="apply-field">
                      <label htmlFor="t-phone">Mobile number <span className="term-optional">(fastest way to get your price)</span></label>
                      <input id="t-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(555) 555-5555"
                        className={`apply-input ${tried && contactErrors.phone ? 'has-error' : ''}`}
                        value={data.phone} onChange={(e) => update({ phone: maskPhone(e.target.value) })} />
                      {tried && contactErrors.phone && <p className="term-field-error">{contactErrors.phone}</p>}
                    </div>
                    {phoneDigits(data.phone).length === 10 && (
                      <label className="apply-checkbox-row">
                        <input
                          type="checkbox"
                          checked={data.wantsTexts}
                          onChange={(e) => update({ wantsTexts: e.target.checked, consentAt: e.target.checked ? new Date().toISOString() : null })}
                        />
                        <span>
                          <strong>Optional:</strong> {CONSENT_WORDING}
                        </span>
                      </label>
                    )}
                    <div className="apply-hp" aria-hidden="true">
                      <label>
                        Website
                        <input type="text" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => update({ website: e.target.value })} />
                      </label>
                    </div>
                    {error && <div className="apply-error" role="alert">{error}</div>}
                  </>
                )}

                <div className="apply-nav term-nav">
                  {stepIndex > 0 ? (
                    <button type="button" className="apply-nav-back" onClick={back}>← Back</button>
                  ) : (
                    <Link href="/term" className="apply-nav-back">← Back</Link>
                  )}
                  {step.id === 'contact' ? (
                    <button type="submit" className="btn btn-brass term-cta" disabled={submitting || checking}>
                      {submitting ? 'Sending…' : checking ? 'Securing…' : 'Get my options →'}
                    </button>
                  ) : (
                    !step.auto && (
                      <button type="submit" className="btn btn-brass term-cta">
                        Continue →
                      </button>
                    )
                  )}
                </div>

                {step.id === 'contact' && (
                  <p className="term-privacy">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <rect x="2" y="5.2" width="8" height="5.8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M4 5.2V3.8a2 2 0 0 1 4 0v1.4" stroke="currentColor" strokeWidth="1.2" />
                    </svg>{' '}
                    Your information is encrypted and only used to help with your coverage.{' '}
                    <a href="/data-use">Details</a>
                  </p>
                )}

                <div className="term-inline-call">
                  <span>Rather talk it through?</span>
                  <CallButton onCall={handleCall} variant="outline" />
                  <p className="term-call-notice">{CALL_NOTICE}</p>
                </div>
              </form>
            )}

            {/* Cloudflare's human check: invisible unless it needs one click. */}
            {leadsConfigured && (
              <div className="term-turnstile">
                <Turnstile key={tsKey} siteKey={TURNSTILE_SITE_KEY} onToken={setToken} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Phones: Call button always within thumb reach */}
      <div className="term-callbar">
        <CallButton onCall={handleCall} variant="solid" label="Call for live help" />
        {!done && hasAnyAnswer(data) && <p className="term-callbar-note">The agent will see the answers you&rsquo;ve given so far.</p>}
      </div>

      <footer className="apply-footer">
        <div className="apply-footer-inner">
          <span>
            Term life insurance provides coverage for a set period. Living benefit riders vary by
            insurer and state and may have limits. Applying doesn&rsquo;t start coverage — the
            insurance company decides.
          </span>
          <a href="/data-use">How application information is used</a>
        </div>
      </footer>
    </div>
  );
}
