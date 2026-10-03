'use client';

export default function DoneScreen({ data, onStartOver }) {
  const isMe = data.coverageFor === 'me';
  const email = isMe ? data.applicantEmail : data.yourEmail;

  return (
    <div className="apply-bookend">
      <div className="apply-eyebrow">You&rsquo;re on the list</div>
      <h1>Nice work — your plan preview is ready.</h1>
      <p className="apply-bookend-lede">
        Next, we&rsquo;ll have you set up a free LegacyDirect account at {email || 'the email you gave us'} so
        you can track this from here. A licensed advisor will reach out to review it with you before
        anything goes to the insurance company.
      </p>
      <p className="apply-bookend-fine">
        Account creation is coming very soon — this preview isn&rsquo;t saved anywhere yet, so hold
        onto your answers if you&rsquo;d like a head start when it opens up.
      </p>
      <button type="button" className="btn btn-outline-dark" onClick={onStartOver}>
        Start a new preview
      </button>
    </div>
  );
}
