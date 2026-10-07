import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supportingTools, toolPaths } from '../../config/toolsNavigation';
import { isPaidServiceLive } from '../../config/paidService';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const menuButton = useRef(null);
  const toolsButton = useRef(null);
  const navbar = useRef(null);
  const toolsGroup = useRef(null);
  const active = path => location.pathname === path
    || (path === '/enimerosi' && location.pathname.startsWith('/enimerosi/'));

  const closeMenus = () => { setMenuOpen(false); setToolsOpen(false); };
  useEffect(closeMenus, [location.pathname, location.search, location.key]);

  useEffect(() => {
    const onOutsideClick = event => {
      if (!navbar.current?.contains(event.target)) closeMenus();
      else if (!toolsGroup.current?.contains(event.target)) setToolsOpen(false);
    };
    // Clear mobile menu state when switching between mobile and desktop layouts.
    const breakpoint = window.matchMedia('(max-width: 1199px)');
    breakpoint.addEventListener('change', closeMenus);
    document.addEventListener('pointerdown', onOutsideClick);
    return () => {
      breakpoint.removeEventListener('change', closeMenus);
      document.removeEventListener('pointerdown', onOutsideClick);
    };
  }, []);

  // Existing sticky consumers need the total header height, including live actions.
  useEffect(() => {
    const root = document.documentElement;
    const previousHeight = root.style.getPropertyValue('--navbar-height');
    const updateHeight = () => root.style.setProperty('--navbar-height', `${Math.ceil(navbar.current.getBoundingClientRect().height)}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(navbar.current);
    return () => {
      observer.disconnect();
      if (previousHeight) root.style.setProperty('--navbar-height', previousHeight);
      else root.style.removeProperty('--navbar-height');
    };
  }, []);

  const navLink = (path, label, className = 'nv-link', accessibleLabel) => (
    <Link to={path} className={className} onClick={closeMenus}
      aria-label={accessibleLabel}
      aria-current={active(path) ? 'page' : undefined}>{label}</Link>
  );

  const guideLink = (path, shortLabel, fullLabel) => navLink(path, <>
    <span className="nv-guide-short">{shortLabel}</span>
    <span className="nv-guide-full">{fullLabel}</span>
  </>, 'nv-link', fullLabel);

  const clientActions = variant => (
    <div className={`nv-client-actions ${variant}`}>
      <div className="container nv-client-container">
        {navLink('/report-recovery', 'Παρακολούθηση αίτησης', 'nv-client-link')}
        <span className="nv-client-separator" aria-hidden="true">|</span>
        {navLink('/premium-upload', 'Αποστολή εγγράφων', 'nv-client-link')}
      </div>
    </div>
  );

  return (
    <nav ref={navbar} className={`navbar${isPaidServiceLive ? ' nv-paid-live' : ''}`} aria-label="Κύρια πλοήγηση"
      onKeyDown={event => {
        if (event.key !== 'Escape') return;
        if (toolsOpen) { setToolsOpen(false); toolsButton.current?.focus(); }
        else if (menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
      }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeMenus(); }}>
      {isPaidServiceLive && clientActions('nv-client-desktop')}
      <div className="container nv-container">
        <Link to="/" className="nv-logo" aria-label="Sintaximou — Αρχική" onClick={closeMenus}>
          <img src="/brand/sintaximou-logo-horizontal.svg" alt="Sintaximou" width="385" height="82" />
        </Link>

        <button ref={menuButton} type="button" className="nv-menu-toggle" aria-expanded={menuOpen}
          aria-controls="nv-navigation" onClick={() => setMenuOpen(value => !value)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d={menuOpen ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
          {menuOpen ? 'Κλείσιμο' : 'Μενού'}
        </button>

        <div className="nv-main-options">
        <div id="nv-navigation" className={`nv-navigation${menuOpen ? ' nv-open' : ''}`}>
          <ul className="nv-links">
            <li className="nv-guides">
              <span className="nv-guides-title">Οδηγοί</span>
              <div className="nv-guide-links">
                {guideLink('/free-guide', 'Δωρεάν εκτίμηση', 'Οδηγός δωρεάν εκτίμησης')}
                {guideLink('/report-guide', 'Αναλυτική έκθεση', 'Οδηγός αναλυτικής έκθεσης')}
              </div>
            </li>
            <li ref={toolsGroup} className="nv-tools" onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setToolsOpen(false);
            }}>
              <button ref={toolsButton} type="button" className="nv-tools-toggle"
                aria-expanded={toolsOpen} aria-controls="nv-tools-links"
                onClick={() => setToolsOpen(value => !value)}>
                Εργαλεία
                <svg className="nv-tools-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <span className="nv-mobile-label">Εργαλεία</span>
              <ul id="nv-tools-links" className={`nv-tools-links${toolsOpen ? ' nv-tools-open' : ''}`}>
                {supportingTools.map(tool => <li key={tool.id}>{navLink(tool.path, tool.label)}</li>)}
              </ul>
            </li>
            <li>{navLink('/enimerosi', 'Ενημέρωση')}</li>
            <li>{navLink('/contact', 'Επικοινωνία')}</li>
          </ul>
        </div>

        {active(toolPaths['free-estimation']) ? (
          <span className="nv-cta nv-cta-current" aria-current="page">Κάντε δωρεάν εκτίμηση</span>
        ) : navLink(toolPaths['free-estimation'], 'Κάντε δωρεάν εκτίμηση', 'nv-cta')}
        </div>
      </div>
      {isPaidServiceLive && clientActions('nv-client-mobile')}
    </nav>
  );
}
