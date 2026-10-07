const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');
const codeCache = new Map();
function load(entry, requireOverride = require) {
  if (!codeCache.has(entry)) codeCache.set(entry, buildSync({ entryPoints: [entry], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' },
    define: { 'import.meta.env': '{}' } }).outputFiles[0].text);
  const context = { module: { exports: {} }, require: requireOverride, console };
  vm.runInNewContext(codeCache.get(entry), context);
  return context.module.exports;
}
const toolsEntry = 'src/components/layout/ToolsBar.jsx';
const rateEntry = 'src/pages/ReplacementRatePage.jsx';
function harness(entry, pathname = '/') {
  const slots = []; let cursor = 0; let effects = []; let location = { pathname, key: 'initial' }; let tree;
  const hooks = { ...React,
    useState(initial) { const index = cursor++; if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }]; },
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useEffect(fn, deps) { const index = cursor++; if (!slots[index] || deps.some((value, i) => value !== slots[index][i])) effects.push(fn); slots[index] = deps; },
  };
  const Component = load(entry, name => name === 'react' ? hooks : name === 'react-router-dom'
    ? { Link: 'router-link', useLocation: () => location } : require(name)).default;
  function render(props = {}) { cursor = 0; effects = []; tree = Component(props); return tree; }
  function nodes(node = tree) { return !node || typeof node !== 'object' ? [] : [node, ...[node.props?.children].flat(Infinity).filter(child => child != null).flatMap(child => nodes(child))]; }
  return { render, nodes, find: predicate => nodes().find(predicate),
    effect() { effects.forEach(fn => fn()); }, setLocation(pathname) { location = { pathname, key: 'changed' }; } };
}

test('central configuration contains exactly three tools and shared destinations', () => {
  const { toolsNavigation } = load('src/config/toolsNavigation.js');
  assert.deepEqual(Array.from(toolsNavigation, tool => tool.path), ['/average-salary','/replacement-rate','/free-estimation']);
  assert.equal(new Set(toolsNavigation.map(tool => tool.id)).size, 3);
});

test('ToolsBar active state, contextual tools, admin exclusion and single calculator row', () => {
  const Component = load(toolsEntry).default;
  const render = (location, props = {}) => renderToStaticMarkup(React.createElement(StaticRouter, { location }, React.createElement(Component, props)));
  for (const route of ['/average-salary','/replacement-rate','/free-estimation']) {
    const html = render(route);
    assert.equal((html.match(/aria-current="page"/g)||[]).length, 1);
    assert.ok(html.includes(`aria-current="page" href="${route}"`) || html.includes(`href="${route}" aria-current="page"`));
  }
  assert.equal(render('/$Sp83199'), '');
  assert.equal(render('/calculator'), '');
  const contextual = render('/calculator', { contextual: true, children: React.createElement('a', { href: '/free-estimation' }, 'Back') });
  assert.equal((contextual.match(/<nav /g)||[]).length, 1);
  assert.equal((contextual.match(/<li>/g)||[]).length, 2);
  assert.doesNotMatch(contextual, /Δωρεάν εκτίμηση/);
  const source = fs.readFileSync('src/pages/pension-form/PensionFormPage.jsx','utf8');
  assert.match(source, /isFreeAppearance && <ToolsBar contextual>/);
  assert.doesNotMatch(source, /pf-category-nav/);
});

test('mobile control toggles, closes on Escape with focus return and closes on route change', () => {
  const app = harness(toolsEntry); app.render(); app.effect(); app.render();
  const button = () => app.find(node => node.type === 'button');
  assert.equal(button().props['aria-expanded'], false);
  button().props.onClick(); app.render(); assert.equal(button().props['aria-expanded'], true);
  let focused = false; button().ref.current = { focus() { focused = true; } };
  app.find(node => node.type === 'nav').props.onKeyDown({ key: 'Escape' }); app.render();
  assert.equal(button().props['aria-expanded'], false); assert.equal(focused, true);
  button().props.onClick(); app.render(); app.setLocation('/average-salary'); app.render(); app.effect(); app.render();
  assert.equal(button().props['aria-expanded'], false);
  button().props.onClick(); app.render(); app.find(node => node.type === 'router-link').props.onClick(); app.render();
  assert.equal(button().props['aria-expanded'], false);
});

test('replacement form shows one input mode, accepts integer text and preserves independent fields', () => {
  const app = harness(rateEntry, '/replacement-rate'); app.render();
  const numeric = () => app.nodes().filter(node => node.type === 'input' && node.props.type === 'number');
  assert.equal(numeric().length, 1); assert.equal(numeric()[0].props.id, 'rr-totalDays');
  numeric()[0].props.onChange({ target: { value: '9000' } }); app.render();
  assert.equal(numeric()[0].props.value, '9000');
  numeric()[0].props.onChange({ target: { value: '1.5' } }); app.render(); assert.equal(numeric()[0].props.value, '1.5');
  numeric()[0].props.onChange({ target: { value: '9000' } }); app.render();
  app.find(node => node.type === 'input' && node.props.value === 'duration').props.onChange(); app.render();
  assert.deepEqual(numeric().map(node => node.props.id), ['rr-years','rr-months','rr-days']);
  for (const input of numeric()) { assert.equal(input.props.step, '1'); assert.equal(input.props.inputMode, 'numeric'); assert.equal(input.props.min, '0'); }
  assert.ok(app.find(node => node.props?.className === 'rr-duration'));
  app.find(node => node.type === 'input' && node.props.value === 'days').props.onChange(); app.render();
  assert.equal(numeric()[0].props.value, '9000');
});

test('replacement calculation is active, validates input and starts with no fabricated result', () => {
  const app = harness(rateEntry, '/replacement-rate'); app.render();
  assert.equal(app.find(node => node.type === 'button').props.disabled, false);
  let prevented = false;
  app.find(node => node.type === 'form').props.onSubmit({ preventDefault() { prevented = true; }, currentTarget: { querySelector() {} } });
  assert.equal(prevented, true); app.render();
  assert.equal(app.find(node => node.props?.id === 'rr-totalDays').props['aria-invalid'], true);
  const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/replacement-rate' }, React.createElement(load(rateEntry).default)));
  assert.doesNotMatch(html, /Ο υπολογισμός θα ενεργοποιηθεί|50,01|Πώς προέκυψε|as-result|<output|%/);
  const source = fs.readFileSync(rateEntry,'utf8');
  assert.match(source, /services\/replacementRate/);
  assert.doesNotMatch(source, /REPLACEMENT_RATE_BRACKETS|annualRate|0[.,]77|2[.,]55/);
});
