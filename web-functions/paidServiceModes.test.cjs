const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');
const paidServiceConfig = require('./test-support/paidServiceConfig.cjs');
const root = path.resolve(__dirname, '..');
const routes = ['/', '/report-guide', '/premium-upload', '/report-recovery',
  '/terms', '/privacy', '/disclaimer', '/contact', '/pdf-guide', '/free-guide',
  '/average-salary', '/calculator'];
const price = /(?:^|[^\d.,])20\s*€/;
const text = html => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

function frontend(mode) {
  let stripeLoads = 0;
  const { outputFiles } = buildSync({
    entryPoints: [path.join(root, 'src/App.jsx')], bundle: true, write: false,
    format: 'cjs', platform: 'node', packages: 'external', logLevel: 'silent', jsx: 'automatic',
    loader: { '.css': 'empty', '.svg': 'dataurl', '.png': 'dataurl' },
    define: { 'import.meta.env': JSON.stringify({ VITE_PAID_SERVICE_MODE: mode,
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_fixture', VITE_CONTACT_URL: 'http://fixture/contact' }) },
  });
  const scope = { module: { exports: {} }, console, URL, setTimeout, clearTimeout,
    require(name) {
      // Render the actual routed pages without initializing external services.
      if (name.startsWith('firebase/')) return new Proxy({}, { get(_object, property) {
        if (property === '__esModule') return false;
        if (['initializeApp', 'getAuth', 'getDatabase', 'getStorage'].includes(property)) return () => ({});
        return () => { throw Error(`Unexpected Firebase action during render: ${String(property)}`); };
      } });
      if (name === '@stripe/stripe-js') return { loadStripe() { stripeLoads++; return Promise.resolve(null); } };
      return require(name);
    },
  };
  vm.runInNewContext(outputFiles[0].text, scope);
  return {
    get stripeLoads() { return stripeLoads; },
    render(route) {
      return renderToStaticMarkup(React.createElement(StaticRouter, { location: route },
        React.createElement(scope.module.exports.default)));
    },
  };
}

test('only the exact live value enables the centralized frontend config', () => {
  for (const mode of [undefined, null, '', 'prelaunch', 'unknown', 'LIVE', ' live ']) {
    const config = paidServiceConfig({ VITE_PAID_SERVICE_MODE: mode });
    assert.equal(config.paidServiceMode, 'prelaunch');
    assert.equal(config.isPaidServiceLive, false);
  }
  assert.equal(paidServiceConfig({ VITE_PAID_SERVICE_MODE: 'live' }).isPaidServiceLive, true);
});

for (const mode of [undefined, 'prelaunch', 'unknown', 'live']) {
  test(`rendered public routes respect mode ${String(mode)}`, () => {
    const app = frontend(mode);
    const live = mode === 'live';
    assert.equal(app.stripeLoads, live ? 1 : 0);
    const pages = Object.fromEntries(routes.map(route => [route, app.render(route)]));
    for (const [route, html] of Object.entries(pages)) {
      const navbar = html.match(/<nav class="navbar"[\s\S]*?<\/nav>/)[0];
      const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
      for (const navigation of [navbar, footer]) {
        assert.equal(navigation.includes('href="/premium-upload"'), live, `${route}: upload navigation`);
        assert.equal(navigation.includes('href="/report-recovery"'), live, `${route}: tracking navigation`);
        for (const href of ['/free-guide', '/report-guide', '/contact']) assert.ok(navigation.includes(`href="${href}"`));
      }
      if (!live) {
        assert.doesNotMatch(text(html), price, `${route}: no public service price`);
        assert.doesNotMatch(html, /href="\/(?:premium-upload|report-recovery)"/, `${route}: no inactive paid links`);
      }
    }
    if (live) {
      for (const route of ['/', '/report-guide', '/terms']) assert.match(text(pages[route]), price);
      assert.match(pages['/premium-upload'], /<form/);
      assert.match(pages['/premium-upload'], /type="file"/);
      assert.match(pages['/report-recovery'], /<form/);
      assert.match(pages['/report-recovery'], /id="pin"/);
      assert.match(pages['/terms'], /id="withdrawal-model"/);
      assert.doesNotMatch(pages['/report-guide'], /paid-service-notice/);
    } else {
      assert.match(text(pages['/']), /Σύντομα διαθέσιμο/);
      assert.match(text(pages['/']), /Ενδιαφέρεστε; Επικοινωνήστε μαζί μας/);
      assert.match(text(pages['/']), /Ξεκάθαρη εκτίμηση, με εφάπαξ χρέωση/);
      assert.match(pages['/report-guide'], /paid-service-notice/);
      assert.match(text(pages['/report-guide']), /δεν είναι ακόμη διαθέσιμο για online παραγγελία/);
      assert.match(text(pages['/report-guide']), /Ξεκινήστε με τη δωρεάν εκτίμηση/);
      assert.match(pages['/report-guide'], /href="\/contact"/);
      for (const route of ['/premium-upload', '/report-recovery']) {
        assert.doesNotMatch(pages[route], /<form|<input|PIN|payment|stripe/i);
        assert.match(pages[route], /href="\/contact"/);
        assert.match(text(pages[route]), /σύντομα διαθέσιμο/);
      }
      assert.match(text(pages['/report-recovery']), /Η online υπηρεσία Αναλυτικού Report δεν έχει ακόμη ξεκινήσει/);
      assert.match(pages['/report-recovery'], /href="\/report-guide"/);
      assert.match(text(pages['/terms']), /Η τελική τιμή και οι όροι πληρωμής θα εμφανίζονται με σαφήνεια/);
      assert.doesNotMatch(pages['/terms'], /id="withdrawal-model"/);
      assert.match(text(pages['/privacy']), /Η online υπηρεσία Αναλυτικού Report δεν έχει ακόμη ενεργοποιηθεί/);
    }
    assert.match(pages['/contact'], /<form/);
    assert.match(pages['/average-salary'], /<input/);
  });
}
