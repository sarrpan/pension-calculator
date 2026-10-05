const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const React = require('react');

// Exercise the actual components and their effects without external services.
function harness(entry, initialLocation, draft = {}, edition = 'free') {
  const slots = []; let cursor = 0; let effects = []; let tree;
  let location = { pathname: '/calculator', search: '', hash: '', key: 'entry', ...initialLocation };
  const navigations = [];
  const hooks = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useMemo(fn) { cursor++; return fn(); },
    useEffect(fn, deps) {
      const index = cursor++; const previous = slots[index];
      if (!previous || deps.some((value, i) => value !== previous[i])) effects.push(fn);
      slots[index] = deps;
    },
  };
  const output = buildSync({ entryPoints: [path.resolve(entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'empty' }, define: { 'import.meta.env': '{}' } }).outputFiles[0].text;
  const context = { module: { exports: {} }, console, URLSearchParams, document: { title: '' },
    window: { localStorage: { getItem: () => JSON.stringify(draft), setItem() {} } },
    require(name) {
      if (name === 'react') return hooks;
      if (name === 'react-router-dom') return { Link: 'router-link', useLocation: () => location,
        useNavigate: () => (target, options) => {
          navigations.push({ target, options });
          location = { ...location, ...target, state: options.state, key: 'consumed' };
        } };
      return require(name);
    },
  };
  vm.runInNewContext(output, context);
  function render() { cursor = 0; effects = []; tree = context.module.exports.default({ calculatorEdition: edition }); return tree; }
  function find(name, node = tree) {
    if (!node || typeof node !== 'object') return null;
    if (node.type?.name === name || node.type === name) return node;
    const children = [node.props?.children].flat(Infinity);
    for (const child of children) { if (!child) continue; const result = find(name, child); if (result) return result; }
    return null;
  }
  render();
  return { render, find, navigations, get location() { return location; },
    consume() { const pending = [...effects]; pending.forEach(fn => fn()); pending.forEach(fn => fn()); render(); },
  };
}
const form = 'src/pages/pension-form/PensionFormPage.jsx';
const draft = { firstInsuranceYearInput: '1990', insurancePeriodGroups: [
  { id: 'first', fund: 'ika', employmentCategory: 'vae', fromDate: '2000-01-01' },
  { id: 'second', fund: 'ika', insuredType: 'old', employmentCategory: 'common', fromDate: '2020-01-01' },
] };

for (const fund of ['ika', 'tap_dei', 'tsmede']) test(`combined handoff ${fund} preserves second period and consumes state once`, () => {
  const app = harness(form, { search: '?start=main&keep=yes', hash: '#test',
    state: { primaryFund: fund, averageMonthlyPensionableEarnings: 1234.56, unrelated: 'keep' } }, draft);
  const before = app.find('InsurancePeriodsInputSection').props.insurancePeriodGroups;
  assert.equal(before[0].fund, fund);
  assert.equal(before[0].employmentCategory, '');
  app.consume();
  const after = app.find('InsurancePeriodsInputSection').props.insurancePeriodGroups;
  assert.equal(JSON.stringify(after[1]), JSON.stringify(before[1]));
  assert.equal(app.find('ContributoryPensionInputSection').props.averageMonthlyPensionableEarningsInput, '1234,56');
  assert.equal(JSON.stringify(app.location.state), JSON.stringify({ unrelated: 'keep' }));
  assert.equal(app.location.search, '?keep=yes'); assert.equal(app.location.hash, '#test');
  assert.equal(app.navigations.length, 1);
  app.find('InsurancePeriodsInputSection').props.onInsurancePeriodGroupChange('first', 'fund', 'oaee');
  app.render(); app.consume();
  assert.equal(app.find('InsurancePeriodsInputSection').props.insurancePeriodGroups[0].fund, 'oaee');
  assert.equal(app.navigations.length, 1);
});
test('selector forwards the salary and unrelated state with the chosen fund', () => {
  const app = harness('src/pages/FreeEstimationPage.jsx', { state: { averageMonthlyPensionableEarnings: 1234.56, unrelated: 'keep' } });
  const link = app.find('router-link');
  assert.equal(link.props.to, '/calculator?start=main');
  assert.equal(link.props.state.averageMonthlyPensionableEarnings, 1234.56);
  assert.equal(link.props.state.primaryFund, 'ika'); assert.equal(link.props.state.unrelated, 'keep');
});
test('direct calculator navigation keeps its draft and does not replace history', () => {
  const app = harness(form, {}, draft); app.consume();
  assert.equal(app.find('InsurancePeriodsInputSection').props.insurancePeriodGroups[0].employmentCategory, 'vae');
  assert.equal(app.navigations.length, 0);
});
test('professional edition does not consume the free handoff', () => {
  const app = harness(form, { state: { primaryFund: 'tap_dei', averageMonthlyPensionableEarnings: 1234.56 } }, draft, 'professional');
  app.consume(); assert.equal(app.find('InsurancePeriodsInputSection').props.insurancePeriodGroups[0].fund, 'ika');
  assert.equal(app.navigations.length, 0);
  assert.equal(app.find('router-link'), null);
});

test('return to categories forwards the edited salary after consumption', () => {
  const app = harness(form, { state: { primaryFund: 'tap_dei', averageMonthlyPensionableEarnings: 1234.56, unrelated: 'keep' } }, draft);
  app.consume();
  app.find('ContributoryPensionInputSection').props.onAverageMonthlyPensionableEarningsChange('1567,89');
  app.render();
  const link = app.find('router-link');
  assert.equal(link.props.to, '/free-estimation');
  assert.equal(link.props.state.averageMonthlyPensionableEarnings, 1567.89);
  assert.equal(link.props.state.unrelated, 'keep');
  assert.equal(link.props.state.primaryFund, undefined);
});

test('direct calculator return link retains the salary from the saved draft', () => {
  const app = harness(form, {}, { ...draft, averageMonthlyPensionableEarningsInput: '987,65' });
  app.consume();
  assert.equal(app.find('router-link').props.state.averageMonthlyPensionableEarnings, 987.65);
  assert.equal(app.navigations.length, 0);
});


