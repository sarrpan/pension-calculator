import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAdminPath, toolsNavigation } from '../../config/toolsNavigation';
import './ToolsBar.css';

export default function ToolsBar({ contextual = false, children }) {
  const { pathname, key } = useLocation();
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  useEffect(() => { setOpen(false); }, [pathname, key]);
  const visible = toolsNavigation.filter(tool => !contextual || tool.id !== 'free-estimation');
  if (isAdminPath(pathname) || (!contextual && pathname === '/calculator')) return null;
  return <nav className={`tools-bar${contextual ? ' tools-bar-contextual' : ''}`} aria-label="Εργαλεία"
    onKeyDown={event => {
      if (event.key === 'Escape' && open) { setOpen(false); trigger.current?.focus(); }
    }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className="container tools-inner">
      {contextual ? children : <span className="tools-label">ΕΡΓΑΛΕΙΑ</span>}
      <button ref={trigger} type="button" className="tools-toggle" aria-expanded={open}
        aria-controls="tools-links" onClick={() => setOpen(value => !value)}>Εργαλεία <span aria-hidden="true">▾</span></button>
      <ul id="tools-links" className={`tools-links${open ? ' tools-links-open' : ''}`}>
        {visible.map(tool => <li key={tool.id}><Link to={tool.path}
          aria-current={pathname === tool.path ? 'page' : undefined}
          onClick={() => setOpen(false)}>{tool.label}</Link></li>)}
      </ul>
    </div>
  </nav>;
}
