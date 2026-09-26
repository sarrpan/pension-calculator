const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
const {transformSync}=require('esbuild');
const root=path.resolve(__dirname,'..');
const clone=value=>JSON.parse(JSON.stringify(value));
const fixture={name:'sample.pdf',type:'application/pdf',size:1024};

function serviceHarness(responses=[],env={}) {
  const uploads=[],deletes=[],calls=[];
  const source=fs.readFileSync(path.join(root,'src/services/stripe/premiumService.js'),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','ENV').replaceAll('export const ','const ');
  const scope={ENV:{VITE_REQUEST_WITHDRAWAL_URL:'http://fixture/withdraw',VITE_SYMPLIROSI_AITISIS_URL:'http://fixture/upload',VITE_GET_REQUEST_STATUS_URL:'http://fixture/status',...env},crypto:webcrypto,
    storage:{},storageRef:(_storage,filePath)=>filePath,initAuth:async()=>({uid:'owner',getIdToken:async()=>'auth-token'}),
    uploadBytes:async(...args)=>{uploads.push(args);},deleteObject:async filePath=>deletes.push(filePath),
    fetch:async(url,options)=>{calls.push({url,...options,body:JSON.parse(options.body)});const result=responses.shift(); if(result instanceof Error)throw result;
      return {ok:result?.ok!==false,status:result?.status||200,json:async()=>result?.data||{success:true}};},
  };
  vm.runInNewContext(source+'\nthis.api={validateUploadFiles,anevasmaAitisis,prosthikiSeAitisi,katastasiAitisis,ypovoliYpanachorisis};',scope);
  return {...scope.api,uploads,deletes,calls};
}

test('upload service blocks bad type/count/bytes before any network upload',async()=>{
  const h=serviceHarness();
  for(const files of [[{...fixture,type:'text/html'}],Array(11).fill(fixture),[{...fixture,size:50*1024*1024+1}]]){
    assert.equal((await h.anevasmaAitisis({email:'v@example.com'},files)).success,false);
    assert.equal((await h.prosthikiSeAitisi('123456','v@example.com',files)).success,false);
  }
  assert.equal(h.uploads.length,0);assert.equal(h.calls.length,0);
});
test('supplement preflight includes existing files/bytes and never uploads past total limits',async()=>{
  for(const existing of [{fileCount:10,totalBytes:100},{fileCount:1,totalBytes:50*1024*1024}]){
    const h=serviceHarness([{data:{success:true,tairiazei:true,canUpload:true,...existing}}]);
    assert.equal((await h.prosthikiSeAitisi('123456','v@example.com',[fixture])).success,false);assert.equal(h.uploads.length,0);
  }
});
test('new upload sends real bytes, owner metadata and authenticated server creation without client database writes',async()=>{
  const h=serviceHarness([{data:{success:true,plithosArxeion:1}}]);
  const result=await h.anevasmaAitisis({email:'V@EXAMPLE.COM'},[fixture]);
  assert.equal(result.success,true);assert.equal(h.uploads.length,1);
  assert.equal(h.calls.length,1);
  assert.equal(h.uploads[0][1],fixture);assert.equal(h.uploads[0][2].customMetadata.ownerUid,'owner');
  assert.equal(h.calls[0].headers.Authorization,'Bearer auth-token');assert.equal(h.calls[0].body.energeia,'nea_aitisi');
  assert.equal(h.calls[0].body.email,'v@example.com');assert.equal(h.calls[0].body.arxeia.length,1);
});
test('cleanup occurs for definite rejection but not for an ambiguous, possibly committed response',async()=>{
  for(const uncertain of [true,false]){
    const h=serviceHarness([uncertain?new TypeError('lost response'):{ok:false,status:409,data:{success:false,code:'upload_limits'}}]);
    const result=await h.anevasmaAitisis({email:'v@example.com'},[fixture]);
    assert.equal(result.success,false);assert.equal(h.deletes.length,uncertain?0:1);
    if(uncertain)assert.match(result.error,/PIN-\d{6}/);
  }
});

function component(relative,imports={},env={}){
  const code=transformSync(fs.readFileSync(path.join(root,relative),'utf8').replaceAll('import.meta.env','ENV'),{loader:'jsx',format:'cjs'}).code;
  let states=[],cursor=0,tree;
  const React={createElement:(type,props,...children)=>({type,props:{...props,children:children.flat(Infinity).filter(x=>x!==false&&x!=null)}}),
    useState:initial=>{const index=cursor++;if(!(index in states))states[index]=typeof initial==='function'?initial():initial;
      return [states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value;}];},
    useRef:initial=>{const index=cursor++;return states[index]||=( {current:initial} );},useEffect(){}};
  const scope={module:{exports:{}},ENV:env,console:{error(){}},fetch:imports.fetch,URL,window:{},
    require:name=>name==='react'?React:name==='react-router-dom'?{Link:'Link'}:name.endsWith('.css')?{}:imports[name]||{}};
  vm.runInNewContext(code,scope);
  const flatten=node=>typeof node==='object'&&node?[node,...(node.props?.children||[]).flatMap(flatten)]:[];
  return {render(props={}){cursor=0;tree=scope.module.exports.default(props);return tree;},
    nodes(predicate){return flatten(tree).filter(predicate);},
    one(predicate){const result=this.nodes(predicate);assert.equal(result.length,1);return result[0];},
    text(){return JSON.stringify(tree,(key,value)=>typeof value==='function'?undefined:value);},
  };
}

test('tracking service forwards report expiry without changing delivered status',async()=>{
  for(const expired of [true,false]){
    const h=serviceHarness([{data:{success:true,vrethike:true,pin:'PIN-123456',email:'v@example.com',status:'delivered',
      reportAvailabilityExpired:expired,...(!expired?{finalReportUrl:'https://example.com/report.pdf'}:{})}}]);
    const result=await h.katastasiAitisis('123456','V@EXAMPLE.COM');
    assert.equal(result.aitisi.status,'delivered'); assert.equal(result.aitisi.reportAvailabilityExpired,expired);
    assert.equal(result.aitisi.finalReportUrl,expired?null:'https://example.com/report.pdf');
    assert.deepEqual(h.calls[0].body,{pin:'PIN-123456',email:'v@example.com'});
  }
});

test('upload submits directly without PIN and preserves PIN + email supplementation; privacy wording is accurate',async()=>{
  for(const supplementary of [false,true]){
    const calls=[];
    const h=component('src/pages/PremiumUploadPage.jsx',{
      '../services/stripe/premiumService':{
        validateUploadFiles:()=>'',
        anevasmaAitisis:async(...args)=>{calls.push({type:'new',args});return {success:true,pin:'PIN-123456'};},
        prosthikiSeAitisi:async(...args)=>{calls.push({type:'supplement',args});return {success:true,pin:'PIN-123456'};},
      },
    });
    h.render();
    assert.match(h.text(),/Τα έγγραφα αποθηκεύονται σε προστατευμένο χώρο με περιορισμένη πρόσβαση/);
    assert.match(h.text(),/Διαγραφή νωρίτερα με απλό αίτημα/);
    assert.doesNotMatch(h.text(),/υπολογιστή χωρίς σύνδεση στο διαδίκτυο|διαγράφονται αμέσως|για τον εκτίμηση|Φαίνεται ότι μας έχετε ξαναστείλει/);
    h.one(n=>n.props.id==='pu-email').props.onChange({target:{value:'visitor@example.com'}});
    if(supplementary)h.one(n=>n.props.id==='pu-kodikos').props.onChange({target:{value:'123456'}});
    h.one(n=>n.props.type==='file').props.onChange({target:{files:[fixture],value:'sample.pdf'}});
    h.one(n=>n.props.type==='checkbox').props.onChange({target:{checked:true}}); h.render();
    await h.one(n=>n.type==='form').props.onSubmit({preventDefault(){}}); h.render();
    assert.equal(calls.length,1); assert.equal(calls[0].type,supplementary?'supplement':'new');
    if(supplementary)assert.deepEqual(clone(calls[0].args.slice(0,3)),['123456','visitor@example.com',[fixture]]);
    else assert.deepEqual(clone(calls[0].args.slice(0,2)),[{email:'visitor@example.com',tilefono:''},[fixture]]);
    assert.match(h.text(),/PIN-123456/);
  }
});

test('contact sends email + message only; success requires a successful server response',async()=>{
  for(const ok of [true,false]){
    let resolve,body;
    const h=component('src/pages/ContactPage.jsx',{fetch:async(_url,options)=>{body=JSON.parse(options.body);return new Promise(r=>resolve=r);}},{VITE_CONTACT_URL:'http://fixture/contact'});
    h.render();h.one(n=>n.props.id==='ct-email').props.onChange({target:{value:'visitor@example.com'}});
    h.one(n=>n.props.id==='ct-minima').props.onChange({target:{value:'A normal question.'}});h.render();
    const promise=h.one(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render();
    assert.equal(h.nodes(n=>n.props.className==='ct-sent').length,0);assert.match(h.text(),/Γίνεται αποστολή/);
    resolve({ok,json:async()=>({success:ok})});await promise;h.render();
    assert.deepEqual(Object.keys(body).sort(),['email','message']);
    assert.equal(h.nodes(n=>n.props.className==='ct-sent').length,ok?1:0);
    assert.equal(h.nodes(n=>n.props.href?.startsWith('mailto:')).length,0);
    if(!ok)assert.match(h.text(),/Το μήνυμα δεν στάλθηκε/);
  }
});

test('recovery validates six digits, preserves statuses, only offers payment when awaiting_payment and exposes correct delivery links',async()=>{
  for(const status of ['documents_received','needs_more_info','awaiting_payment','processing','delivered','delivered-no-url','delivered-expired']){
    let calls=0;
    const h=component('src/pages/ReportRecoveryPage.jsx',{
      '../services/stripe/stripeService':{__esModule:true,default:null},
      '../services/stripe/premiumService':{katastasiAitisis:async()=>{calls++;return {success:true,vrethike:true,aitisi:{pin:'PIN-123456',email:'v@example.com',status:status.startsWith('delivered')?'delivered':status,finalReportUrl:status==='delivered'?'https://example.com/report.pdf':null,reportAvailabilityExpired:status==='delivered-expired'}};}},
      '@stripe/react-stripe-js':{Elements:'Elements'},
    });
    h.render();h.one(n=>n.props.id==='pin').props.onChange({target:{value:'a12'}});h.render();
    await h.one(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render();assert.equal(calls,0);assert.match(h.text(),/ακριβώς έξι ψηφία/);
    h.one(n=>n.props.id==='pin').props.onChange({target:{value:'123456letters7'}});h.one(n=>n.props.id==='email').props.onChange({target:{value:'v@example.com'}});h.render();
    assert.equal(h.one(n=>n.props.id==='pin').props.value,'123456');assert.equal(h.one(n=>n.props.id==='pin').props.maxLength,6);
    await h.one(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render();
    assert.equal(h.nodes(n=>n.props.className==='pay-block').length,status==='awaiting_payment'?1:0);
    if(status==='awaiting_payment'){assert.match(h.text(),/υπηρεσία πληρωμών δεν είναι διαθέσιμη/);assert.match(h.text(),/10 εργάσιμων/);}
    if(status==='needs_more_info')assert.ok(h.nodes(n=>n.props.to==='/premium-upload').length);
    if(status==='delivered')assert.equal(h.one(n=>n.props.className==='download-btn').props.href,'https://example.com/report.pdf');
    if(status==='delivered-no-url')assert.match(h.text(),/Ελέγξτε το email σας/);
    if(status==='delivered-expired'){
      assert.equal(h.nodes(n=>n.props.className==='download-btn').length,0);
      assert.match(h.text(),/Η online διαθεσιμότητα της έκθεσης έχει λήξει/);
      assert.match(h.text(),/Αν χρειάζεστε ξανά την έκθεση/);
      assert.ok(h.nodes(n=>n.props.to==='/contact').length);
    }
  }
});

test('withdrawal service normalizes PIN/email and preserves generic failure codes and confirmed flag',async()=>{
  const h=serviceHarness([{data:{success:true,withdrawalStatus:'requested',refundStatus:'pending',refundAmount:2500,refundCurrency:'eur'}},
    {ok:false,status:404,data:{code:'not_found'}}]);
  assert.equal((await h.ypovoliYpanachorisis('123456',' V@EXAMPLE.COM ',true,'Μαρία Παπαδοπούλου')).refundAmount,2500);
  assert.deepEqual(h.calls[0].body,{pin:'PIN-123456',email:'v@example.com',confirmed:true,fullName:'Μαρία Παπαδοπούλου'});
  assert.equal(h.calls[0].url,'http://fixture/withdraw');
  const result=await h.ypovoliYpanachorisis('999999','v@example.com',false);
  assert.equal(result.success,false); assert.equal(result.code,'not_found'); assert.match(result.error,/Δεν βρέθηκε αίτηση με αυτά τα στοιχεία/);
  assert.equal(h.calls[1].body.confirmed,false);
});

test('unconfigured withdrawal endpoint fails without calling the upload endpoint',async()=>{
  const h=serviceHarness([],{VITE_REQUEST_WITHDRAWAL_URL:undefined});
  assert.equal((await h.ypovoliYpanachorisis('123456','v@example.com',true)).success,false);
  assert.equal(h.calls.length,0);
});

async function recoveryWithdrawal(data,submit=async()=>({success:true,withdrawalStatus:'requested',refundStatus:'pending'})){
  const h=component('src/pages/ReportRecoveryPage.jsx',{
    '../services/stripe/stripeService':{__esModule:true,default:null},
    '../services/stripe/premiumService':{
      katastasiAitisis:async()=>({success:true,vrethike:true,aitisi:{pin:'PIN-123456',email:'v@example.com',...data}}),
      ypovoliYpanachorisis:submit,
    },'@stripe/react-stripe-js':{Elements:'Elements'},
  });
  h.render(); h.one(n=>n.props.id==='pin').props.onChange({target:{value:'123456'}});
  h.one(n=>n.props.id==='email').props.onChange({target:{value:'v@example.com'}});h.render();
  await h.one(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render();return h;
}
const withdrawalButton=n=>n.type==='button'&&n.props.children.includes('Υπαναχώρηση από τη σύμβαση');

test('self-service withdrawal is only offered for paid undelivered requests and never shows processing/payment after withdrawal',async()=>{
  for(const data of [{status:'documents_received'}, {status:'awaiting_payment'},
    {status:'processing',paymentStatus:'paid'}, {status:'delivered',paymentStatus:'paid'},
    {status:'processing',paymentStatus:'paid',reportDelivered:true},
    {status:'withdrawn',paymentStatus:'paid',withdrawalStatus:'requested'},
    {status:'processing',paymentStatus:'paid',withdrawalRequestedAt:1234}]){
    const h=await recoveryWithdrawal(data);
    const offered=data.status==='processing'&&!data.reportDelivered&&!data.withdrawalRequestedAt;
    assert.equal(h.nodes(withdrawalButton).length,offered?1:0);
    if(data.withdrawalStatus||data.withdrawalRequestedAt){
      assert.match(h.text(),/Το αίτημα υπαναχώρησης έχει ήδη καταγραφεί/);
      assert.equal(h.nodes(n=>n.props.className==='stages'||n.props.className==='pay-block').length,0);
      assert.doesNotMatch(h.text(),/Ετοιμάζεται η εκτίμηση σύνταξης/);
    }
    if(data.status==='delivered'||data.reportDelivered){assert.match(h.text(),/Η υπηρεσία έχει ολοκληρωθεί/);assert.ok(h.nodes(n=>n.props.to==='/contact').length);}
  }
});

test('withdrawal confirmation uses the found request credentials, locks double submits and reports pending refund only after success',async()=>{
  let finish; const calls=[];
  const h=await recoveryWithdrawal({status:'processing',paymentStatus:'paid'},(...args)=>{calls.push(args);return new Promise(resolve=>finish=resolve);});
  h.one(withdrawalButton).props.onClick();h.render();
  const form=()=>h.one(n=>n.type==='form'&&n.props.children.some(child=>child?.type==='label'));
  await form().props.onSubmit({preventDefault(){}});assert.equal(calls.length,0);
  h.one(n=>n.props.type==='checkbox').props.onChange({target:{checked:true}});h.render();
  assert.equal(h.one(n=>n.props.id==='withdrawal-full-name').props.required,true);
  await form().props.onSubmit({preventDefault(){}});h.render();assert.equal(calls.length,0);
  assert.match(h.text(),/Συμπληρώστε το ονοματεπώνυμό σας/);
  h.one(n=>n.props.id==='withdrawal-full-name').props.onChange({target:{value:' Μαρία  Παπαδοπούλου '}});h.render();
  // Editing the search fields must not change the authenticated request being withdrawn.
  h.one(n=>n.props.id==='email').props.onChange({target:{value:'other@example.com'}});h.render();
  const submit=form().props.onSubmit,first=submit({preventDefault(){}});await submit({preventDefault(){}});h.render();
  assert.equal(calls.length,1);assert.deepEqual(calls[0],['PIN-123456','v@example.com',true,'Μαρία Παπαδοπούλου']);
  assert.match(h.text(),/Υποβολή…/);assert.doesNotMatch(h.text(),/Το αίτημα υπαναχώρησης καταγράφηκε/);
  finish({success:true,withdrawalStatus:'requested',withdrawalRequestedAt:1234,refundStatus:'pending'});await first;h.render();
  assert.match(h.text(),/πλήρης επιστροφή του ποσού που καταβάλατε στο αρχικό μέσο πληρωμής/);
  assert.equal(h.nodes(withdrawalButton).length,0);assert.equal(h.nodes(n=>n.props.className==='stages').length,0);
  assert.doesNotMatch(h.text(),/επιστροφή ολοκληρώθηκε|μείον|20\s*€/);
});

test('failed withdrawal never displays success; concurrent delivery removes the form and offers contact',async()=>{
  for(const code of ['unavailable','report_delivered']){
    const h=await recoveryWithdrawal({status:'processing',paymentStatus:'paid'},async()=>({success:false,code,error:'Η υποβολή δεν ολοκληρώθηκε.'}));
    h.one(withdrawalButton).props.onClick();h.render();h.one(n=>n.props.type==='checkbox').props.onChange({target:{checked:true}});h.render();
    h.one(n=>n.props.id==='withdrawal-full-name').props.onChange({target:{value:'Μαρία Παπαδοπούλου'}});h.render();
    await h.one(n=>n.type==='form'&&n.props.children.some(child=>child?.type==='label')).props.onSubmit({preventDefault(){}});h.render();
    assert.doesNotMatch(h.text(),/Το αίτημα υπαναχώρησης καταγράφηκε/);assert.ok(h.nodes(n=>n.props.role==='alert').length);
    if(code==='report_delivered'){assert.equal(h.nodes(n=>n.props.type==='checkbox').length,0);assert.match(h.text(),/Η υπηρεσία έχει ολοκληρωθεί/);}
  }
});

test('name input is limited to withdrawal; Terms contain the optional alternative model and retain online withdrawal',async()=>{
  const recovery=await recoveryWithdrawal({status:'processing',paymentStatus:'paid'});
  assert.equal(recovery.nodes(n=>n.props.id==='withdrawal-full-name').length,0);
  const terms=component('src/pages/legal/TermsPage.jsx');terms.render();
  assert.match(terms.one(n=>n.props.id==='withdrawal-model').props.children.join(''),/Προαιρετικό υπόδειγμα/);
  const section=JSON.stringify(terms.one(n=>n.props.id==='oroi-9'));
  for(const wording of [/Προς τον πάροχο/,/δηλώνω ότι υπαναχωρώ από τη σύμβαση/,
    /Υπηρεσία: Αναλυτικό Report/,/Ημερομηνία σύναψης της σύμβασης\/παραγγελίας/,
    /Ονοματεπώνυμο καταναλωτή/,/Διεύθυνση καταναλωτή/,/Ημερομηνία δήλωσης/,
    /Υπογραφή καταναλωτή, μόνο αν αποστέλλεται σε έντυπη μορφή/,/Η χρήση του δεν είναι υποχρεωτική/,
    /Η online υποβολή από την Παρακολούθηση Αίτησης είναι ο ευκολότερος τρόπος/]) assert.match(section,wording);
  assert.doesNotMatch(section,/20\s*€/);
});

test('Stripe form accepts succeeded only and translates raw Stripe errors',async()=>{
  for(const scenario of ['succeeded','requires_capture','decline']){
    let submitted=0;
    const h=component('src/components/stripe/StripePaymentForm.jsx',{
      '@stripe/react-stripe-js':{CardNumberElement:'Number',CardExpiryElement:'Expiry',CardCvcElement:'Cvc',
        useStripe:()=>({confirmCardPayment:async()=>scenario==='decline'?{error:{code:'card_declined',message:'Your card was declined'}}:{paymentIntent:{id:'pi_test',status:scenario}}}),
        useElements:()=>({getElement:()=>({})})},
      fetch:async()=>({ok:true,json:async()=>({success:true,clientSecret:'fixture'})}),
    },{VITE_CREATE_PAYMENT_INTENT_URL:'http://fixture/pay'});
    const props={onFileSubmit:async()=>{submitted++;},pin:'PIN-123456',email:'v@example.com'};
    h.render(props);for(const type of ['Number','Expiry','Cvc'])h.one(n=>n.type===type).props.onChange({complete:true});
    h.one(n=>n.type==='input'&&n.props.type==='checkbox').props.onChange({target:{checked:true}});h.render(props);
    await h.one(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render(props);
    assert.equal(submitted,scenario==='succeeded'?1:0);assert.doesNotMatch(h.text(),/Your card was declined/);
    if(scenario==='decline')assert.match(h.text(),/Η κάρτα δεν έγινε δεκτή/);
  }
});
