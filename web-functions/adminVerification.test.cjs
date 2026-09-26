const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

const adminCode = 'fixture-admin-code';
const action = { energeia: 'epivevaiosi_kodikou' };
const clone = value => JSON.parse(JSON.stringify(value));

function server(secret = adminCode) {
  const request = { status: 'documents_received', email: 'fixture@example.com' };
  const calls = { database: 0, reads: 0, writes: 0, email: 0 };
  const dependencies = {
    dotenv: { config() {} },
    'firebase-functions/v2/https': { onRequest: (_options, handler) => handler },
    cors: () => (_req, _res, next) => next(),
    'firebase-admin': {
      initializeApp() {},
      database() {
        calls.database++;
        return { ref: () => ({
          once: async () => { calls.reads++; return { exists: () => true, val: () => clone(request) }; },
          update: async patch => { calls.writes++; Object.assign(request, patch); },
          transaction: async callback => {
            const next = callback(clone(request));
            if (next !== undefined) { calls.writes++; Object.assign(request, next); }
            return { committed: next !== undefined, snapshot: { exists: () => true, val: () => clone(request) } };
          },
        }) };
      },
    },
    nodemailer: { createTransport() { calls.email++; throw Error('Unexpected email access'); } },
    stripe: class {},
  };
  const scope = {
    exports: {}, require: name => dependencies[name], URL,
    process: { env: { ADMIN_EMAIL_KODIKOS: secret } }, console: { error() {} },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8'), scope);
  return {
    calls, request,
    call(body = action, code = adminCode, method = 'POST') {
      return new Promise(resolve => {
        let status;
        scope.exports.allagiKatastasis({ method, body, headers: code == null ? {} : { 'x-admin-kodikos': code } }, {
          status(value) { status = value; return this; },
          json(value) { resolve({ status, ...clone(value) }); },
        });
      });
    },
  };
}

test('verification succeeds without a PIN, request access, changes or email', async () => {
  const app = server();
  const before = clone(app.request);
  for (const body of [action, { ...action, pin: 'PIN-123456', katastasi: 'delivered' }]) {
    assert.deepEqual(await app.call(body), { status: 200, success: true });
  }
  assert.deepEqual(app.calls, { database: 0, reads: 0, writes: 0, email: 0 });
  assert.deepEqual(app.request, before);
});

test('verification requires the correct header; wrong, absent and body-only codes return 403', async () => {
  for (const code of ['wrong-code', '', null]) {
    const app = server();
    const result = await app.call({ ...action, kodikos: adminCode, 'x-admin-kodikos': adminCode }, code);
    assert.equal(result.status, 403);
    assert.equal(result.success, false);
    assert.ok(!JSON.stringify(result).includes(adminCode));
    assert.deepEqual(app.calls, { database: 0, reads: 0, writes: 0, email: 0 });
  }
});

test('verification fails closed when unconfigured and still requires POST', async () => {
  const app = server(null);
  assert.equal((await app.call()).status, 500);
  assert.equal((await app.call(action, adminCode, 'GET')).status, 405);
  assert.deepEqual(app.calls, { database: 0, reads: 0, writes: 0, email: 0 });
});

test('regular status changes retain header authentication and their normal behavior', async () => {
  const app = server();
  const body = { pin: 'PIN-123456', katastasi: 'processing' };
  assert.equal((await app.call(body, 'wrong-code')).status, 403);
  assert.equal(app.calls.database, 0);
  assert.equal((await app.call({})).status, 400);
  const result = await app.call(body);
  assert.equal(result.success, true);
  assert.equal(result.katastasiAllaxe, true);
  assert.equal(result.emailStalthike, false);
  assert.equal(app.request.status, 'processing');
  assert.deepEqual(app.calls, { database: 1, reads: 1, writes: 1, email: 0 });
});

// Render the actual JSX and run its event handlers with mocked Firebase and hooks,
// using the same esbuild/VM approach as clientFlows.test.cjs.
function dashboard(fetchResponse, url = 'https://fixture.example/admin', requests = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src/pages/AdminDashboard.jsx'), 'utf8');
  const code = transformSync(source.replaceAll('import.meta.env', 'ENV'), { loader: 'jsx', format: 'cjs' }).code;
  const hooks = [], effects = [], calls = [], confirmations = [];
  let cursor = 0, tree, dirty;
  const React = {
    createElement: (type, props, ...children) => ({ type, props: { ...props,
      children: children.flat(Infinity).filter(value => value !== false && value != null) } }),
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = initial;
      return [hooks[index], value => {
        hooks[index] = typeof value === 'function' ? value(hooks[index]) : value;
        dirty = true;
      }];
    },
    useRef(initial) { const index = cursor++; return hooks[index] ||= { current: initial }; },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!hooks[index] || deps.some((value, i) => !Object.is(value, hooks[index][i]))) effects.push(callback);
      hooks[index] = deps;
    },
  };
  const unexpected = () => assert.fail('Verification must not mutate Firebase or upload files');
  const imports = {
    react: React, './AdminDashboard.css': {}, '../firebase': { auth: {}, db: {}, storage: {} },
    'firebase/auth': { onAuthStateChanged: (_auth, callback) => { callback({ uid: 'admin' }); return () => {}; } },
    'firebase/database': {
      ref: (_db, key) => key,
      onValue: (_ref, callback) => { callback({ val: () => requests }); return () => {}; },
      runTransaction: unexpected, remove: unexpected,
    },
    'firebase/storage': { ref: unexpected, uploadBytes: unexpected, getDownloadURL: unexpected },
  };
  const scope = {
    module: { exports: {} }, require: name => imports[name],
    ENV: { VITE_ALLAGI_KATASTASIS_URL: url },
    window: { confirm: message => { confirmations.push(message); return true; } },
    fetch: async (target, options) => { calls.push({ url: target, ...options }); return fetchResponse(); },
  };
  vm.runInNewContext(code, scope);
  const flatten = node => node && typeof node === 'object'
    ? [node, ...(node.props?.children || []).flatMap(flatten)] : [];
  const one = predicate => {
    const matches = flatten(tree).filter(predicate);
    assert.equal(matches.length, 1);
    return matches[0].props;
  };
  return {
    calls,
    confirmations,
    one,
    nodes: predicate => flatten(tree).filter(predicate),
    text: () => JSON.stringify(tree),
    render() {
      do {
        dirty = false; cursor = 0;
        tree = scope.module.exports.default();
        effects.splice(0).forEach(effect => effect());
      } while (dirty);
    },
    input: () => one(node => node.props.id === 'ad-kodikos'),
    button: () => one(node => node.props.className === 'save-btn ad-kodikos-epivevaiosi'),
    status: () => one(node => node.props.role === 'status'),
  };
}

const response = (status = 200, data = { success: true }) => ({
  ok: status >= 200 && status < 300, status, json: async () => data,
});
const typeCode = (app, value = adminCode) => {
  app.input().onChange({ target: { value } });
  app.render();
};

test('admin withdrawal view shows full refund pending, blocks processing/delivery and manually records completion',async()=>{
  const request={status:'withdrawn',email:'fixture@example.com',withdrawalStatus:'requested',withdrawalRequestedAt:123456,
    withdrawalPaymentIntentId:'pi_paid',refundStatus:'pending',refundAmount:2500,refundCurrency:'eur',
    withdrawalDeclaration:{fullName:'Μαρία Παπαδοπούλου'},withdrawalEmail:{status:'sent'}};
  const app=dashboard(()=>response(),'https://fixture.example/admin',{'PIN-123456':request});
  app.render();typeCode(app);
  assert.match(app.text(),/Υπαναχώρηση υποβλήθηκε/);assert.match(app.text(),/25,00\s*€/);assert.match(app.text(),/εκκρεμεί/);
  assert.match(app.text(),/Μαρία Παπαδοπούλου/);assert.doesNotMatch(app.text(),/20\s*€/);
  assert.match(app.text(),/pi_paid/);assert.match(app.text(),/χωρίς αφαίρεση προμηθειών/);
  assert.equal(app.nodes(n=>n.type==='select'||n.props.type==='file').length,0);
  const button=n=>n.type==='button'&&n.props.children.includes('Σήμανση επιστροφής ως ολοκληρωμένης');
  await app.one(button).onClick();app.render();
  assert.match(app.confirmations[0],/25,00\s*€/);assert.doesNotMatch(app.confirmations[0],/20\s*€/);
  assert.deepEqual(JSON.parse(app.calls[0].body),{pin:'PIN-123456',energeia:'refund_completed',confirmed:true});
  assert.equal(app.calls[0].headers['x-admin-kodikos'],adminCode);
  assert.match(app.text(),/Καταγράφηκε η ολοκλήρωση της επιστροφής/);
  const completed=dashboard(()=>assert.fail('Unexpected fetch'),'https://fixture.example/admin',{
    'PIN-123456':{...request,refundStatus:'completed',refundedAt:223456},
  });completed.render();assert.match(completed.text(),/ολοκληρώθηκε/);assert.equal(completed.nodes(button).length,0);
});

test('admin formats the recorded refund amount/currency at current and future prices',()=>{
  for(const [refundAmount,refundCurrency,expected] of [[2000,'eur',/20,00\s*€/],
    [2500,'eur',/25,00\s*€/],[3599,'usd',/35,99/],[500,'jpy',/500/]]){
    const app=dashboard(()=>response(),'https://fixture.example/admin',{
      'PIN-123456':{status:'withdrawn',withdrawalStatus:'requested',refundStatus:'pending',refundAmount,refundCurrency},
    });app.render();
    const row=app.one(n=>n.type==='p'&&n.props.children.includes('Refund: '));
    assert.match(row.children.join(''),expected);
  }
});

test('button verifies only on server success; editing afterwards resets the existing status', async () => {
  let finish;
  const app = dashboard(() => new Promise(resolve => { finish = resolve; }));
  app.render();
  assert.equal(app.input().type, 'password');
  assert.equal(app.button().disabled, true);
  typeCode(app);
  assert.equal(app.calls.length, 0);
  const pending = app.button().onClick();
  app.render();
  assert.deepEqual(clone(app.button().children), ['Έλεγχος…']);
  assert.equal(app.button().disabled, true);
  assert.equal(app.status().className, 'ad-kodikos-akyros');
  assert.equal(app.calls[0].url, 'https://fixture.example/admin');
  assert.equal(app.calls[0].method, 'POST');
  assert.equal(app.calls[0].headers['x-admin-kodikos'], adminCode);
  assert.deepEqual(JSON.parse(app.calls[0].body), action);
  finish(response());
  await pending;
  app.render();
  assert.equal(app.status().className, 'ad-kodikos-ok');
  assert.ok(app.status().children.join('').includes('Ο κωδικός επιβεβαιώθηκε'));
  assert.deepEqual(clone(app.button().children), ['Επιβεβαίωση']);
  typeCode(app, 'edited-code');
  assert.equal(app.status().className, 'ad-kodikos-akyros');
  assert.deepEqual(clone(app.status().children), ['Δεν έχει επιβεβαιωθεί ακόμα']);
  assert.equal(app.calls.length, 1);
});

test('wrong codes, HTTP failures, malformed replies and connection failures never verify the code', async () => {
  for (const [reply, message] of [
    [() => response(403), 'Λάθος κωδικός'],
    [() => response(500), 'Η επιβεβαίωση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'],
    [() => response(200, { success: false }), 'Η επιβεβαίωση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'],
    [() => response(200, {}), 'Η επιβεβαίωση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'],
    [() => response(200, null), 'Η επιβεβαίωση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'],
    [() => ({ ...response(), json: async () => { throw Error('Invalid JSON'); } }), 'Η επιβεβαίωση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'],
    [() => { throw new TypeError('Network failure'); }, 'Η επιβεβαίωση δεν ολοκληρώθηκε. Δοκιμάστε ξανά.'],
  ]) {
    let first = true;
    const app = dashboard(() => {
      if (first) { first = false; return response(); }
      return reply();
    });
    app.render(); typeCode(app);
    await app.button().onClick(); app.render();
    assert.equal(app.status().className, 'ad-kodikos-ok');
    await app.button().onClick(); app.render();
    assert.equal(app.status().className, 'ad-kodikos-akyros');
    assert.deepEqual(clone(app.status().children), [message]);
    assert.equal(app.button().disabled, false);
  }
});

test('an unconfigured endpoint reports an incomplete verification without fetching', async () => {
  const app = dashboard(() => assert.fail('Unexpected fetch'), '');
  app.render(); typeCode(app);
  await app.button().onClick(); app.render();
  assert.equal(app.status().className, 'ad-kodikos-akyros');
  assert.match(app.status().children.join(''), /Η επιβεβαίωση δεν ολοκληρώθηκε/);
  assert.equal(app.calls.length, 0);
});

test('a late successful reply cannot verify an input that was edited during the check', async () => {
  let finish;
  const app = dashboard(() => new Promise(resolve => { finish = resolve; }));
  app.render(); typeCode(app);
  const pending = app.button().onClick();
  app.render(); typeCode(app, 'another-code'); typeCode(app, adminCode);
  finish(response()); await pending; app.render();
  assert.equal(app.status().className, 'ad-kodikos-akyros');
  assert.deepEqual(clone(app.status().children), ['Δεν έχει επιβεβαιωθεί ακόμα']);
  assert.equal(app.button().disabled, false);
});
