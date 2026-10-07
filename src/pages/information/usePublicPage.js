import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Scoped to the new public pages; restore the previous metadata on exit.
export function usePublicPage(title, description) {
  const headingRef = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const previousTitle = document.title;
    let meta = document.querySelector('meta[name="description"]');
    const existed = Boolean(meta);
    const previousDescription = meta?.getAttribute('content');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    document.title = `${title} — Sintaximou`;
    meta.setAttribute('content', description);
    return () => {
      document.title = previousTitle;
      if (!existed) meta.remove();
      else if (previousDescription === null) meta.removeAttribute('content');
      else meta.setAttribute('content', previousDescription);
    };
  }, [title, description]);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return headingRef;
}
