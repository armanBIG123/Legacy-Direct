'use client';

import { useEffect, useRef, useState } from 'react';

// Wraps a section in the "reveal" fade/slide-up treatment used across the
// page. Adds "is-visible" once the element scrolls into view, and skips
// straight to visible for people who prefer reduced motion.
export default function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = ['reveal', visible ? 'is-visible' : '', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
