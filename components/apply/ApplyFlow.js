'use client';

import { useState } from 'react';
import ApplyHeader from './ApplyHeader';
import ProgressTrack from './ProgressTrack';
import SummaryPanel from './SummaryPanel';
import IntroScreen from './IntroScreen';
import GateScreen from './GateScreen';
import ContactScreen from './ContactScreen';
import ReviewScreen from './ReviewScreen';
import DoneScreen from './DoneScreen';
import { QUESTION_STEPS } from './quizConfig';

const INITIAL_DATA = {
  coverageFor: null,
  applicantFirstName: '',
  applicantLastName: '',
  applicantEmail: '',
  subjectFirstName: '',
  subjectLastName: '',
  yourEmail: '',
  wantsPreviewReminder: false,
  goal: null,
  state: '',
  dobMonth: '',
  dobDay: '',
  dobYear: '',
  sex: null,
  heightFeet: 5,
  heightInches: 10,
  weightLbs: 170,
  mobile: '',
  wantsEmailUpdates: false,
  wantsTexts: false,
};

export default function ApplyFlow() {
  const [stage, setStage] = useState('intro'); // intro | gate | question | contact | review | done
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);

  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  function handleStartOver() {
    setData(INITIAL_DATA);
    setStepIndex(0);
    setStage('intro');
  }

  function handleQuestionContinue() {
    const current = QUESTION_STEPS[stepIndex];
    if (!current.isValid(data)) return;
    if (stepIndex < QUESTION_STEPS.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      setStage('contact');
    }
  }

  function handleQuestionBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      setStage('gate');
    }
  }

  const showSummary = stage === 'question' || stage === 'contact';

  return (
    <div className="apply-page">
      <ApplyHeader />

      <main className="apply-main">
        <div className={`apply-layout ${showSummary ? 'apply-layout-with-summary' : ''}`}>
          <div className="apply-content">
            {stage === 'question' && (
              <ProgressTrack total={QUESTION_STEPS.length} current={stepIndex} />
            )}

            {stage === 'intro' && <IntroScreen onBegin={() => setStage('gate')} />}

            {stage === 'gate' && (
              <GateScreen
                data={data}
                update={update}
                onBack={() => setStage('intro')}
                onContinue={() => {
                  setStepIndex(0);
                  setStage('question');
                }}
              />
            )}

            {stage === 'question' &&
              (() => {
                const StepComponent = QUESTION_STEPS[stepIndex].Component;
                const valid = QUESTION_STEPS[stepIndex].isValid(data);
                return (
                  <div className="apply-question-wrap">
                    <StepComponent data={data} update={update} />
                    <div className="apply-nav">
                      <button type="button" className="apply-nav-back" onClick={handleQuestionBack}>
                        Back
                      </button>
                      <button
                        type="button"
                        className="btn btn-brass"
                        disabled={!valid}
                        onClick={handleQuestionContinue}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                );
              })()}

            {stage === 'contact' && (
              <ContactScreen
                data={data}
                update={update}
                onBack={() => {
                  setStepIndex(QUESTION_STEPS.length - 1);
                  setStage('question');
                }}
                onEdit={() => setStage('gate')}
                onContinue={() => setStage('review')}
              />
            )}

            {stage === 'review' && (
              <ReviewScreen
                data={data}
                onBack={() => setStage('contact')}
                onEditAnswers={() => {
                  setStepIndex(0);
                  setStage('question');
                }}
                onContinue={() => setStage('done')}
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
