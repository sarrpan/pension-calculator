const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');

function load(entry, mode) {
  const source = buildSync({ entryPoints: [entry], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'empty' }, define: { 'import.meta.env': JSON.stringify({ VITE_PAID_SERVICE_MODE: mode }) },
  }).outputFiles[0].text;
  const context = { module: { exports: {} }, require, console };
  vm.runInNewContext(source, context);
  return context.module.exports;
}
function render(entry, mode, location = '/') {
  return renderToStaticMarkup(React.createElement(StaticRouter, { location },
    React.createElement(load(entry, mode).default)));
}
const home = 'src/pages/HomePage.jsx';
const navbar = 'src/components/layout/Navbar.jsx';
const links = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1]);

for (const mode of [undefined, 'prelaunch', 'LIVE', 'true', 'live']) {
  test(`home and menu expose paid actions only for exact live mode: ${mode}`, () => {
    const isLive = mode === 'live';
    const html = render(home, mode);
    const nav = render(navbar, mode);
    assert.equal(load('src/config/paidService.js', mode).isPaidServiceLive, isLive);
    assert.equal(links(html).includes('/premium-upload'), false);
    const report = render('src/components/home/Report/Report.jsx', mode);
    assert.deepEqual(links(report), []);
    assert.match(report, /Τι θα δείτε στην Αναλυτική Έκθεση/);
    const services = render('src/components/home/Hero/Hero.jsx', mode);
    assert.deepEqual(links(services), isLive ? ['/free-guide', '/report-guide'] : ['/free-guide', '/report-guide', '/contact']);
    assert.doesNotMatch(services, /Οδηγός αναλυτικής έκθεσης|Οδηγός δωρεάν εκτίμησης/);
    assert.equal(links(nav).includes('/premium-upload'), isLive);
    assert.equal(links(nav).includes('/report-recovery'), isLive);
    const clientRows = [...nav.matchAll(/<div class="nv-client-actions [^"]+"><div[^>]*>(.*?)<\/div><\/div>/g)];
    assert.equal(clientRows.length, isLive ? 2 : 0);
    clientRows.forEach(row => assert.deepEqual(links(row[1]), ['/report-recovery', '/premium-upload']));
    const primaryNav = nav.replace(/<div class="nv-client-actions [^"]+"><div[^>]*>.*?<\/div><\/div>/g, '');
    assert.equal(links(primaryNav).includes('/premium-upload'), false);
    assert.equal(links(primaryNav).includes('/report-recovery'), false);
    const footer = render('src/components/layout/Footer.jsx', mode);
    assert.equal(links(footer).includes('/premium-upload'), isLive);
    assert.equal(links(footer).includes('/report-recovery'), isLive);
    assert.equal(html.includes('Σύντομα διαθέσιμο'), !isLive);
    assert.ok(links(html).includes('/report-guide'));
    if (!isLive) {
      assert.ok(links(html).includes('/contact'));
      // Illustrative pension amounts in the original examples are not prices.
      assert.doesNotMatch(html, /price-paid|Ξεκάθαρη εκτίμηση, με 20 €|Αγορά|Πληρωμή/);
    }
    for (const markup of [nav]) {
      const starts = [...markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>\s*Κάντε δωρεάν εκτίμηση/g)];
      assert.ok(starts.length);
      starts.forEach(match => assert.equal(match[1], '/free-estimation'));
    }
  });
}

test('home has the agreed section order, one document and no obsolete analysis blocks', () => {
  const html = render(home, 'prelaunch');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const sections = ['id="home-title"', 'id="home-tools-title"', 'class="hero-section hero-services"',
    'class="hero-services-notice"', 'class="home-report-panel"', 'class="trust-section"'];
  for (let i = 1; i < sections.length; i++) assert.ok(html.indexOf(sections[i]) > html.indexOf(sections[i - 1]));
  assert.equal((html.match(/class="home-tool-card"/g) || []).length, 2);
  assert.match(html, /δεν αποτελεί επίσημη απόφαση του e-ΕΦΚΑ/);
  assert.equal(links(html).filter(href => href === '/free-guide').length, 2);
  assert.match(html, /class="option-card free"/);
  assert.match(html, /class="option-card premium"/);
  assert.ok(html.indexOf('class="option-card free"') < html.indexOf('class="option-card premium"'));
  assert.doesNotMatch(html, /cta-section|Επιλέξτε τη διαδρομή που σας ταιριάζει/);
  const intro = html.match(/<div class="home-intro-actions">(.*?)<p class="home-disclaimer"/)[1];
  assert.deepEqual(links(intro), ['/free-guide', '/report-guide']);
  assert.match(intro, /Γνωρίστε τη Δωρεάν Εκτίμηση/);
  assert.doesNotMatch(intro, /home-text-link|home-button-primary|free-estimation/);
  assert.match(html, /class="home-document"/);
  assert.match(html, /Η εικόνα σας,<br\/>με περισσότερη λεπτομέρεια/);
  assert.equal((html.match(/class="home-document"/g) || []).length, 1);
  assert.doesNotMatch(html, /home-analysis|Τι εξετάζουμε για τη δική σας περίπτωση/);
  assert.match(html, /home-handwritten/);
  assert.match(html, /1.203,20 €/);
  assert.match(html, /Ενδεικτικό παράδειγμα/);
  assert.match(html, /Δεν αποτελούν πραγματική εκτίμηση συγκεκριμένου προσώπου/);
  assert.doesNotMatch(html, /hero-salary-callout|report-sheets|home-help-grid|feature-row|ΤΙ ΧΡΕΙΑΖΟΜΑΣΤΕ ΑΠΟ ΕΣΑΣ|ΤΙ ΥΠΟΛΟΓΙΖΟΥΜΕ|ΤΙ ΣΕΝΑΡΙΑ ΕΞΕΤΑΖΟΥΜΕ|διαγράμματα|Αναλυτικό Report/);
});

test('guides share a directly visible group and tools retain their accessible disclosure', () => {
  const html = render(navbar, 'prelaunch');
  assert.match(html, /aria-expanded="false" aria-controls="nv-tools-links"/);
  assert.doesNotMatch(html, /⌄|>v<|nv-report-links/);
  assert.match(html, /class="nv-tools-chevron"[^>]*aria-hidden="true"/);
  assert.ok(links(html).includes('/free-guide'));
  assert.ok(links(html).includes('/report-guide'));
  assert.match(html, /<span class="nv-guides-title">Οδηγοί<\/span>/);
  assert.match(html, /aria-label="Οδηγός δωρεάν εκτίμησης"/);
  assert.match(html, /aria-label="Οδηγός αναλυτικής έκθεσης"/);
  const tools = html.match(/<ul id="nv-tools-links"[^>]*>(.*?)<\/ul>/)[1];
  assert.deepEqual(links(tools), ['/average-salary', '/replacement-rate', '/pdf-guide']);
  assert.match(tools, /class="nv-tools-helper"/);
  assert.ok(html.indexOf('href="/free-guide"') < html.indexOf('class="nv-tools"'));
});

test('navbar omits the start action entirely inside the free flow in both modes', () => {
  for (const mode of ['live', 'prelaunch']) {
    for (const route of ['/free-estimation', '/calculator']) {
      const html = render(navbar, mode, route);
      assert.doesNotMatch(html, /class="nv-cta|Κάντε δωρεάν εκτίμηση/);
      assert.match(html, /nv-in-free-flow/);
    }
    for (const route of ['/', '/free-guide', '/report-guide', '/pdf-guide']) {
      assert.match(render(navbar, mode, route), /class="nv-cta"/);
    }
  }
});

test('all home, header and footer links resolve to existing public routes', () => {
  const source = fs.readFileSync('src/App.jsx', 'utf8');
  const routes = [...source.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]);
  for (const mode of ['prelaunch', 'live']) {
    for (const entry of [home, navbar, 'src/components/layout/Footer.jsx']) {
      for (const href of links(render(entry, mode))) {
        assert.ok(routes.some(route => route.endsWith('/*')
          ? href === route.slice(0, -2) || href.startsWith(route.slice(0, -1)) : route === href), `${entry}: ${href}`);
      }
    }
  }
  assert.doesNotMatch(source, /<ToolsBar/);
});
