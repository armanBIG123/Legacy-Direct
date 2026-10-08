'use client';

import { useRef, useState } from 'react';
import ApplyHeader from './ApplyHeader';
import ProgressTrack from './ProgressTrack';
import SummaryPanel from './SummaryPanel';
import IntroScreen from './IntroScreen';
import GateScreen from './GateScreen';
import FitScreen from './FitScreen';
import ContactScreen from './ContactScreen';
import ReviewScreen from './ReviewScreen';
import DoneScreen from './DoneScreen';
import { visibleSteps } from './quizConfig';
import { submitLead } from './submitLead';

const INITIAL_DATA = {
  coverageFor: null,
  applicantFirstName: '',
  applicantLastName: '',
  applicantEmail: '',
  subjectFirstName: '',
  subjectLastName: '',
  yourEmail: '',
  wantsPreviewReminder: false,
  goals: [],
  trigger: null,
  dependents: [],
  childrenCount: null,
  mortgage: 0,
  mortgageTouched: false,
  state: '',
  dobMonth: '',
  dobDay: '',
  dobYear: '',
  sex: null,
  heightFeet: 5,
  heightInches: 10,
  weightLbs: 170,
  hwTouched: false,
  tobacco: null,
  citizenship: null,
  budget: null,
  timing: null,
  mobile: '',
  wantsEmailUpdates: false,
  wantsTexts: false,
  website: '', // honeypot — stays empty for real visitors
};

// How long a picked answer stays highlighted before auto-advancing.
const AUTO_ADVANCE_MS = 220;

export default function ApplyFlow() {
  const [stage, setStage] = useState('intro'); // intro | gate | question | fit | contact | review | done
  const [stepId, setStepId] = useState(null);
  const [data, setData] = useState(INITIAL_DATA);
  const advancing = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const steps = visibleSteps(data);
  const stepIndex = Math.max(0, steps.findIndex((s) => s.id === stepId));
  const current = steps[stepIndex];

  function scrollTop() {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Moves forward using the given data snapshot, so a just-picked answer
  // (which may show or hide later questions) is accounted for immediately.
  function goNext(nextData) {
    const list = visibleSteps(nextData);
    const i = list.findIndex((s) => s.id === current.id);
    if (i < list.length - 1) {
      setStepId(list[i + 1].id);
    } else {
      setStage('fit');
    }
    scrollTop();
  }

  function handleContinue() {
    if (!current.isValid(data)) return;
    const nextData = current.onLeave ? { ...data, ...current.onLeave } : data;
    if (current.onLeave) setData(nextData);
    goNext(nextData);
  }

  function handleChoose(patch) {
    if (advancing.current) return; // ignore double-taps while moving on
    advancing.current = true;
    const nextData = { ...data, ...patch };
    setData(nextData);
    setTimeout(() => {
      advancing.current = false;
      goNext(nextData);
    }, AUTO_ADVANCE_MS);
  }

  function handleBack() {
    if (stepIndex > 0) {
      setStepId(steps[stepIndex - 1].id);
    } else {
      setStage('gate');
    }
    scrollTop();
  }

  function goToFirstQuestion() {
    setStepId(steps[0].id);
    setStage('question');
    scrollTop();
  }

  function goToLastQuestion() {
    setStepId(steps[steps.length - 1].id);
    setStage('question');
    scrollTop();
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitLead(data);
      setStage('done');
      scrollTop();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleStartOver() {
    setData(INITIAL_DATA);
    setStepId(null);
    setStage('intro');
  }

  const showSummary = stage === 'question' || stage === 'contact';
  const valid = current ? current.isValid(data) : false;
  // Single-pick questions advance on tap; the Continue button only appears
  // there once the question already has an answer (e.g. after going Back).
  const showContinue = current && (!current.auto || valid);

  return (
    <div className="apply-page">
      <ApplyHeader />

      <main className="apply-main">
        <div className={`apply-layout ${showSummary ? 'apply-layout-with-summary' : ''}`}>
          <div className="apply-content">
            {stage === 'question' && <ProgressTrack total={steps.length} current={stepIndex} />}

            {stage === 'intro' && <IntroScreen onBegin={() => setStage('gate')} />}

            {stage === 'gate' && (
              <GateScreen
                data={data}
                update={update}
                onBack={() => setStage('intro')}
                onContinue={goToFirstQuestion}
              />
            )}

            {stage === 'question' && current && (
              <div className="apply-question-wrap" key={current.id}>
                <current.Component data={data} update={update} onChoose={handleChoose} />
                <div className="apply-nav">
                  <button type="button" className="apply-nav-back" onClick={handleBack}>
                    Back
                  </button>
                  {showContinue && (
                    <button type="button" className="btn btn-brass" disabled={!valid} onClick={handleContinue}>
                      Continue
                    </button>
                  )}
                </div>
              </div>
            )}

            {stage === 'fit' && (
              <FitScreen
                data={data}
                onBack={goToLastQuestion}
                onContinue={() => {
                  setStage('contact');
                  scrollTop();
                }}
              />
            )}

            {stage === 'contact' && (
              <ContactScreen
                data={data}
                update={update}
                onBack={() => setStage('fit')}
                onEdit={() => setStage('gate')}
                onContinue={() => setStage('review')}
              />
            )}

            {stage === 'review' && (
              <ReviewScreen
                data={data}
                onBack={() => setStage('contact')}
                onEditAnswers={goToFirstQuestion}
                onContinue={handleSubmit}
                submitting={submitting}
                error={submitError}
              />
            )}

            {stage === 'done' && <DoneScreen data={data} onStartOver={handleStartOver} />}
          </div>

          {showSummary && (
            <div className="apply-summary-col">
              <SummaryPanel data={data} />
            </div>
          )}
        </div>
      </main>

      <footer className="apply-footer">
        <div className="apply-footer-inner">
          <span>Applying here does not start coverage. Coverage starts only if and when the insurance company issues your policy.</span>
          <a href="/data-use">How application information is used</a>
        </div>
      </footer>
    </div>
  );
}
