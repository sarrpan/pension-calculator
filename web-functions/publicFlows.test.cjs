const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('./index.js'), 'utf8');
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const pin = 'PIN-123456';
const email = 'visitor@example.com';
const mb = 1024 * 1024;
const file = (index, size = 1 * mb) => ({path:`premium_uploads/${pin}/${index}.pdf`, name:`${index}.pdf`, size, type:'application/pdf'});
const base = (extra = {}) => ({pin, email, status:'documents_received', createdAt:1234, paymentStatus:'not_requested', files:[], uploadLimitsVersion:1, ...extra});

function setup(initial = base(), overrides = {}) {
  let request = clone(initial), creations = 0, mailCount = 0, lastMail;
  let beforeTransaction;
  const objects = new Map();
  const intents = new Map();
  const keys = new Map();
  const snapshot = value => ({val:()=>clone(value), exists:()=>value != null});
  const reference = {
    child:()=>reference, orderByChild:()=>reference, equalTo:()=>reference,
    once:async()=>snapshot(request),
    update:async patch=>{request={...request,...clone(patch)};},
    transaction:async callback=>{
      // Model the initial null callback produced by an uncached Admin SDK ref.
      if (request && callback(null) === undefined) return {committed:false,snapshot:snapshot(request)};
      if (beforeTransaction) { const action=beforeTransaction; beforeTransaction=null; action(); }
      const next=callback(clone(request));
      if (next===undefined) return {committed:false,snapshot:snapshot(request)};
      request=clone(next); return {committed:true,snapshot:snapshot(request)};
    },
  };
  const dependencies = {
    dotenv:{config(){}},
    'firebase-functions/v2/https':{onRequest:(_options,handler)=>handler},
    cors:()=> (_req,_res,next)=>next(),
    'firebase-admin':{
      initializeApp(){}, database:()=>({ref:()=>reference}),
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
      retrieve:async id=>clone(intents.get(id)),
    };}},
    nodemailer:{createTransport:()=>({sendMail:async data=>{
      mailCount++; lastMail=data;
      if(overrides.smtpFail)throw Error('private SMTP credentials');
      return {accepted:overrides.rejected?[]:[data.to]};
    }})},
  };
  const context={exports:{}, require:name=>{if(!(name in dependencies))throw Error(name); return dependencies[name];},
    process:{env:{STRIPE_SECRET_KEY:'fixture',EMAIL_USER:'configured@example.com',EMAIL_PASS:'fixture',PUBLIC_SITE_URL:'https://example.com',...overrides.env}},
    console:{error(){}}, URL};
  vm.runInNewContext(source,context,{filename:'index.js'});
  return {
    get request(){return request;}, set request(value){request=clone(value);},
    get creations(){return creations;}, get mailCount(){return mailCount;}, get lastMail(){return lastMail;},
    objects,intents,
    race(action){beforeTransaction=action;},
    object(value,owner='owner'){objects.set(value.path,{size:String(value.size),contentType:value.type,metadata:{ownerUid:owner}}); return value;},
    call(name,body={},method='POST',token='owner'){
      return new Promise((resolve,reject)=>{
        const res={statusCode:200,status(code){this.statusCode=code;return this;},json(data){resolve({status:this.statusCode,...clone(data)});return this;}};
        try { Promise.resolve(context.exports[name]({method,body,headers:token?{authorization:`Bearer ${token}`}:{ }},res)).catch(reject); }
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

test('status lookup uses one not-found response; delivered URL only for delivered requests',async()=>{
  const app=setup(base({finalReportUrl:'https://example.com/report.pdf'}));
  const mismatch=await app.call('getRequestStatus',{pin,email:'wrong@example.com'});
  app.request=null;
  assert.deepEqual(await app.call('getRequestStatus',{pin,email}),mismatch);
  app.request=base({status:'processing',finalReportUrl:'https://example.com/report.pdf'});
  assert.equal((await app.call('getRequestStatus',{pin,email})).finalReportUrl,undefined);
  app.request={...app.request,status:'delivered'};
  assert.equal((await app.call('getRequestStatus',{pin,email})).finalReportUrl,'https://example.com/report.pdf');
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
});

const paidIntent = (extra={})=>({id:'pi_paid',status:'succeeded',amount:2000,amount_received:2000,currency:'eur',metadata:{pin,email},...extra});
test('confirmation requires Stripe succeeded, exact amount/currency and matching PIN + email',async()=>{
  for(const extra of [{status:'requires_capture'},{amount_received:1900},{amount_received:2100},{currency:'usd'},{metadata:{pin:'PIN-999999',email}},{metadata:{pin,email:'other@example.com'}}]){
    const app=setup(base({status:'awaiting_payment'})); app.intents.set('pi_paid',paidIntent(extra));
    const result=await app.call('epivevaiosiPliromis',{pin,email,paymentIntentId:'pi_paid'});
    assert.equal(result.success,false); assert.equal(app.request.paymentStatus,'not_requested');
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
