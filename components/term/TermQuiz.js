'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CallButton, { CALL_EVENT } from './CallButton';
import ProgressTrack from '../apply/ProgressTrack';
import Turnstile from '../apply/Turnstile';
import { TURNSTILE_SITE_KEY, leadsConfigured } from '../apply/leadConfig';
import { START_NOTICE, CALL_NOTICE, CONSENT_WORDING } from './disclosures';
import { NEEDS, INCOME_MULTIPLE, AGENT_PHONE_DISPLAY, suggestedCoverage, formatMoney, shortMoney } from './termConfig';
import { sendSnapshot, submitTermLead, hasAnyAnswer, hasContact, parseDob, ageFrom, phoneDigits } from './submitTermLead';
import { captureAttribution } from './attribution';
import { trackEvent } from './track';
import { AgreeLine } from '../legal/AgencyLine';

// Landing-page need cards send this to preset the coverage need.
export const NEED_EVENT = 'ld-term-need';

const INITIAL = {
  need: null,
  needFromLanding: false, // picked on /term, so the need question is skipped
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
  if (age < 18) return 'Coverage here is for adults 18 and older.';
  if (age > 85) return 'Online options are limited past 85 — call us and an agent will help.';
  return null;
}

// Screens, in order. The first screen is short on purpose — name, email,
// phone and ZIP — so as many visitors as possible fill it in and tap
// Continue; it's saved even if they stop there. The last screen sends the
// request as soon as they answer it.
// `auto` = picking an answer moves on by itself; `when` = skipped if false.
const startValid = (d) =>
  !!d.firstName.trim() &&
  !!d.lastName.trim() &&
  validEmail(d.email) &&
  (!d.phone || phoneDigits(d.phone).length === 10) &&
  /^\d{5}$/.test(d.zip);
const STEPS = [
  { id: 'start', valid: startValid },
  { id: 'dob', valid: (d) => !!parseDob(d.dob) && !dobProblem(d.dob) },
  { id: 'need', auto: true, valid: (d) => !!d.need, when: (d) => !d.needFromLanding },
  { id: 'amount', valid: () => true },
  { id: 'tobacco', auto: true, valid: (d) => !!d.tobacco },
];
const visibleSteps = (d) => STEPS.filter((s) => !s.when || s.when(d));

// Later questions use the covered person's first name, which reads right
// whether they're covering themselves or someone else.
function person(d) {
  const first = d.firstName.trim();
  return { name: first || 'you', possessive: first ? `${first}’s` : 'your' };
}

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

// The term quiz. Used two ways:
//   - its own page (/term/apply), wrapped by TermFlow
//   - embedded in the /term landing hero (embedded = true), so the first
//     question is the first thing visitors see
export default function TermQuiz({ embedded = false, onStepChange }) {
  const [data, setData] = useState(INITIAL);
  const [stepId, setStepId] = useState('start');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tried, setTried] = useState(false);
  const [token, setToken] = useState('');
  const [tsKey, setTsKey] = useState(0);
  const [pendingSave, setPendingSave] = useState(null);
  const [pendingSubmit, setPendingSubmit] = useState(null);
  const [callNote, setCallNote] = useState(false);
  const rootRef = useRef(null);
  const sessionId = useRef(null);
  const advancing = useRef(false);
  const lastSaved = useRef('');
  const latest = useRef(data);
  latest.current = data;
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const stepRef = useRef(stepId);
  stepRef.current = stepId;
  const doneRef = useRef(done);
  doneRef.current = done;

  const update = (patch) => setData((d) => ({ ...d, ...patch }));
  const steps = visibleSteps(data);
  const stepIndex = Math.max(0, steps.findIndex((x) => x.id === stepId));
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const who = person(data);
  const H = embedded ? 'h2' : 'h1'; // the landing page already has its h1

  // One id per visit, where they came from, and a need from the link
  // (?need=mortgage means the "what to protect" question is skipped).
  useEffect(() => {
    sessionId.current = newSessionId();
    captureAttribution();
    const need = new URLSearchParams(window.location.search).get('need');
    if (NEEDS[need]) {
      setData((d) => ({ ...d, need, needFromLanding: true }));
      trackEvent('term_start', { need, from: 'link' });
    }
  }, []);

  // Every Call button on the page (header, sticky bar, inline) announces
  // itself; the quiz saves what's been entered and records the tap.
  useEffect(() => {
    function onCallEvent(e) {
      if (e.detail) e.detail.handled = true;
      handleCall(e.detail?.where);
    }
    function onNeedEvent(e) {
      const need = e.detail?.need;
      if (!NEEDS[need]) return;
      setData((d) => ({ ...d, need, needFromLanding: true }));
      trackEvent('term_start', { need, from: 'landing_card' });
      scrollToQuiz(true);
    }
    window.addEventListener(CALL_EVENT, onCallEvent);
    window.addEventListener(NEED_EVENT, onNeedEvent);
    return () => {
      window.removeEventListener(CALL_EVENT, onCallEvent);
      window.removeEventListener(NEED_EVENT, onNeedEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onStepChange) onStepChange(done ? 'done' : stepId);
    if (done) return;
    trackEvent('term_step', { step: stepId, number: stepIndex + 1 });
    // Once we can reach them, keep their saved answers current at every step.
    if (hasContact(latest.current)) save({ ...latest.current, lastStep: stepId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId, done]);

  function freshToken() {
    setToken('');
    setTsKey((k) => k + 1);
  }

  // Save a snapshot in the background, skipping exact repeats. If the
  // security check hasn't finished yet, queue it until it does (only the
  // newest snapshot is kept).
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
    if (!token) return;
    if (pendingSubmit) {
      // The final submit carries everything, so a queued save isn't needed.
      const d = pendingSubmit;
      setPendingSubmit(null);
      setPendingSave(null);
      submit(d);
    } else if (pendingSave) {
      const s = pendingSave;
      setPendingSave(null);
      save(s, { force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSave, pendingSubmit, token]);

  // Tapped Call: save what they've entered. Never blocks the call.
  function handleCall(where) {
    const cur = latest.current;
    const snapshot = {
      ...cur,
      callClickedAt: cur.callClickedAt || new Date().toISOString(),
      lastStep: doneRef.current ? 'done' : stepRef.current,
    };
    setData((d) => ({ ...d, callClickedAt: snapshot.callClickedAt }));
    setCallNote(true);
    trackEvent('term_call', { step: snapshot.lastStep, where });
    save(snapshot, { force: true });
  }

  // Typed a usable email or phone, or a birth date? Save quietly after a
  // pause, so someone who leaves right away is still a lead.
  useEffect(() => {
    if (done || (stepId !== 'start' && stepId !== 'dob') || !hasContact(data)) return;
    const t = setTimeout(() => save({ ...latest.current, lastStep: stepId }), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.email, data.phone, data.firstName, data.lastName, data.dob, data.zip, data.wantsTexts, stepId, done]);

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

  // On its own page: back to the top. Embedded: bring the quiz card into
  // view only if it has scrolled away.
  function scrollToQuiz(force = false) {
    if (!embedded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    if (force || top < 0 || top > window.innerHeight * 0.6) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goTo(id) {
    setStepId(id);
    setTried(false);
    scrollToQuiz();
  }

  // Next screen after the current one, given the (possibly just-changed) data.
  function nextId(d) {
    const list = visibleSteps(d);
    const i = list.findIndex((x) => x.id === stepId);
    return i >= 0 && i < list.length - 1 ? list[i + 1].id : null;
  }

  function next(patch = {}) {
    const d = { ...data, ...patch };
    setData(d);
    if (!step.valid(d)) {
      setTried(true);
      return;
    }
    const id = nextId(d);
    if (id) goTo(id);
  }

  function choose(patch) {
    if (advancing.current) return;
    advancing.current = true;
    const d = { ...data, ...patch };
    setData(d);
    if (patch.need) trackEvent('term_start', { need: patch.need, from: 'quiz' });
    setTimeout(() => {
      advancing.current = false;
      if (isLast) finish(d);
      else {
        const id = nextId(d);
        if (id) goTo(id);
      }
    }, 200);
  }

  // Send the finished request, waiting for the security check if needed.
  function finish(d = data) {
    if (submitting || pendingSubmit) return;
    if (leadsConfigured && !tokenRef.current) {
      setError('');
      setPendingSubmit(d);
    } else {
      submit(d);
    }
  }

  function back() {
    if (stepIndex > 0) goTo(steps[stepIndex - 1].id);
  }

  // From the amount screen: go back and pick a different need.
  function changeNeed() {
    setData((d) => ({ ...d, needFromLanding: false }));
    goTo('need');
  }

  async function submit(d = data) {
    if (submitting) return;
    if (!step.valid(d)) {
      setTried(true);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitTermLead(sessionId.current, tokenRef.current, d);
      setData((x) => ({ ...x, completed: true }));
      setDone(true);
      trackEvent('term_lead', { need: d.need, coverage: suggestedCoverage(d) });
      scrollToQuiz(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      freshToken();
    }
  }

  function onFormSubmit(e) {
    e.preventDefault();
    if (isLast) finish();
    else if (!step.auto) next(stepId === 'amount' ? amountPatch() : {});
  }

  const coverage = suggestedCoverage(data);
  const need = NEEDS[data.need];
  const amountKey = need?.basis === 'mortgage' ? 'mortgage' : 'income';
  const range = RANGE[amountKey];
  const amountValue = amountKey === 'mortgage' ? data.mortgage : data.income;
  const amountPatch = () => (amountKey === 'mortgage' ? { mortgageTouched: true } : { incomeTouched: true });
  const setAmount = (v) => update(amountKey === 'mortgage' ? { mortgage: v, mortgageTouched: true } : { income: v, incomeTouched: true });
  const dobErr = dobProblem(data.dob);

  // Field-level hints, shown after they try to continue.
  const startErrors = {
    firstName: !data.firstName.trim() && 'Add a first name',
    lastName: !data.lastName.trim() && 'Add a last name',
    email: !validEmail(data.email) && 'Enter a valid email',
    zip: !/^\d{5}$/.test(data.zip) && 'Enter a 5-digit ZIP code',
    phone: data.phone && phoneDigits(data.phone).length !== 10 && 'Enter a 10-digit number, or leave it blank',
  };
  const sending = submitting || !!pendingSubmit;
  const eyebrow = data.needFromLanding && need ? `${need.title} · Term life` : 'Term life coverage';

  return (
    <div className={`term-quiz ${embedded ? 'term-quiz-embedded' : ''}`} ref={rootRef} id={embedded ? 'get-started' : undefined}>
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
          <H className="done-title">You&rsquo;re all set.</H>
          <p className="done-lede">
            A licensed agent will reach out{data.phone ? <> at <strong>{maskPhone(data.phone)}</strong></> : null} to go over {who.possessive}{' '}
            {need ? need.title.toLowerCase() : 'term'} options
            {coverage ? <> starting around <strong>{formatMoney(coverage)}</strong></> : null}.
          </p>
          <div className="done-card term-done-call">
            <div className="done-card-label">Want your price faster?</div>
            <p>A licensed agent can walk you through your options and price on the phone.</p>
            <CallButton variant="solid" label="Call a licensed agent" where="done" />
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
            <a href="/privacy">How your information is used</a>
          </p>
          {!embedded && <Link href="/term" className="apply-nav-back">Back to term coverage</Link>}
        </div>
      ) : (
        <form className="apply-question-wrap" key={step.id} onSubmit={onFormSubmit} noValidate>
          <ProgressTrack total={steps.length} current={stepIndex} />

          {step.id === 'start' && (
            <>
              <div className="apply-step-heading">
                <div className={`apply-eyebrow ${embedded && !data.needFromLanding ? 'term-eyebrow-generic' : ''}`}>{eyebrow}</div>
                <H>Who&rsquo;s this coverage for?</H>
                <p className="apply-subtitle term-start-sub">About two minutes. No exam to start, no Social Security number.</p>
              </div>
              <div className="term-start-form">
                <div className="apply-name-row term-row-keep">
                  <div className="apply-field">
                    <label htmlFor="t-first">First name</label>
                    <input id="t-first" autoComplete="given-name" className={`apply-input ${tried && startErrors.firstName ? 'has-error' : ''}`}
                      value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} />
                    {tried && startErrors.firstName && <p className="term-field-error">{startErrors.firstName}</p>}
                  </div>
                  <div className="apply-field">
                    <label htmlFor="t-last">Last name</label>
                    <input id="t-last" autoComplete="family-name" className={`apply-input ${tried && startErrors.lastName ? 'has-error' : ''}`}
                      value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} />
                    {tried && startErrors.lastName && <p className="term-field-error">{startErrors.lastName}</p>}
                  </div>
                </div>
                <div className="apply-field">
                  <label htmlFor="t-email">Email</label>
                  <input id="t-email" type="email" inputMode="email" autoComplete="email" className={`apply-input ${tried && startErrors.email ? 'has-error' : ''}`}
                    value={data.email} onChange={(e) => update({ email: e.target.value })} />
                  {tried && startErrors.email && <p className="term-field-error">{startErrors.email}</p>}
                </div>
                <div className="apply-name-row term-row-keep term-row-phonezip">
                  <div className="apply-field">
                    <label htmlFor="t-phone">
                      Mobile number <span className="term-optional">(optional)</span>
                    </label>
                    <input id="t-phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(555) 555-5555"
                      className={`apply-input ${tried && startErrors.phone ? 'has-error' : ''}`}
                      value={data.phone} onChange={(e) => update({ phone: maskPhone(e.target.value) })} />
                    {tried && startErrors.phone && <p className="term-field-error">{startErrors.phone}</p>}
                  </div>
                  <div className="apply-field">
                    <label htmlFor="t-zip">ZIP code</label>
                    <input id="t-zip" inputMode="numeric" autoComplete="postal-code" placeholder="72201" maxLength={5}
                      className={`apply-input ${tried && startErrors.zip ? 'has-error' : ''}`}
                      value={data.zip} onChange={(e) => update({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })} />
                    {tried && startErrors.zip && <p className="term-field-error">{startErrors.zip}</p>}
                  </div>
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
              </div>
              <div className="term-contact-notice" role="note">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>
                  {START_NOTICE} <a href="/privacy#term">Learn more</a>
                </span>
              </div>
              <div className="apply-hp" aria-hidden="true">
                <label>
                  Website
                  <input type="text" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => update({ website: e.target.value })} />
                </label>
              </div>
            </>
          )}

          {step.id === 'dob' && (
            <>
              <div className="apply-step-heading">
                <div className="apply-eyebrow">About {who.name}</div>
                <H>When was {who.name} born?</H>
                <p className="apply-subtitle">Age is the biggest factor in price.</p>
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
                  <p className="term-field-error">{dobErr || 'Enter the date of birth as MM/DD/YYYY.'}</p>
                )}
              </div>
            </>
          )}

          {step.id === 'need' && (
            <>
              <div className="apply-step-heading">
                <div className="apply-eyebrow">Term life coverage</div>
                <H>What should {who.possessive} coverage protect?</H>
                <p className="apply-subtitle">Pick the one that matters most right now.</p>
              </div>
              <div className="apply-choice-list">
                {Object.values(NEEDS).map((n) => (
                  <Choice key={n.key} selected={data.need === n.key} onClick={() => choose({ need: n.key })} title={n.title} tag={n.tag} body={n.body} />
                ))}
              </div>
            </>
          )}

          {step.id === 'amount' && need && (
            <>
              <div className="apply-step-heading">
                <div className="apply-eyebrow">
                  {need.title}
                  <button type="button" className="term-change-link" onClick={changeNeed}>Change</button>
                </div>
                <H>
                  {amountKey === 'mortgage' ? 'About how much is left on the mortgage?' : `About how much does ${who.name} earn in a year?`}
                </H>
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
                  <div className="term-estimate-label">Starting coverage</div>
                  <div className="term-estimate-amount">{formatMoney(coverage)}</div>
                  <div className="term-estimate-note">
                    {amountKey === 'mortgage' ? 'Matched to the mortgage balance.' : `${shortMoney(data.income)} income × ${INCOME_MULTIPLE}.`} An agent will fine-tune it with you.
                  </div>
                </div>
              )}
            </>
          )}

          {step.id === 'tobacco' && (
            <>
              <div className="apply-step-heading">
                <div className="apply-eyebrow">Last question</div>
                <H>Has {who.name} used tobacco or nicotine in the last 2 years?</H>
                <p className="apply-subtitle">
                  Cigarettes, vapes, cigars, chew or nicotine pouches. Your answer sends your request to a licensed agent.
                </p>
              </div>
              <div className="apply-choice-list" aria-busy={sending}>
                <Choice selected={data.tobacco === 'no'} onClick={() => !sending && choose({ tobacco: 'no' })} title="No" body="Non-tobacco rates" />
                <Choice selected={data.tobacco === 'yes'} onClick={() => !sending && choose({ tobacco: 'yes' })} title="Yes" body="Tobacco rates apply — options are still available" />
              </div>
              {sending && <p className="term-sending" role="status">Sending your request…</p>}
              {error && <div className="apply-error" role="alert">{error}</div>}
            </>
          )}

          <div className="apply-nav term-nav">
            {stepIndex > 0 ? (
              <button type="button" className="apply-nav-back" onClick={back}>← Back</button>
            ) : embedded ? (
              <span />
            ) : (
              <Link href="/term" className="apply-nav-back">← Back</Link>
            )}
            {isLast ? (
              data.tobacco && !sending && (
                <button type="submit" className="btn btn-brass term-cta">
                  {error ? 'Try again →' : 'Get my options →'}
                </button>
              )
            ) : (
              !step.auto && (
                <button type="submit" className="btn btn-brass term-cta">
                  {step.id === 'start' ? 'See my coverage →' : 'Continue →'}
                </button>
              )
            )}
          </div>

          {step.id === 'start' && <AgreeLine className="term-agree" />}
          {isLast && (
            <p className="term-privacy">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <rect x="2" y="5.2" width="8" height="5.8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 5.2V3.8a2 2 0 0 1 4 0v1.4" stroke="currentColor" strokeWidth="1.2" />
              </svg>{' '}
              Your information is encrypted and only used to help with your coverage.{' '}
              <a href="/privacy">Details</a>
            </p>
          )}

          {!embedded && (
            <div className="term-inline-call">
              <span>Rather talk it through?</span>
              <CallButton variant="outline" where="inline" />
              <p className="term-call-notice">{CALL_NOTICE}</p>
            </div>
          )}
        </form>
      )}

      {/* Cloudflare's human check: invisible unless it needs one click. */}
      {leadsConfigured && (
        <div className="term-turnstile">
          <Turnstile key={tsKey} siteKey={TURNSTILE_SITE_KEY} onToken={setToken} />
        </div>
      )}
    </div>
  );
}
