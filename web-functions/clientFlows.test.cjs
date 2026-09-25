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

function serviceHarness(responses=[]) {
  const uploads=[],deletes=[],calls=[];
  const source=fs.readFileSync(path.join(root,'src/services/stripe/premiumService.js'),'utf8')
    .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','ENV').replaceAll('export const ','const ');
  const scope={ENV:{VITE_SYMPLIROSI_AITISIS_URL:'http://fixture/upload',VITE_GET_REQUEST_STATUS_URL:'http://fixture/status'},crypto:webcrypto,
    storage:{},storageRef:(_storage,filePath)=>filePath,initAuth:async()=>({uid:'owner',getIdToken:async()=>'auth-token'}),
    uploadBytes:async(...args)=>{uploads.push(args);},deleteObject:async filePath=>deletes.push(filePath),
    fetch:async(url,options)=>{calls.push({url,...options,body:JSON.parse(options.body)});const result=responses.shift(); if(result instanceof Error)throw result;
      return {ok:result?.ok!==false,status:result?.status||200,json:async()=>result?.data||{success:true}};},
  };
  vm.runInNewContext(source+'\nthis.api={validateUploadFiles,anevasmaAitisis,prosthikiSeAitisi};',scope);
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
  for(const status of ['documents_received','needs_more_info','awaiting_payment','processing','delivered','delivered-no-url']){
    let calls=0;
    const h=component('src/pages/ReportRecoveryPage.jsx',{
      '../services/stripe/stripeService':{__esModule:true,default:null},
      '../services/stripe/premiumService':{katastasiAitisis:async()=>{calls++;return {success:true,vrethike:true,aitisi:{pin:'PIN-123456',email:'v@example.com',status:status.replace('-no-url',''),finalReportUrl:status==='delivered'?'https://example.com/report.pdf':null}};}},
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
  }
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
