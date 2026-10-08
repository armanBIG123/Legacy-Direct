'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TermHeader from './TermHeader';
import CallButton from './CallButton';
import ProgressTrack from '../apply/ProgressTrack';
import Turnstile from '../apply/Turnstile';
import { TURNSTILE_SITE_KEY, leadsConfigured } from '../apply/leadConfig';
import { TEXT_CONSENT_WORDING } from '../apply/submitLead';
import { NEEDS, INCOME_MULTIPLE, AGENT_PHONE_DISPLAY, suggestedCoverage, formatMoney, shortMoney } from './termConfig';
import { sendCallCapture, submitTermLead, hasAnyAnswer } from './submitTermLead';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const INITIAL = {
  need: null,
  income: 60000,
  incomeTouched: false,
  mortgage: 250000,
  mortgageTouched: false,
  tobacco: null,
  dobMonth: '',
  dobDay: '',
  dobYear: '',
  zip: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  wantsTexts: false,
  website: '', // honeypot
  completed: false,
  callClickedAt: null,
};

const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((e || '').trim());

// The questions, in order. `auto` = picking an answer moves on by itself.
const STEPS = [
  { id: 'need', auto: true, valid: (d) => !!d.need },
  { id: 'amount', valid: () => true },
  { id: 'tobacco', auto: true, valid: (d) => !!d.tobacco },
  { id: 'dob', valid: (d) => d.dobMonth && d.dobDay && String(d.dobYear).length === 4 },
  { id: 'zip', valid: (d) => /^\d{5}$/.test(d.zip) },
  { id: 'name', valid: (d) => d.firstName.trim() && d.lastName.trim() },
  { id: 'contact', valid: (d) => validEmail(d.email) },
];

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
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
  const [token, setToken] = useState('');
  const [tsKey, setTsKey] = useState(0);
  const [pendingCall, setPendingCall] = useState(false);
  const [callNote, setCallNote] = useState(false);
  const sessionId = useRef(null);
  const advancing = useRef(false);
  const latest = useRef(data);
  latest.current = data;

  const update = (patch) => setData((d) => ({ ...d, ...patch }));
  const step = STEPS[stepIndex];

  // One id per visit, plus a need picked on the landing page (?need=mortgage).
  useEffect(() => {
    sessionId.current = newSessionId();
    const need = new URLSearchParams(window.location.search).get('need');
    if (NEEDS[need]) {
      setData((d) => ({ ...d, need }));
      setStepIndex(1);
    }
  }, []);

  function freshToken() {
    setToken('');
    setTsKey((k) => k + 1);
  }

  // Someone tapped Call. Save what they've entered (never blocks the call).
  function handleCall() {
    const snapshot = {
      ...latest.current,
      callClickedAt: latest.current.callClickedAt || new Date().toISOString(),
      lastStep: done ? 'done' : STEPS[stepIndex].id,
    };
    setData((d) => ({ ...d, callClickedAt: snapshot.callClickedAt }));
    setCallNote(true);
    if (!hasAnyAnswer(snapshot)) return;
    if (token) {
      sendCallCapture(sessionId.current, token, snapshot);
      freshToken();
    } else {
      setPendingCall(snapshot);
    }
  }

  // If they tapped Call before the security check finished, send once it does.
  useEffect(() => {
    if (pendingCall && token) {
      sendCallCapture(sessionId.current, token, pendingCall);
      setPendingCall(false);
      freshToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCall, token]);

  function next(patch = {}) {
    const d = { ...data, ...patch };
    if (!STEPS[stepIndex].valid(d)) return;
    setData(d);
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function choose(patch) {
    if (advancing.current) return;
    advancing.current = true;
    setData((d) => ({ ...d, ...patch }));
    setTimeout(() => {
      advancing.current = false;
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  }

  function back() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  async function submit() {
    if (submitting || !step.valid(data)) return;
    setSubmitting(true);
    setError('');
    try {
      await submitTermLead(sessionId.current, token, data);
      setData((d) => ({ ...d, completed: true }));
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      freshToken();
    }
  }

  const coverage = suggestedCoverage(data);
  const need = NEEDS[data.need];
  const amountKey = need?.basis === 'mortgage' ? 'mortgage' : 'income';
  const valid = step.valid(data);
  const checking = leadsConfigured && !token;

  return (
    <div className="apply-page term-page">
      <TermHeader onCall={handleCall} />

      <main className="apply-main">
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
                  A licensed agent will reach out{data.phone ? ' by phone' : ''} to go over your{' '}
                  {need ? need.title.toLowerCase() : 'term'} options
                  {coverage ? <> starting around <strong>{formatMoney(coverage)}</strong></> : null}.
                </p>
                <div className="done-card">
                  <div className="done-card-label">Want to talk now?</div>
                  <p style={{ marginBottom: 14 }}>Skip the wait — a licensed agent can walk you through it today.</p>
                  <CallButton onCall={handleCall} variant="solid" />
                </div>
                <p className="done-fine">
                  Coverage, price and eligibility are decided by the insurance company after you apply.{' '}
                  <a href="/data-use">How your information is used</a>
                </p>
                <Link href="/term" className="apply-nav-back">Back to term coverage</Link>
              </div>
            ) : (
              <div className="apply-question-wrap" key={step.id}>
                <ProgressTrack total={STEPS.length} current={stepIndex} />

                {step.id === 'need' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">Term coverage</div>
                      <h1>What do you want your coverage to protect?</h1>
                      <p className="apply-subtitle">Pick the one that matters most right now. You can talk through the rest with an agent.</p>
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
                      <div className="apply-eyebrow">{need.title}</div>
                      <h1>{amountKey === 'mortgage' ? 'About how much is left on your mortgage?' : 'About how much do you earn in a year?'}</h1>
                      <p className="apply-subtitle">
                        {amountKey === 'mortgage'
                          ? 'Your coverage is matched to what you owe, so your family can keep the house.'
                          : `We start at about ${INCOME_MULTIPLE}× your yearly income — enough to replace your paycheck for years.`}{' '}
                        A rough number is fine.
                      </p>
                    </div>
                    <div className="apply-slider">
                      <div className="apply-slider-value">
                        {amountKey === 'mortgage'
                          ? data.mortgage >= 1500000 ? '$1.5M+' : formatMoney(data.mortgage)
                          : data.income >= 400000 ? '$400K+' : formatMoney(data.income)}
                        {amountKey === 'income' && <span className="term-per">/yr</span>}
                      </div>
                      <input
                        type="range"
                        min={amountKey === 'mortgage' ? 10000 : 10000}
                        max={amountKey === 'mortgage' ? 1500000 : 400000}
                        step={amountKey === 'mortgage' ? 10000 : 5000}
                        value={amountKey === 'mortgage' ? data.mortgage : data.income}
                        aria-label={amountKey === 'mortgage' ? 'Mortgage balance' : 'Yearly income'}
                        onChange={(e) =>
                          update(amountKey === 'mortgage' ? { mortgage: Number(e.target.value), mortgageTouched: true } : { income: Number(e.target.value), incomeTouched: true })
                        }
                        style={{
                          '--fill': `${(((amountKey === 'mortgage' ? data.mortgage : data.income) - 10000) / ((amountKey === 'mortgage' ? 1500000 : 400000) - 10000)) * 100}%`,
                        }}
                      />
                      <div className="apply-slider-scale">
                        <span>$10K</span>
                        <span>{amountKey === 'mortgage' ? '$1.5M+' : '$400K+'}</span>
                      </div>
                    </div>
                    {coverage && (
                      <div className="term-estimate">
                        <div className="term-estimate-label">Your starting coverage</div>
                        <div className="term-estimate-amount">{formatMoney(coverage)}</div>
                        <div className="term-estimate-note">
                          {amountKey === 'mortgage' ? 'Matched to your mortgage balance.' : `${shortMoney(data.income)} × ${INCOME_MULTIPLE}.`} An agent will fine-tune it with you.
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
                      <p className="apply-subtitle">Includes cigarettes, vapes, cigars, chew and nicotine pouches. It’s one of the biggest factors in price.</p>
                    </div>
                    <div className="apply-choice-list">
                      <Choice selected={data.tobacco === 'no'} onClick={() => choose({ tobacco: 'no' })} title="No" body="Non-smoker rates" />
                      <Choice selected={data.tobacco === 'yes'} onClick={() => choose({ tobacco: 'yes' })} title="Yes" body="Tobacco rates apply — options are still available" />
                    </div>
                  </>
                )}

                {step.id === 'dob' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">About you</div>
                      <h1>What&rsquo;s your date of birth?</h1>
                      <p className="apply-subtitle">Age sets your rate, so this keeps your estimate accurate.</p>
                    </div>
                    <div className="apply-dob-row">
                      <div className="apply-field">
                        <label htmlFor="t-month">Month</label>
                        <select id="t-month" className="apply-select" value={data.dobMonth} onChange={(e) => update({ dobMonth: e.target.value })}>
                          <option value="">Select</option>
                          {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div className="apply-field apply-field-narrow">
                        <label htmlFor="t-day">Day</label>
                        <input id="t-day" inputMode="numeric" className="apply-input" placeholder="15" maxLength={2} value={data.dobDay}
                          onChange={(e) => update({ dobDay: e.target.value.replace(/\D/g, '') })} />
                      </div>
                      <div className="apply-field apply-field-narrow">
                        <label htmlFor="t-year">Year</label>
                        <input id="t-year" inputMode="numeric" className="apply-input" placeholder="1985" maxLength={4} value={data.dobYear}
                          onChange={(e) => update({ dobYear: e.target.value.replace(/\D/g, '') })} />
                      </div>
                    </div>
                  </>
                )}

                {step.id === 'zip' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">About you</div>
                      <h1>What&rsquo;s your ZIP code?</h1>
                      <p className="apply-subtitle">Coverage options and pricing vary by state.</p>
                    </div>
                    <div className="apply-field apply-field-narrow-mobile">
                      <label htmlFor="t-zip">ZIP code</label>
                      <input id="t-zip" inputMode="numeric" autoComplete="postal-code" className="apply-input" placeholder="72201" maxLength={5} value={data.zip}
                        onChange={(e) => update({ zip: e.target.value.replace(/\D/g, '') })} />
                    </div>
                  </>
                )}

                {step.id === 'name' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">Almost done</div>
                      <h1>What&rsquo;s your name?</h1>
                      <p className="apply-subtitle">Use your legal name — it&rsquo;s what goes on the policy.</p>
                    </div>
                    <div className="apply-name-row">
                      <div className="apply-field">
                        <label htmlFor="t-first">First name</label>
                        <input id="t-first" autoComplete="given-name" className="apply-input" value={data.firstName} onChange={(e) => update({ firstName: e.target.value })} />
                      </div>
                      <div className="apply-field">
                        <label htmlFor="t-last">Last name</label>
                        <input id="t-last" autoComplete="family-name" className="apply-input" value={data.lastName} onChange={(e) => update({ lastName: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {step.id === 'contact' && (
                  <>
                    <div className="apply-step-heading">
                      <div className="apply-eyebrow">Last step</div>
                      <h1>Where should your agent reach you, {data.firstName || 'friend'}?</h1>
                      <p className="apply-subtitle">A licensed agent will follow up with your options. No spam, ever.</p>
                    </div>
                    <div className="apply-field">
                      <label htmlFor="t-email">Email</label>
                      <input id="t-email" type="email" autoComplete="email" className="apply-input" value={data.email} onChange={(e) => update({ email: e.target.value })} />
                    </div>
                    <div className="apply-field apply-field-narrow-mobile">
                      <label htmlFor="t-phone">Mobile number <span className="term-optional">(recommended)</span></label>
                      <input id="t-phone" type="tel" autoComplete="tel" className="apply-input" placeholder="(555) 555-5555" value={data.phone} onChange={(e) => update({ phone: e.target.value })} />
                      <p className="apply-field-note">The fastest way to get your price — an agent can walk you through it in one call.</p>
                    </div>
                    {data.phone && (
                      <label className="apply-checkbox-row">
                        <input type="checkbox" checked={data.wantsTexts} onChange={(e) => update({ wantsTexts: e.target.checked })} />
                        <span>{TEXT_CONSENT_WORDING}</span>
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

                <div className="apply-nav">
                  {stepIndex > 0 ? (
                    <button type="button" className="apply-nav-back" onClick={back}>Back</button>
                  ) : (
                    <Link href="/term" className="apply-nav-back">Back</Link>
                  )}
                  {step.id === 'contact' ? (
                    <button type="button" className="btn btn-brass" onClick={submit} disabled={!valid || submitting || checking}>
                      {submitting ? 'Sending…' : checking ? 'Securing…' : 'Get my options'}
                    </button>
                  ) : (
                    (!step.auto || valid) && (
                      <button
                        type="button"
                        className="btn btn-brass"
                        disabled={!valid}
                        onClick={() => next(step.id === 'amount' ? (amountKey === 'mortgage' ? { mortgageTouched: true } : { incomeTouched: true }) : {})}
                      >
                        Continue
                      </button>
                    )
                  )}
                </div>

                <div className="term-inline-call">
                  <span>Rather talk it through?</span>
                  <CallButton onCall={handleCall} variant="outline" />
                </div>
              </div>
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
