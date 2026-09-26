const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('./index.js'), 'utf8');
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const pin = 'PIN-123456';
const email = 'visitor@example.com';
const fullName = 'Μαρία Παπαδοπούλου';
const paidAmount = 2500;
const paymentFixture = (extra = {}) => ({id:'pi_paid',status:'succeeded',amount:paidAmount,
  amount_received:paidAmount,currency:'eur',metadata:{pin,email},...extra});
const mb = 1024 * 1024;
const file = (index, size = 1 * mb) => ({path:`premium_uploads/${pin}/${index}.pdf`, name:`${index}.pdf`, size, type:'application/pdf'});
const base = (extra = {}) => ({pin, email, status:'documents_received', createdAt:1234, paymentStatus:'not_requested', files:[], uploadLimitsVersion:1, ...extra});
const paidRequest = (extra = {}) => base({status:'processing',paymentStatus:'paid',paymentIntentId:'pi_paid',
  paidAt:1234,withdrawalConsentAt:1234,...extra});
const withdraw = app => app.call('requestWithdrawal',{pin,email,confirmed:true,fullName});
const adminAction = (app,body,code='admin') => app.call('allagiKatastasis',{pin,...body},'POST',null,{'x-admin-kodikos':code});

test('withdrawal uses actual captured amount and ignores browser amounts, currency and payment ID',async()=>{
  const app=setup(paidRequest(),{now:2000000});
  const result=await app.call('requestWithdrawal',{pin,email,confirmed:true,fullName,
    refundAmount:1900,refundCurrency:'usd',paymentAmount:9999,refundStatus:'completed',paymentIntentId:'pi_forged'});
  assert.equal(result.success,true); assert.equal(app.request.status,'withdrawn');
  assert.equal(app.request.withdrawalStatus,'requested'); assert.equal(app.request.withdrawalRequestedAt,2000000);
  assert.equal(app.request.withdrawalPreviousStatus,'processing'); assert.equal(app.request.paymentStatus,'paid');
  assert.equal(app.request.paymentIntentId,'pi_paid'); assert.equal(app.request.withdrawalPaymentIntentId,'pi_paid');
  assert.equal(app.request.refundStatus,'pending'); assert.equal(app.request.refundAmount,paidAmount);
  assert.equal(app.request.refundCurrency,'eur'); assert.equal(app.request.refundedAt,undefined);
  assert.equal(app.requestsAtSend[0].status,'withdrawn'); assert.equal(app.request.withdrawalEmail.status,'sent');
  assert.deepEqual(app.request.withdrawalDeclaration,{fullName,pin,email,service:'Αναλυτικό Report',contractedAt:1234});
  assert.deepEqual(app.retrievedIntents,['pi_paid']);
});

test('withdrawal and manual completion work at different prices/currencies without changing catalogue or withdrawal code',async()=>{
  for(const [amount,currency] of [[2000,'eur'],[2500,'eur'],[3599,'usd'],[500,'jpy']]){
    const app=setup(paidRequest({paymentAmount:9999,paymentCurrency:'gbp'}),{
      payment:{amount:amount+1000,amount_received:amount,currency},
    });
    assert.equal((await withdraw(app)).success,true);
    assert.equal(app.request.refundAmount,amount);assert.equal(app.request.refundCurrency,currency);
    assert.equal((await adminAction(app,{energeia:'refund_completed',confirmed:true})).success,true);
    assert.equal(app.request.refundStatus,'completed');
    const reads=app.retrievedIntents.length;await withdraw(app);
    assert.equal(app.retrievedIntents.length,reads);assert.equal(app.mailCount,1);
  }
});

test('withdrawal requires a bounded full name only after matching PIN/email and preserves it on retry',async()=>{
  for(const name of [undefined,null,'','   ','A','A'.repeat(201),{name:fullName}]){
    const app=setup(paidRequest());
    const result=await app.call('requestWithdrawal',{pin,email,confirmed:true,fullName:name});
    assert.equal(result.code,'invalid_withdrawal_name');assert.equal(app.request.withdrawalDeclaration,undefined);
    assert.equal(app.retrievedIntents.length,0);assert.equal(app.mailCount,0);
  }
  const app=setup(paidRequest());
  assert.equal((await app.call('requestWithdrawal',{pin,email,confirmed:true,fullName:'  Μαρία   Παπαδοπούλου  '})).success,true);
  const saved=clone(app.request.withdrawalDeclaration);
  await app.call('requestWithdrawal',{pin,email,confirmed:true,fullName:'Άλλο Όνομα'});
  assert.deepEqual(app.request.withdrawalDeclaration,saved);
  assert.equal(app.request.fullName,undefined); // The name belongs only to the withdrawal declaration.
});

test('unverified or unavailable original payments cannot create a refund or send acknowledgement',async()=>{
  for(const payment of [{status:'processing'},{id:'pi_other'},{amount_received:0},{amount_received:1.5},
    {currency:null},{currency:'invalid'},{metadata:{pin:'PIN-999999',email}},{metadata:{pin,email:'other@example.com'}}]){
    const app=setup(paidRequest(),{payment});assert.equal((await withdraw(app)).success,false);
    assert.equal(app.request.refundAmount,undefined);assert.equal(app.mailCount,0);
  }
  const app=setup(paidRequest(),{retrieveFail:true});assert.equal((await withdraw(app)).status,500);
  assert.equal(app.request.status,'processing');assert.equal(app.mailCount,0);
});

test('changing the stored PaymentIntent during withdrawal aborts instead of refunding an unrelated transaction',async()=>{
  const app=setup(paidRequest());app.race(()=>{app.request={...app.request,paymentIntentId:'pi_other'};});
  assert.equal((await withdraw(app)).code,'withdrawal_unavailable');assert.equal(app.request.refundAmount,undefined);
});

test('withdrawal retries and concurrent requests preserve one submission and one email',async()=>{
  const app=setup(paidRequest(),{retryTransaction:true});
  const results=await Promise.all([withdraw(app),withdraw(app),withdraw(app)]);
  assert.ok(results.every(r=>r.success)); assert.equal(results.filter(r=>!r.alreadyRequested).length,1);
  assert.equal(app.mailCount,1); const saved=clone(app.request);
  assert.equal((await withdraw(app)).alreadyRequested,true);
  assert.deepEqual(app.request,saved); assert.equal(app.mailCount,1);
});

test('retrying an already recorded legacy withdrawal needs no new declaration or Stripe lookup',async()=>{
  const initial=paidRequest({status:'withdrawn',withdrawalStatus:'requested',withdrawalRequestedAt:2000,
    withdrawalPaymentIntentId:'pi_paid',refundAmount:paidAmount,refundCurrency:'eur',refundStatus:'pending'});
  const app=setup(initial,{retrieveFail:true});
  const result=await app.call('requestWithdrawal',{pin,email,confirmed:true});
  assert.equal(result.success,true);assert.equal(result.alreadyRequested,true);
  assert.deepEqual(app.request,initial);assert.equal(app.mailCount,0);assert.equal(app.retrievedIntents.length,0);
});

test('wrong or malformed PIN/email and nonexistent requests produce identical generic responses',async()=>{
  const app=setup(paidRequest()); const missing=await setup(null).call('requestWithdrawal',{pin,email,confirmed:true,fullName});
  for(const body of [{pin:'PIN-999999',email},{pin,email:'wrong@example.com'},{pin:'invalid',email},{pin,email:'invalid'}]){
    assert.deepEqual(await app.call('requestWithdrawal',{...body,confirmed:true,fullName}),missing);
  }
  assert.equal(missing.status,404); assert.equal(app.mailCount,0); assert.equal(app.request.status,'processing');
});

test('withdrawal rejects GET, missing confirmation, unpaid and delivered requests including historical delivery',async()=>{
  assert.equal((await setup().call('requestWithdrawal',{},'GET')).status,405);
  assert.equal((await setup(paidRequest()).call('requestWithdrawal',{pin,email})).code,'confirmation_required');
  for(const initial of [base(),base({status:'awaiting_payment'}),paidRequest({status:'delivered'}),
    paidRequest({deliveredAt:12345}),paidRequest({emailIstoriko:{delivered:12345}}),
    paidRequest({status:'delivered',withdrawalConsentAt:null})]){
    const app=setup(initial); const result=await withdraw(app);
    assert.equal(result.status,409); assert.equal(result.success,false); assert.equal(app.mailCount,0);
    assert.deepEqual(app.request,initial);
  }
});

test('delivery committed before withdrawal wins the transaction race',async()=>{
  const app=setup(paidRequest());
  app.race(()=>{app.request={...app.request,status:'delivered',deliveredAt:2000};});
  assert.equal((await withdraw(app)).code,'report_delivered');
  assert.equal(app.request.refundStatus,undefined); assert.equal(app.mailCount,0);
});

test('withdrawal blocks processing, delivery, new payments and supplementary uploads, including stale admin reads',async()=>{
  const app=setup(paidRequest()); await withdraw(app); const saved=clone(app.request);
  for(const katastasi of ['processing','delivered','awaiting_payment','documents_received','needs_more_info']){
    assert.equal((await adminAction(app,{katastasi,keimeno:'Missing file',reportUrl:'https://example.com/report.pdf'})).code,'request_withdrawn');
  }
  assert.equal((await app.call('createPaymentIntent',{pin,email})).code,'payment_unavailable');
  assert.equal((await app.call('epivevaiosiPliromis',{pin,email,paymentIntentId:'pi_other'})).code,'payment_unavailable');
  assert.equal((await app.call('epivevaiosiPliromis',{pin,email,paymentIntentId:'pi_paid'})).status,'withdrawn');
  const incoming=app.object(file(1));
  assert.equal((await app.call('symplirosiAitisis',{energeia:'prosthiki_arxeion',pin,email,arxeia:[incoming]})).code,'upload_stage');
  assert.deepEqual(app.request,saved); assert.equal(app.mailCount,1); assert.equal(app.creations,0);
  const racing=setup(paidRequest()); racing.race(()=>{racing.request=saved;});
  assert.equal((await adminAction(racing,{katastasi:'delivered',reportUrl:'https://example.com/report.pdf'})).code,'request_withdrawn');
  assert.equal(racing.mailCount,0);
});

test('acknowledgement includes declaration name, PIN/date and full reimbursement without hardcoded price',async()=>{
  const app=setup(paidRequest(),{now:Date.UTC(2026,8,26,12,0)}); await withdraw(app);
  for(const text of [app.lastMail.text,app.lastMail.html]){
    assert.match(text,/PIN-123456/); assert.match(text,/26\/9\/2026/); assert.match(text,/15:00/);
    assert.match(text,/Λάβαμε τη δήλωση υπαναχώρησής σας\./); assert.match(text,/Μαρία Παπαδοπούλου/);
    assert.match(text,/Θα επιστραφεί το πλήρες ποσό που καταβάλατε στο αρχικό μέσο πληρωμής\./);
    assert.match(text,/επιστροφή εκκρεμεί/); assert.match(text,/τραπεζική\/Stripe επεξεργασία/);
    assert.doesNotMatch(text,/επιστροφή ολοκληρώθηκε|20\s*€|25\s*€|μείον|αφαιρούνται/);
  }
  assert.equal(app.lastMail.to,email);
});

test('SMTP rejection, failure and ambiguous database acknowledgement never undo withdrawal or resend',async()=>{
  for(const overrides of [{smtpFail:true},{rejected:true},{deliveryWriteFail:true},{env:{EMAIL_PASS:''}}]){
    const app=setup(paidRequest(),overrides); assert.equal((await withdraw(app)).success,true);
    assert.equal(app.request.status,'withdrawn'); assert.equal(app.request.refundStatus,'pending');
    const count=app.mailCount,saved=clone(app.request);
    assert.equal((await withdraw(app)).alreadyRequested,true); assert.equal(app.mailCount,count);
    assert.deepEqual(app.request,saved); assert.ok(app.errors.length);
  }
});

test('failed withdrawal database write sends no email and preserves the original request',async()=>{
  const initial=paidRequest(),app=setup(initial,{paymentWriteFail:true});
  assert.equal((await withdraw(app)).status,500); assert.equal(app.mailCount,0); assert.deepEqual(app.request,initial);
});

test('manual refund completion requires admin/confirmation, preserves timestamp on retry and calls no refund API',async()=>{
  const app=setup(paidRequest()); await withdraw(app); const action={energeia:'refund_completed',confirmed:true};
  assert.equal((await adminAction(app,action,'wrong')).status,403);
  assert.equal((await adminAction(app,{...action,confirmed:false})).status,400);
  assert.equal((await adminAction(setup(paidRequest()),action)).status,409);
  assert.equal((await adminAction(app,action)).success,true);
  assert.equal(app.request.refundStatus,'completed'); assert.ok(app.request.refundedAt);
  const saved=clone(app.request); await adminAction(app,action); await withdraw(app);
  assert.deepEqual(app.request,saved); assert.equal(app.request.refundAmount,paidAmount); assert.equal(app.mailCount,1);
  assert.equal(app.creations,0); assert.doesNotMatch(source,/\.refunds\s*\.\s*create\s*\(/);
});

test('tracking exposes withdrawal/refund state without PaymentIntent IDs or a withdrawn report URL',async()=>{
  const app=setup(paidRequest({finalReportUrl:'https://example.com/prepared.pdf'}));
  assert.equal((await app.call('getRequestStatus',{pin,email})).canWithdraw,true); await withdraw(app);
  const result=await app.call('getRequestStatus',{pin,email});
  assert.equal(result.canWithdraw,false); assert.equal(result.withdrawalStatus,'requested');
  assert.equal(result.refundStatus,'pending'); assert.equal(result.finalReportUrl,undefined);
  assert.equal(result.paymentIntentId,undefined); assert.equal(result.withdrawalPaymentIntentId,undefined);
});

function setup(initial = base(), overrides = {}) {
  let request = clone(initial), creations = 0, mailCount = 0, lastMail, reads = 0;
  const errors = [], requestsAtSend = [];
  let beforeTransaction;
  const objects = new Map();
  const intents = new Map();
  const retrievedIntents = [];
  if(initial?.paymentStatus==='paid' && initial.paymentIntentId) {
    intents.set(initial.paymentIntentId,paymentFixture(overrides.payment));
  }
  const keys = new Map();
  const snapshot = value => ({val:()=>clone(value), exists:()=>value != null});
  const reference = {
    child:key=>key===pin?reference:['paymentConfirmationEmail','withdrawalEmail'].includes(key)?{update:async patch=>{
      if(overrides.deliveryWriteFail)throw Object.assign(Error('delivery write failed'),{code:'database_unavailable'});
      request[key]={...request[key],...clone(patch)};
    }}:{set:async value=>{const [parent,field]=key.split('/');request[parent]={...request[parent],[field]:value};}},
    orderByChild:()=>reference, equalTo:()=>reference,
    once:async()=>{reads++; return snapshot(request);},
    update:async patch=>{request={...request,...clone(patch)};},
    transaction:async callback=>{
      // Model the initial null callback produced by an uncached Admin SDK ref.
      if (request && callback(null) === undefined) return {committed:false,snapshot:snapshot(request)};
      if(overrides.paymentWriteFail)throw Error('payment write failed');
      // A transaction callback can be rerun before its result is committed.
      if(overrides.retryTransaction)callback(clone(request));
      if (beforeTransaction) { const action=beforeTransaction; beforeTransaction=null; action(); }
      const next=callback(clone(request));
      if (next===undefined) return {committed:false,snapshot:snapshot(request)};
      request=clone(next); return {committed:true,snapshot:snapshot(request)};
    },
  };
  const dependencies = {
    'node:crypto':require('node:crypto'),
    dotenv:{config(){}},
    'firebase-functions/v2/https':{onRequest:(_options,handler)=>handler},
    cors:()=> (_req,_res,next)=>next(),
    'firebase-admin':{
      initializeApp(){}, database:()=>({ref:key=>key.startsWith('premium_requests/PIN-')&&key!==`premium_requests/${pin}`
        ? {once:async()=>snapshot(null)} : reference}),
      auth:()=>({verifyIdToken:async token=>{if(token!=='owner')throw Error('bad token'); return {uid:'owner'};}}),
      storage:()=>({bucket:()=>({file:path=>({getMetadata:async()=>{
        if(!objects.has(path))throw Object.assign(Error('missing'),{code:404});
        return [clone(objects.get(path))];
      }})})}),
    },
    stripe:class { constructor(){ this.paymentIntents={
      create:async (payload,options)=>{
        if(keys.has(options.idempotencyKey)) return intents.get(keys.get(options.idempotencyKey));
        creations++;
        const value={...payload,id:`pi_${creations}`,client_secret:'test-secret',status:'requires_payment_method'};
        intents.set(value.id,value); keys.set(options.idempotencyKey,value.id); return clone(value);
      },
      retrieve:async id=>{retrievedIntents.push(id);if(overrides.retrieveFail)throw Error('Stripe unavailable');return clone(intents.get(id));},
    };}},
    nodemailer:{createTransport:()=>({sendMail:async data=>{
      mailCount++; lastMail=data;
      requestsAtSend.push(clone(request));
      if(overrides.onSend)await overrides.onSend();
      if(overrides.smtpFail)throw Error('private SMTP credentials');
      return {accepted:overrides.rejected?[]:[data.to]};
    }})},
  };
  const context={exports:{}, require:name=>{if(!(name in dependencies))throw Error(name); return dependencies[name];},
    process:{env:{ADMIN_EMAIL_KODIKOS:'admin',STRIPE_SECRET_KEY:'fixture',EMAIL_USER:'configured@example.com',EMAIL_PASS:'fixture',PUBLIC_SITE_URL:'https://example.com',...overrides.env}},
    console:{error:(...args)=>errors.push(clone(args))}, URL, Date:class extends Date {static now(){return overrides.now ?? Date.now();}}};
  vm.runInNewContext(source,context,{filename:'index.js'});
  return {
    get request(){return request;}, set request(value){request=clone(value);},
    get creations(){return creations;}, get mailCount(){return mailCount;}, get lastMail(){return lastMail;},
    get reads(){return reads;},
    objects,intents,errors,requestsAtSend,retrievedIntents,
    race(action){beforeTransaction=action;},
    object(value,owner='owner'){objects.set(value.path,{size:String(value.size),contentType:value.type,metadata:{ownerUid:owner}}); return value;},
    call(name,body={},method='POST',token='owner',headers={}){
      return new Promise((resolve,reject)=>{
        const res={statusCode:200,status(code){this.statusCode=code;return this;},json(data){resolve({status:this.statusCode,...clone(data)});return this;}};
        try { Promise.resolve(context.exports[name]({method,body,headers:{...(token?{authorization:`Bearer ${token}`}:{ }),...headers}},res)).catch(reject); }
        catch(error){reject(error);}
      });
    },
  };
}

test('new upload validates real objects, identity, type, totals; stores only server-owned status',async()=>{
  const app=setup(null); const document=app.object(file(1));
  const result=await app.call('symplirosiAitisis',{energeia:'nea_aitisi',pin,email,arxeia:[{...document,size:1}],status:'delivered',paymentStatus:'paid'});
  assert.equal(result.success,true); assert.equal(app.request.totalBytes,mb);
  assert.equal(app.request.status,'documents_received'); assert.equal(app.request.paymentStatus,'not_requested');
  assert.equal(app.mailCount,0);
  const collision=await app.call('symplirosiAitisis',{energeia:'nea_aitisi',pin,email,arxeia:[document]});
  assert.equal(collision.code,'pin_conflict');
});

test('unauthenticated, wrong-owner, foreign-path, duplicate-path and unsupported uploads fail',async()=>{
  for(const variant of ['noauth','owner','path','duplicate','type','empty']){
    const app=setup(null); let document=file(1);
    if(variant==='path')document.path='premium_uploads/PIN-999999/1.pdf';
    if(variant==='type')document.type='text/html';
    if(variant==='empty')document.size=0;
    app.object(document,variant==='owner'?'someone-else':'owner');
    const result=await app.call('symplirosiAitisis',{energeia:'nea_aitisi',pin,email,arxeia:variant==='duplicate'?[document,document]:[document]},'POST',variant==='noauth'?null:'owner');
    assert.equal(result.success,false,variant); assert.equal(app.request,null);
  }
});

test('new and supplementary uploads cannot exceed 10 files or 50 MB, even with forged sizes',async()=>{
  for(const existing of [0,8])for(const mode of ['count','bytes']){
    const prior=Array.from({length:existing},(_,i)=>file(i,mb));
    const app=setup(existing?base({files:prior}):null);
    const incoming=mode==='count'?Array.from({length:11-existing},(_,i)=>file(20+i)):[file(20,(51-existing)*mb)];
    incoming.forEach(f=>app.object(f));
    const result=await app.call('symplirosiAitisis',{energeia:existing?'prosthiki_arxeion':'nea_aitisi',pin,email,
      arxeia:incoming.map(f=>({...f,size:1}))});
    assert.equal(result.code,'upload_limits'); assert.equal(app.request?.files.length||0,existing);
  }
});

test('exact cumulative boundary succeeds and duplicate supplementary request is idempotent',async()=>{
  const app=setup(base({status:'needs_more_info',files:Array.from({length:9},(_,i)=>file(i,5*mb))}));
  const incoming=app.object(file(10,5*mb));
  const payload={energeia:'prosthiki_arxeion',pin,email,arxeia:[incoming]};
  assert.equal((await app.call('symplirosiAitisis',payload)).success,true);
  assert.equal(app.request.files.length,10); assert.equal(app.request.totalBytes,50*mb);
  app.request={...app.request,status:'processing',paymentStatus:'paid'};
  assert.equal((await app.call('symplirosiAitisis',payload)).success,true);
  assert.equal(app.request.status,'processing'); assert.equal(app.request.files.length,10);
});

test('concurrent supplementary uploads cannot bypass cumulative limits',async()=>{
  const app=setup(base({files:Array.from({length:9},(_,i)=>file(i))}));
  const files=[app.object(file(10)),app.object(file(11))];
  const results=await Promise.all(files.map(f=>app.call('symplirosiAitisis',{energeia:'prosthiki_arxeion',pin,email,arxeia:[f]})));
  assert.equal(results.filter(r=>r.success).length,1); assert.equal(app.request.files.length,10);
  assert.equal(results.find(r=>!r.success).code,'upload_limits');
});

test('legacy byte counts are verified before preflight; later statuses cannot be regressed by uploads',async()=>{
  const app=setup(base({files:[file(1,1)],uploadLimitsVersion:undefined})); app.object(file(1,49*mb));
  const preflight=await app.call('symplirosiAitisis',{energeia:'elegxos_kodikou',pin,email});
  assert.equal(preflight.totalBytes,49*mb);
  for(const status of ['awaiting_payment','processing','delivered']){
    app.request=base({status}); const incoming=app.object(file(2));
    assert.equal((await app.call('symplirosiAitisis',{energeia:'prosthiki_arxeion',pin,email,arxeia:[incoming]})).code,'upload_stage');
    assert.equal(app.request.status,status);
  }
});

test('removed email-only lookup is rejected identically without reading requests, with or without authentication',async()=>{
  for(const request of [base(),null])for(const token of [null,'owner']){
    const app=setup(request);
    const result=await app.call('symplirosiAitisis',{energeia:'elegxos_email',email},'POST',token);
    const unknown=await app.call('symplirosiAitisis',{energeia:'elegxos_email',email:'unknown@example.com'},'POST',token);
    assert.deepEqual(result,unknown);
    assert.equal(result.status,400); assert.equal(result.success,false); assert.equal(result.code,'invalid_action');
    assert.equal(result.yparxei,undefined); assert.equal(app.reads,0);
    assert.deepEqual(app.request,request);
  }
});

test('supplement preflight still requires the same email with the PIN',async()=>{
  const app=setup();
  const match=await app.call('symplirosiAitisis',{energeia:'elegxos_kodikou',pin,email:email.toUpperCase()});
  assert.equal(match.tairiazei,true); assert.equal(match.canUpload,true);
  const mismatch=await app.call('symplirosiAitisis',{energeia:'elegxos_kodikou',pin,email:'wrong@example.com'});
  assert.equal(mismatch.tairiazei,false); assert.equal(mismatch.canUpload,undefined);
  const document=app.object(file(1));
  const upload=await app.call('symplirosiAitisis',{energeia:'prosthiki_arxeion',pin,email:'wrong@example.com',arxeia:[document]});
  assert.equal(upload.code,'not_found'); assert.equal(app.request.files.length,0);
});

test('status lookup uses one not-found response for a wrong email or missing request',async()=>{
  const app=setup(base({finalReportUrl:'https://example.com/report.pdf'}));
  const mismatch=await app.call('getRequestStatus',{pin,email:'wrong@example.com'});
  app.request=null;
  assert.deepEqual(await app.call('getRequestStatus',{pin,email}),mismatch);
});

const reportUrl='https://example.com/report.pdf';
const lookupTime=Date.parse('2026-09-25T12:00:00Z');
test('delivered within two months returns the report URL',async()=>{
  const app=setup(base({status:'delivered',deliveredAt:Date.parse('2026-08-25T12:00:00Z'),finalReportUrl:reportUrl}),{now:lookupTime});
  const result=await app.call('getRequestStatus',{pin,email});
  assert.equal(result.status,'delivered'); assert.equal(result.finalReportUrl,reportUrl);
  assert.equal(result.reportAvailabilityExpired,false);
});

test('delivered after two months omits the URL, reports expiry and remains delivered',async()=>{
  const app=setup(base({status:'delivered',deliveredAt:Date.parse('2026-07-24T12:00:00Z'),finalReportUrl:reportUrl}),{now:lookupTime});
  const original=clone(app.request);
  const result=await app.call('getRequestStatus',{pin,email});
  assert.equal(result.status,'delivered'); assert.equal(result.finalReportUrl,undefined);
  assert.equal(result.reportAvailabilityExpired,true); assert.deepEqual(app.request,original);
});

test('non-delivered requests never return a report URL even with a recent delivery timestamp',async()=>{
  for(const status of ['documents_received','needs_more_info','awaiting_payment','processing']){
    const app=setup(base({status,deliveredAt:lookupTime-1000,finalReportUrl:reportUrl}),{now:lookupTime});
    const result=await app.call('getRequestStatus',{pin,email});
    assert.equal(result.status,status); assert.equal(result.finalReportUrl,undefined);
    assert.equal(result.reportAvailabilityExpired,undefined);
  }
});

test('missing, invalid or future deliveredAt and missing URL do not expose a report',async()=>{
  for(const deliveredAt of [undefined,null,'invalid',String(lookupTime-1000),0,-1,1.5,Number.MAX_SAFE_INTEGER,lookupTime+1]){
    const app=setup(base({status:'delivered',deliveredAt,finalReportUrl:reportUrl}),{now:lookupTime});
    const result=await app.call('getRequestStatus',{pin,email});
    assert.equal(result.finalReportUrl,undefined); assert.equal(result.reportAvailabilityExpired,undefined);
  }
  const app=setup(base({status:'delivered',deliveredAt:lookupTime-1000}),{now:lookupTime});
  assert.equal((await app.call('getRequestStatus',{pin,email})).finalReportUrl,undefined);
});

test('report access ends exactly at two calendar months, including month ends and leap years',async()=>{
  for(const [delivery,expiry] of [
    ['2026-07-25T12:34:56.789Z','2026-09-25T12:34:56.789Z'],
    ['2025-12-31T12:34:56.789Z','2026-02-28T12:34:56.789Z'],
    ['2023-12-31T12:34:56.789Z','2024-02-29T12:34:56.789Z'],
  ])for(const offset of [-1,0,1]){
    const app=setup(base({status:'delivered',deliveredAt:Date.parse(delivery),finalReportUrl:reportUrl}),{now:Date.parse(expiry)+offset});
    const result=await app.call('getRequestStatus',{pin,email});
    assert.equal(result.finalReportUrl,offset<0?reportUrl:undefined,`${delivery}: ${offset}`);
    assert.equal(result.reportAvailabilityExpired,offset>=0);
  }
});

test('payment creation requires matching identity, awaiting_payment and unpaid state',async()=>{
  for(const status of ['documents_received','needs_more_info','processing','delivered']){
    const app=setup(base({status})); assert.equal((await app.call('createPaymentIntent',{pin,email})).success,false); assert.equal(app.creations,0);
  }
  for(const request of [null,base({status:'awaiting_payment',email:'other@example.com'}),base({status:'awaiting_payment',paymentStatus:'paid'})]){
    const app=setup(request); assert.equal((await app.call('createPaymentIntent',{pin,email})).success,false); assert.equal(app.creations,0);
  }
});

test('payment creation reuses one automatic-capture 20 EUR intent across concurrent/repeated calls',async()=>{
  const app=setup(base({status:'awaiting_payment'}));
  const results=await Promise.all([app.call('createPaymentIntent',{pin,email}),app.call('createPaymentIntent',{pin,email})]);
  assert.ok(results.every(r=>r.success)); assert.equal(app.creations,1);
  await app.call('createPaymentIntent',{pin,email}); assert.equal(app.creations,1);
  const intent=app.intents.get(app.request.paymentIntentId);
  assert.equal(intent.amount,2000); assert.equal(intent.currency,'eur'); assert.equal(intent.capture_method,'automatic');
  assert.equal(intent.receipt_email,email);
});

const paidIntent = (extra={})=>({id:'pi_paid',status:'succeeded',amount:2000,amount_received:2000,currency:'eur',metadata:{pin,email},...extra});
test('confirmation requires Stripe succeeded, exact amount/currency and matching PIN + email',async()=>{
  for(const extra of [{status:'requires_capture'},{amount_received:1900},{amount_received:2100},{currency:'usd'},{metadata:{pin:'PIN-999999',email}},{metadata:{pin,email:'other@example.com'}}]){
    const app=setup(base({status:'awaiting_payment'})); app.intents.set('pi_paid',paidIntent(extra));
    const result=await app.call('epivevaiosiPliromis',{pin,email,paymentIntentId:'pi_paid'});
    assert.equal(result.success,false); assert.equal(app.request.paymentStatus,'not_requested');
    assert.equal(app.mailCount,0); assert.equal(app.request.paymentConfirmationEmail,undefined);
  }
});

test('confirmation is idempotent and never regresses delivered or a concurrently changed status',async()=>{
  const app=setup(base({status:'awaiting_payment'}));app.intents.set('pi_paid',paidIntent());
  const payload={pin,email,paymentIntentId:'pi_paid',ypanaxorisiAt:1000};
  assert.equal((await app.call('epivevaiosiPliromis',payload)).success,true);assert.equal(app.request.status,'processing');
  const paidAt=app.request.paidAt;app.request={...app.request,status:'delivered'};
  assert.equal((await app.call('epivevaiosiPliromis',payload)).success,true);assert.equal(app.request.status,'delivered');assert.equal(app.request.paidAt,paidAt);
  app.request=base({status:'awaiting_payment'});app.race(()=>{app.request=base({status:'needs_more_info'});});
  assert.equal((await app.call('epivevaiosiPliromis',payload)).success,false); assert.equal(app.request.status,'needs_more_info');
  assert.equal(app.mailCount,1);
});

const confirmationPayload={pin,email,paymentIntentId:'pi_paid',ypanaxorisiAt:1000};

test('successful payment sends one order email only after recording payment and processing',async()=>{
  const app=setup(base({status:'awaiting_payment'}),{now:2000,retryTransaction:true});
  app.intents.set('pi_paid',paidIntent());
  const result=await app.call('epivevaiosiPliromis',confirmationPayload);
  assert.equal(result.success,true); assert.equal(result.plirothike,true); assert.equal(result.status,'processing');
  assert.equal(app.mailCount,1);
  const atSend=app.requestsAtSend[0];
  assert.equal(atSend.paymentStatus,'paid'); assert.equal(atSend.status,'processing');
  assert.equal(atSend.paymentIntentId,'pi_paid'); assert.equal(atSend.paidAt,2000);
  assert.equal(atSend.withdrawalConsentAt,1000);
  assert.ok(atSend.paymentConfirmationEmail.claimId); assert.equal(atSend.paymentConfirmationEmail.claimedAt,2000);
  assert.equal(atSend.paymentConfirmationEmail.sentAt,undefined);
  assert.equal(app.request.paymentConfirmationEmail.sentAt,2000);
  const recorded=clone(app.request);
  assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
  assert.equal(app.mailCount,1); assert.deepEqual(app.request,recorded);
  assert.equal(app.lastMail.to,email); assert.equal(app.lastMail.from,'"Sintaximou" <configured@example.com>');
  assert.match(app.lastMail.subject,/Επιβεβαίωση πληρωμής και παραγγελίας/);
  assert.equal(app.lastMail.attachments,undefined);
  for(const content of [app.lastMail.text,app.lastMail.html]){
    assert.match(content,/Η πληρωμή σας ολοκληρώθηκε επιτυχώς/);
    assert.match(content,/Υπηρεσία: Αναλυτικό Report/);
    assert.match(content,/Τελική τιμή για τον καταναλωτή: 20 €/);
    assert.match(content,/Η αίτησή σας βρίσκεται πλέον σε επεξεργασία/);
    for(const route of ['/report-recovery','/terms','/terms#oroi-9'])assert.ok(content.includes(`https://example.com${route}`));
    assert.match(content,/Ζητώ να ξεκινήσει άμεσα η εκτέλεση της υπηρεσίας/);
    assert.doesNotMatch(content,/invoice|παραστατικ|receipt|KOR|OSS|myDATA|timologio|με ΦΠΑ|χωρίς ΦΠΑ/i);
  }
  assert.doesNotMatch(app.lastMail.subject,/invoice|παραστατικ|receipt/i);
  assert.deepEqual(app.errors,[]);
});

test('concurrent confirmations and a retry while SMTP is pending cannot send twice',async()=>{
  let started,finish;
  const sending=new Promise(resolve=>{started=resolve;});
  const pending=new Promise(resolve=>{finish=resolve;});
  const app=setup(base({status:'awaiting_payment'}),{onSend:async()=>{started();await pending;}});
  app.intents.set('pi_paid',paidIntent());
  const first=app.call('epivevaiosiPliromis',confirmationPayload);
  const concurrent=Array.from({length:3},()=>app.call('epivevaiosiPliromis',confirmationPayload));
  await sending;
  assert.ok((await Promise.all(concurrent)).every(result=>result.success));
  assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
  assert.equal(app.mailCount,1);
  finish(); assert.equal((await first).success,true);
  assert.equal(app.mailCount,1);
});

test('SMTP rejection or failure keeps the payment successful and never retries the email',async()=>{
  for(const options of [{smtpFail:true},{rejected:true}]){
    const app=setup(base({status:'awaiting_payment'}),options); app.intents.set('pi_paid',paidIntent());
    const result=await app.call('epivevaiosiPliromis',confirmationPayload);
    assert.equal(result.success,true); assert.equal(result.plirothike,true); assert.equal(result.status,'processing');
    assert.equal(app.request.paymentStatus,'paid'); assert.ok(app.request.paidAt);
    assert.equal(app.request.withdrawalConsentAt,1000);
    assert.ok(app.request.paymentConfirmationEmail.claimId);
    assert.equal(app.request.paymentConfirmationEmail.sentAt,undefined);
    const recorded=clone(app.request);
    assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
    assert.equal(app.mailCount,1); assert.deepEqual(app.request,recorded);
    assert.equal(app.errors[0][0],'Payment confirmation email failed:');
    assert.equal(app.errors[0][1].pin,pin); assert.equal(app.errors[0][1].paymentIntentId,'pi_paid');
    assert.equal(app.errors[0][1].stage,'send');
    assert.doesNotMatch(JSON.stringify([result,app.errors]),/private SMTP credentials/);
  }
});

test('failure to record SMTP acceptance cannot undo payment or allow a duplicate email',async()=>{
  const app=setup(base({status:'awaiting_payment'}),{deliveryWriteFail:true}); app.intents.set('pi_paid',paidIntent());
  assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
  assert.equal(app.request.paymentStatus,'paid'); assert.equal(app.request.status,'processing');
  assert.ok(app.request.paymentConfirmationEmail.claimId);
  assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
  assert.equal(app.mailCount,1); assert.equal(app.errors[0][1].stage,'record_delivery');
});

test('payment database failure or a lost transaction race sends no confirmation email',async()=>{
  const failing=setup(base({status:'awaiting_payment'}),{paymentWriteFail:true}); failing.intents.set('pi_paid',paidIntent());
  assert.equal((await failing.call('epivevaiosiPliromis',confirmationPayload)).success,false);
  assert.equal(failing.request.paymentStatus,'not_requested'); assert.equal(failing.mailCount,0);
  const app=setup(base({status:'awaiting_payment'}),{retryTransaction:true}); app.intents.set('pi_paid',paidIntent());
  app.race(()=>{app.request=base({status:'processing',paymentStatus:'paid',paymentIntentId:'pi_paid',
    paidAt:2000,paymentConfirmationEmail:{claimId:'another-worker',claimedAt:2000}});});
  assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
  assert.equal(app.mailCount,0); assert.equal(app.request.paymentConfirmationEmail.claimId,'another-worker');
});

test('missing email configuration is logged without failing or retrying a recorded payment',async()=>{
  for(const env of [{PUBLIC_SITE_URL:''},{PUBLIC_SITE_URL:'http://example.com'},{EMAIL_PASS:''}]){
    const app=setup(base({status:'awaiting_payment'}),{env}); app.intents.set('pi_paid',paidIntent());
    assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
    assert.equal(app.request.paymentStatus,'paid'); assert.equal(app.request.status,'processing');
    assert.equal(app.mailCount,0); assert.equal(app.errors.length,1);
    assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
    assert.equal(app.mailCount,0); assert.equal(app.errors.length,1);
  }
});

test('previously paid or already claimed requests do not receive another order email',async()=>{
  for(const status of ['processing','delivered']){
    const app=setup(base({status,paymentStatus:'paid',paymentIntentId:'pi_paid',paidAt:2000}));
    assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
    assert.equal(app.request.status,status); assert.equal(app.mailCount,0);
  }
  const app=setup(base({status:'awaiting_payment',paymentConfirmationEmail:{claimId:'prior-claim',claimedAt:1500}}));
  app.intents.set('pi_paid',paidIntent());
  assert.equal((await app.call('epivevaiosiPliromis',confirmationPayload)).success,true);
  assert.equal(app.mailCount,0); assert.equal(app.request.paymentConfirmationEmail.claimId,'prior-claim');
});

test('contact validates method, lengths, email and rejects attachments without sending mail',async()=>{
  const app=setup();
  assert.equal((await app.call('sendContactMessage',{},'GET')).status,405);
  for(const body of [{email:'bad',message:'hello there'},{email,message:'short'},{email,message:'x'.repeat(5001)},{email,message:'hello there',attachments:[]},{email:'a@example.com\r\nBcc:x@example.com',message:'hello there'}]){
    assert.equal((await app.call('sendContactMessage',body)).status,400);
  }
  assert.equal(app.mailCount,0);
});

test('contact confirms SMTP acceptance only, uses configured recipient/replyTo and never leaks SMTP failures',async()=>{
  const app=setup(null,{env:{CONTACT_EMAIL:'contact@example.com'}});
  assert.equal((await app.call('sendContactMessage',{email,message:'A normal question.'})).success,true);
  assert.equal(app.lastMail.to,'contact@example.com');assert.equal(app.lastMail.replyTo,email);
  assert.equal(app.lastMail.from,'"Sintaximou" <configured@example.com>');assert.equal(app.lastMail.attachments,undefined);
  const fallback=setup();await fallback.call('sendContactMessage',{email,message:'A normal question.'});assert.equal(fallback.lastMail.to,'configured@example.com');
  for(const options of [{smtpFail:true},{rejected:true}]){
    const failing=setup(null,options);const result=await failing.call('sendContactMessage',{email,message:'A normal question.'});
    assert.equal(result.success,false);assert.equal(result.error,'Το μήνυμα δεν στάλθηκε. Δοκιμάστε ξανά σε λίγο.');
  }
});
