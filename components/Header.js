'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="container nav-wrap">
        <a href="/" className="logo" onClick={closeMenu}>
          <svg width="30" height="26" viewBox="0 0 30 26" fill="none">
            <path d="M2 21H18" stroke="#241134" strokeWidth="1.4" strokeDasharray="3 3" />
            <circle cx="24" cy="21" r="3.4" fill="#241134" />
            <path d="M6 4V16" stroke="#241134" strokeWidth="1.6" />
            <path d="M6 4L14 4" stroke="#241134" strokeWidth="1.6" />
          </svg>
          <span className="logo-word">
            Legacy<b>Direct</b>
          </span>
        </a>

        <div className={`nav-links ${open ? 'open' : ''}`}>
          <nav>
            <ul>
              <li><a href="/#how" onClick={closeMenu}>How it works</a></li>
              <li><a href="/term" onClick={closeMenu}>Term coverage</a></li>
              <li><a href="/#families" onClick={closeMenu}>Who it&apos;s for</a></li>
              <li><a href="/#values" onClick={closeMenu}>Our approach</a></li>
              <li><a href="/#history" onClick={closeMenu}>Track record</a></li>
            </ul>
          </nav>
          <div className="nav-cta">
            <a href="#" className="sign-in-link" onClick={closeMenu} title="Accounts are coming soon">Sign in</a>
            <a
              href="/apply"
              className="btn"
              style={{ background: 'var(--ink)', color: 'var(--paper)' }}
              onClick={closeMenu}
            >
              Start my plan
            </a>
          </div>
        </div>

        <button className="menu-toggle" aria-label="Open menu" onClick={() => setOpen((o) => !o)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
