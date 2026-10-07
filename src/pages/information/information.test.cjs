const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const fs = require('node:fs');
const os = require('node:os');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { StaticRouter } = require('react-router-dom');

const cache = new Map();
function load(entry, mode = 'prelaunch', overrides = {}) {
  const key = `${entry}:${mode}`;
  if (!cache.has(key)) cache.set(key, buildSync({
    entryPoints: [path.resolve(entry)], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
    loader: { '.css': 'empty' }, define: { 'import.meta.env': JSON.stringify({ VITE_PAID_SERVICE_MODE: mode }),
      'import.meta.glob': '__articleModules' },
  }).outputFiles[0].text);
  const context = { module: { exports: {} }, console, URL,
    // Component tests load the real data files. The separate Vite integration test
    // below verifies the actual import.meta.glob transform with an extra file.
    __articleModules: () => Object.fromEntries(fs.readdirSync('src/content/information/articles')
      .filter(file => file.endsWith('.js')).map(file => [`./articles/${file}`,
        load(`src/content/information/articles/${file}`).default])),
    ...overrides,
    require: overrides.require || require };
  vm.runInNewContext(cache.get(key), context);
  return context.module.exports;
}
const navigation = load('src/content/information/navigation.js');
const data = load('src/content/information/articles.js');
const page = 'src/pages/information/InformationPage.jsx';
const navbar = 'src/components/layout/Navbar.jsx';
const footer = 'src/components/layout/Footer.jsx';
function render(entry, location, mode = 'prelaunch') {
  return renderToStaticMarkup(React.createElement(StaticRouter, { location },
    React.createElement(load(entry, mode).default)));
}
const links = (html) => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1]);
const nav = (html, label) => html.match(new RegExp(`<nav[^>]*aria-label="${label}"[^>]*>([\\s\\S]*?)</nav>`))[1];
const current = (html) => [...html.matchAll(/<a\b(?=[^>]*aria-current="page")(?=[^>]*href="([^"]+)")[^>]*>/g)].map(match => match[1]);
const newsFixture = { id: 'test-news', slug: 'test-news', category: 'news', status: 'published', title: 'Test only',
  summary: 'Test fixture, never exported to the application.', body: [{ paragraphs: ['Test body.'] }],
  publishedAt: '2025-01-14', sources: [{ id: 'official-source', label: 'e-ΕΦΚΑ', url: 'https://www.e-efka.gov.gr/' }] };

test('public sections and article slugs are valid and unique; no duplicate routes', () => {
  assert.equal(navigation.informationSections.length, 4);
  assert.equal(new Set(navigation.informationSections.map(s => s.id)).size, 4);
  const paths = [...navigation.informationSections.map(s => s.path), ...data.articles.map(a => navigation.articlePath(a.slug))];
  assert.equal(new Set(paths).size, paths.length);
  assert.equal(new Set(data.articles.map(a => a.id)).size, data.articles.length);
  paths.forEach(p => assert.match(p, /^\/enimerosi(?:\/[a-z0-9-]+)*$/));
  data.articles.forEach(a => assert.equal(data.isPublishableArticle(a), a.status === 'published', a.slug));
});

test('sidebar and Footer link to the same four sections', () => {
  const html = render(page, '/enimerosi');
  const expected = Array.from(navigation.informationSections, s => s.path);
  assert.deepEqual(links(nav(html, 'Πλοήγηση ενημέρωσης')), expected);
  assert.deepEqual(links(nav(html, 'Πτυσσόμενη πλοήγηση ενημέρωσης')), expected);
  assert.deepEqual(links(nav(render(footer, '/enimerosi'), 'Ενημέρωση στο υποσέλιδο')), expected);
});

test('every section and article keeps the correct active category and exactly one H1', () => {
  const cases = [...navigation.informationSections.map(s => [s.path, s]),
    ...data.getPublishedArticles().map(a => [navigation.articlePath(a.slug), navigation.informationSections.find(s => s.id === data.categorySections[a.category])])];
  for (const [url, section] of cases) {
    assert.equal(data.resolveInformationPath(url).section.id, section.id);
    const html = render(page, url);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.deepEqual(current(nav(html, 'Πλοήγηση ενημέρωσης')), [section.path]);
    assert.deepEqual(current(nav(render(navbar, url), 'Κύρια πλοήγηση')), ['/enimerosi']);
  }
});

test('drafts and duplicate slugs are absent from lists and direct routes', () => {
  const draft = { ...newsFixture, status: 'draft' };
  assert.equal(data.getPublishedArticles([draft]).length, 0);
  assert.equal(data.resolveInformationPath(navigation.articlePath(draft.slug), [draft]).kind, 'not-found');
  assert.equal(data.getPublishedArticles([newsFixture, { ...newsFixture }]).length, 0);
  assert.equal(data.getPublishedArticles([newsFixture, { ...newsFixture, slug: 'different-slug' }]).length, 0);
  assert.equal(data.getPublishedArticles([newsFixture, { ...newsFixture, id: 'different-id' }]).length, 0);
});

test('news requires content, real dates and named HTTPS official sources before exposure', () => {
  assert.equal(data.isPublishableArticle(newsFixture), true);
  const invalid = [
    { publishedAt: undefined }, { publishedAt: '2025-02-30' }, { publishedAt: 'yesterday' },
    { updatedAt: '2025-01-13' }, { updatedAt: '2025-13-01' }, { sources: [] },
    { sources: [{ id: 'official-source', label: '', url: 'https://www.e-efka.gov.gr/' }] },
    { sources: [{ id: 'official-source', label: 'Unsafe', url: 'javascript:alert(1)' }] },
    { sources: [{ id: 'official-source', label: 'Unofficial', url: 'https://efka.gov.gr.example.com/' }] },
    { summary: '' }, { body: [] }, { body: [{ paragraphs: [''] }] }, { slug: '../test' },
  ];
  for (const change of invalid) {
    const article = { ...newsFixture, ...change };
    assert.equal(data.getPublishedArticles([article]).length, 0, JSON.stringify(change));
    assert.equal(data.resolveInformationPath(navigation.articlePath(article.slug), [article]).kind, 'not-found');
  }
  const valid = { ...newsFixture, updatedAt: '2025-02-01' };
  assert.equal(data.resolveInformationPath(navigation.articlePath(valid.slug), [valid]).section.id, 'news');
});

test('unknown articles and sections show the shared not-found view and return link', () => {
  for (const url of ['/enimerosi/arthra/missing', '/enimerosi/unknown', '/enimerosi/arthra/']) {
    const html = render(page, url);
    assert.match(html, /Η σελίδα δεν βρέθηκε/);
    assert.match(html, /Επιστροφή στους οδηγούς/);
    assert.equal(links(nav(html, 'Πλοήγηση ενημέρωσης')).length, 4);
    assert.equal(current(nav(html, 'Πλοήγηση ενημέρωσης')).length, 0);
  }
});

test('news remains empty and concepts do not invent publication dates', () => {
  assert.match(render(page, '/enimerosi/nea'), /Δεν έχουν δημοσιευθεί ακόμη ενημερώσεις σε αυτή την ενότητα\./);
  assert.equal(data.getPublishedArticles().filter(a => a.category === 'news').length, 0);
  data.articles.forEach(a => assert.doesNotMatch(render(page, navigation.articlePath(a.slug)), /<time\b/));
});

for (const mode of ['prelaunch', 'live']) test(`new copy and paid navigation respect ${mode}`, () => {
  for (const url of ['/enimerosi/sychnes-erotiseis']) {
    const html = render(page, url, mode);
    if (mode === 'prelaunch') assert.match(html, /δεν έχει ενεργοποιηθεί ακόμη/);
    else { assert.match(html, /είναι διαθέσιμη/); assert.doesNotMatch(html, /δεν έχει ενεργοποιηθεί ακόμη/); }
  }
  for (const entry of [navbar, footer]) {
    const hrefs = links(render(entry, '/enimerosi', mode));
    for (const url of ['/premium-upload', '/report-recovery']) assert.equal(hrefs.includes(url), mode === 'live');
  }
});

test('Navbar removes Home item, names logo and preserves nonclickable current CTA', () => {
  const html = render(navbar, '/free-estimation');
  assert.match(html, /aria-label="Sintaximou — Αρχική"/);
  assert.doesNotMatch(html, />Αρχική<\/a>/);
  assert.match(html, /<span class="nv-cta nv-cta-current" aria-current="page">Κάντε δωρεάν εκτίμηση<\/span>/);
  assert.equal(links(html).includes('/free-estimation'), false);
  assert.equal(links(render(navbar, '/enimerosi')).includes('/free-estimation'), true);
  assert.equal(links(render(navbar, '/calculator')).includes('/free-estimation'), true);
});

test('FAQ answers remain in accessible disclosures without rewriting their content', () => {
  const html = render(page, '/enimerosi/sychnes-erotiseis');
  assert.equal((html.match(/<details>/g) || []).length, 12);
  assert.match(html, /στον browser της συσκευής/);
  assert.match(html, /αποστέλλονται στην υπηρεσία υπολογισμού/);
});

test('collaboration is outside the information menu and links only to existing Contact', () => {
  const html = render('src/pages/CollaborationPage.jsx', '/synergasies');
  assert.deepEqual(links(html), ['/contact']);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /Μην συμπεριλάβετε στο μήνυμά σας προσωπικά στοιχεία ή έγγραφα πελατών ή άλλων τρίτων/);
  assert.match(html, /Ενδιαφέρεστε να συνεργαστείτε με τη Sintaximou/);
  assert.doesNotMatch(html, /δικηγόρ|εμπορική συνεργασία/);
  assert.equal(links(render(navbar, '/synergasies')).includes('/synergasies'), false);
  assert.equal(links(render(footer, '/synergasies')).includes('/synergasies'), true);
  assert.doesNotMatch(render(footer, '/enimerosi'), /ΛΟΓΟΤΥΠΟ|Επωνυμία Εταιρείας/);
});

test('local metadata hook restores old title and description, including missing meta tag', () => {
  for (const initiallyPresent of [true, false]) {
    const cleanups = [];
    let present = initiallyPresent;
    let content = 'Previous description';
    const meta = { getAttribute: () => content, setAttribute(name, value) { if (name === 'content') content = value; },
      remove() { present = false; }, removeAttribute() { content = null; } };
    const document = { title: 'Previous title', querySelector: () => present ? meta : null,
      createElement: () => meta, head: { appendChild() { present = true; } } };
    const hooks = { useRef: () => ({ current: null }), useEffect: fn => cleanups.push(fn()) };
    const hook = load('src/pages/information/usePublicPage.js', 'prelaunch', { document, window: { scrollTo() {} },
      require(name) { if (name === 'react') return hooks;
        if (name === 'react-router-dom') return { useLocation: () => ({ pathname: '/enimerosi' }) };
        return require(name); } });
    hook.usePublicPage('Οδηγοί', 'New description');
    assert.equal(document.title, 'Οδηγοί — Sintaximou');
    assert.equal(content, 'New description');
    cleanups.filter(Boolean).forEach(fn => fn());
    assert.equal(document.title, 'Previous title');
    assert.equal(present, initiallyPresent);
    if (initiallyPresent) assert.equal(content, 'Previous description');
  }
});

test('guides contain exactly the existing PDF reference and two usage articles', () => {
  const entries = load('src/content/information/guides.js').getGuides();
  assert.deepEqual(Array.from(entries, entry => entry.href), [
    '/pdf-guide', '/enimerosi/arthra/stoixeia-gia-ektimisi-syntaxis', '/enimerosi/arthra/pos-chrisimopoio-meso-syntaximo-mistho',
  ]);
  const html = render(page, '/enimerosi');
  for (const href of ['/free-guide', '/report-guide', '/average-salary']) assert.equal(links(html).includes(href), false);
  assert.doesNotMatch(html, /Οδηγός δωρεάν εκτίμησης|Οδηγός Αναλυτικού Report/);
  const salary = render(page, '/enimerosi/arthra/pos-chrisimopoio-meso-syntaximo-mistho');
  assert.match(salary, /Υπολογίστε τον μέσο συντάξιμο μισθό σας/);
  assert.equal(links(salary).includes('/average-salary'), true);
});

test('exactly eight concepts are published; retired local articles remain hidden drafts', () => {
  assert.equal(data.getArticleEntries('guide').length, 2);
  assert.equal(data.getArticleEntries('concept').length, 8);
  assert.equal(data.getArticleEntries('news').length, 0);
  for (const slug of ['ektimisi-kai-dikaioma', 'asfalistiki-periodos', 'proetoimasia-prin-aitisi-syntaxis']) {
    assert.equal(data.articles.find(a => a.slug === slug).status, 'draft');
    assert.equal(data.resolveInformationPath(navigation.articlePath(slug)).kind, 'not-found');
  }
  const salary = data.resolveInformationPath('/enimerosi/arthra/mesos-syntaximos-misthos');
  assert.equal(salary.section.path, '/enimerosi/me-apla-logia');
  assert.equal(data.resolveInformationPath('/enimerosi/methodologia').kind, 'not-found');
});

test('invalid IDs, categories, empty text and unsafe links fail closed in every location', () => {
  const base = { ...newsFixture, category: 'guide' };
  const invalid = [null, { ...base, id: '' }, { ...base, category: 'other' },
    { ...base, category: '__proto__' }, { ...base, title: ' ' }, { ...base, summary: '' },
    { ...base, body: [null] }, { ...base, body: [{ paragraphs: [] }] },
    { ...base, body: [{ items: [''] }] }, { ...base, body: [{ paragraphs: ['OK'], sourceIds: ['missing'] }] },
    { ...base, sourcesCheckedAt: '2025-02-30' }];
  for (const href of ['javascript:alert(1)', 'data:text/html,unsafe', '//example.com', '/\\example.com',
    'https://user:password@example.com', 'https://example.com/\nunsafe']) {
    invalid.push({ ...base, related: [{ label: 'Unsafe', href }] },
      { ...base, primaryLink: { label: 'Unsafe', href } },
      { ...base, body: [{ paragraphs: ['OK'], links: [{ label: 'Unsafe', href }] }] });
  }
  for (const article of invalid) {
    assert.equal(data.getPublishedArticles([article]).length, 0, JSON.stringify(article));
    assert.equal(data.getArticleEntries('guide', [article]).length, 0);
  }
});

test('draft and invalid targets are omitted from related links, including raw article URLs', () => {
  const published = { ...newsFixture, id: 'visible', slug: 'visible' };
  const draft = { ...newsFixture, id: 'draft', slug: 'draft', status: 'draft' };
  const invalid = { ...newsFixture, id: 'invalid', slug: 'invalid', sources: [] };
  const collection = [published, draft, invalid];
  const result = data.getVisibleLinks([
    { articleId: 'visible' }, { articleId: 'draft' }, { articleId: 'invalid' },
    { label: 'Draft', href: '/enimerosi/arthra/draft' },
    { label: 'Draft with fragment', href: '/enimerosi/arthra/draft?x=1#section' },
    { label: 'Invalid', href: '/enimerosi/arthra/invalid' },
  ], collection);
  assert.deepEqual(Array.from(result, link => link.href), ['/enimerosi/arthra/visible']);
  assert.equal(result[0].label, published.title);
});

test('common article renderer keeps sources internal, distinct dates and safe React text', () => {
  const fixture = { ...newsFixture, updatedAt: '2025-01-15', sourcesCheckedAt: '2025-01-13',
    body: [{ heading: 'A section', paragraphs: ['<script>alert(1)</script>'],
      items: ['First item', 'Second item'], sourceIds: ['official-source'] }] };
  const Component = load(page, 'prelaunch', { __articleModules: () => ({ './articles/test.js': fixture }) }).default;
  const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/enimerosi/arthra/test-news' }, React.createElement(Component)));
  assert.match(html, /<li>First item<\/li>/);
  assert.doesNotMatch(html, /Επίσημες πηγές για αυτή την ενότητα/);
  assert.equal(links(html).includes('https://www.e-efka.gov.gr/'), false);
  assert.match(html, /Δημοσίευση/); assert.match(html, /Ενημέρωση κειμένου/); assert.match(html, /Έλεγχος πηγών/);
  assert.equal((html.match(/<time /g) || []).length, 3);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('Vite discovers one extra article file without changing routes or a manual registry', async () => {
  const { createServer } = await import('vite');
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sintaximou-article-test-'));
  let server;
  try {
    const content = path.resolve('src/content/information');
    for (const file of ['articles.js', 'navigation.js']) fs.copyFileSync(path.join(content, file), path.join(temporaryRoot, file));
    fs.cpSync(path.join(content, 'articles'), path.join(temporaryRoot, 'articles'), { recursive: true });
    const fixture = { id: 'extra-file-fixture', slug: 'extra-file-fixture', title: 'Test fixture',
      summary: 'Only in the isolated test directory.', category: 'guide', status: 'published',
      body: [{ paragraphs: ['Not production content.'] }] };
    fs.writeFileSync(path.join(temporaryRoot, 'articles', 'extra-file.js'), `export default ${JSON.stringify(fixture)};`);
    server = await createServer({ root: temporaryRoot, configFile: false, appType: 'custom',
      cacheDir: path.join(temporaryRoot, '.vite'), server: { middlewareMode: true },
      optimizeDeps: { noDiscovery: true, include: [] }, logLevel: 'error' });
    const library = await server.ssrLoadModule('/articles.js');
    assert.equal(library.articles.length, data.articles.length + 1);
    assert.equal(library.getArticleEntries('guide').some(a => a.id === fixture.id), true);
    assert.equal(library.resolveInformationPath('/enimerosi/arthra/extra-file-fixture').section.id, 'guides');
    assert.equal(data.articles.some(a => a.id === fixture.id), false);
  } finally {
    await server?.close();
    // Delete only the exact temporary directory created by this test.
    assert.equal(path.dirname(path.resolve(temporaryRoot)), path.resolve(os.tmpdir()));
    assert.equal(path.basename(temporaryRoot).startsWith('sintaximou-article-test-'), true);
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test('guides and concepts share one plain-language note; every category keeps sources internal', () => {
  for (const category of ['guide', 'concept', 'news']) {
    const fixture = { ...newsFixture, category,
      sources: [...newsFixture.sources, { id: 'extra-source', label: 'Additional source', url: 'https://www.gov.gr/' }],
      body: [{ paragraphs: ['Body with an internal editorial reference.'], sourceIds: ['official-source'] }] };
    const Component = load(page, 'prelaunch', { __articleModules: () => ({ './articles/test.js': fixture }) }).default;
    const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/enimerosi/arthra/test-news' }, React.createElement(Component)));
    assert.equal((html.match(/<h2>Με απλά λόγια<\/h2>/g) || []).length, category === 'news' ? 0 : 1);
    for (const source of fixture.sources) assert.equal(links(html).includes(source.url), false);
    if (category !== 'news') assert.doesNotMatch(html, /info-section-sources|Επίσημες πηγές για αυτή την ενότητα/);
    assert.equal(data.isPublishableArticle(fixture), true);
  }
  for (const article of data.getPublishedArticles()) {
    const html = render(page, navigation.articlePath(article.slug));
    assert.equal(links(html).some(href => href.startsWith('https://')), false, article.slug);
    assert.doesNotMatch(html, /info-section-sources|Επίσημες πηγές που χρησιμοποιούμε/);
    assert.equal((html.match(/<h2>Με απλά λόγια<\/h2>/g) || []).length, 1);
  }
  for (const section of navigation.informationSections) assert.doesNotMatch(render(page, section.path), /info-plain-language/);
});

test('public navigation has only the four agreed sections and no methodology/source directory', () => {
  assert.deepEqual(Array.from(navigation.informationSections, s => s.label), ['Οδηγοί', 'Με απλά λόγια', 'Νέα & εξελίξεις', 'Συχνές Ερωτήσεις']);
  for (const section of navigation.informationSections) {
    const html = render(page, section.path);
    assert.doesNotMatch(html, /Μεθοδολογία|Βασικές έννοιες|Επίσημες πηγές/);
    assert.equal(links(html).some(href => href.startsWith('https://')), false);
  }
});

test('reusable content blocks render safely with table headings and statistic labels', () => {
  const blocks = [
    { type: 'keyPoint', text: '<script>unsafe</script>' },
    { type: 'simpleFormula', text: 'A + B' },
    { type: 'statGrid', caption: 'Amounts', stats: [{ label: '2025', value: '436,40 €' }, { label: '2026', value: '446,87 €' }] },
    { type: 'dataTable', caption: 'Rates', headers: ['Time', 'Rate'], rows: [['0–15', '0,77%']] },
  ];
  const fixture = { ...newsFixture, body: blocks };
  assert.equal(data.isPublishableArticle(fixture), true);
  const Component = load(page, 'prelaunch', { __articleModules: () => ({ test: fixture }) }).default;
  const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/enimerosi/arthra/test-news' }, React.createElement(Component)));
  assert.match(html, /Κρατήστε αυτό/); assert.match(html, /info-formula/);
  assert.match(html, /<dt>2026<\/dt><dd>446,87 €/); assert.match(html, /<caption>Rates<\/caption>/);
  assert.match(html, /scope="col"/); assert.match(html, /scope="row"/);
  assert.doesNotMatch(html, /<script>/); assert.match(html, /&lt;script&gt;/);
  for (const block of [{ type: 'html', html: '<img>' }, { type: 'keyPoint', text: '' },
    { type: 'keyPoint', text: 'Valid', paragraphs: [{}] },
    { type: 'simpleFormula', text: 'A + B', links: [{ label: 'Unsafe', href: 'javascript:alert(1)' }] },
    { type: 'statGrid', caption: 'Test', stats: [] }, { type: 'dataTable', caption: 'Test', headers: ['One'], rows: [['A','B']] }]) {
    assert.equal(data.isPublishableArticle({ ...fixture, body: [block] }), false);
  }
});
