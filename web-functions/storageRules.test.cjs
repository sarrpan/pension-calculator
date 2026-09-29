const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initializeApp,deleteApp}=require('firebase/app');
const {getAuth,connectAuthEmulator,signInAnonymously,createUserWithEmailAndPassword}=require('firebase/auth');
const {getStorage,connectStorageEmulator,ref,uploadBytes,getMetadata,deleteObject,updateMetadata,getDownloadURL}=require('firebase/storage');
const {getDatabase,connectDatabaseEmulator,ref:dbRef,get,set}=require('firebase/database');
const admin=require('firebase-admin');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const paidServiceConfig=require('./test-support/paidServiceConfig.cjs');

const enabled=process.env.FIREBASE_AUTH_EMULATOR_HOST&&process.env.FIREBASE_STORAGE_EMULATOR_HOST&&process.env.FIREBASE_DATABASE_EMULATOR_HOST;
test('real emulators: prelaunch upload lock and preserved live Storage rules',{skip:!enabled,timeout:120000},async(t)=>{
  for(const variable of ['FIREBASE_AUTH_EMULATOR_HOST','FIREBASE_STORAGE_EMULATOR_HOST','FIREBASE_DATABASE_EMULATOR_HOST']){
    assert.match(process.env[variable],/^(127\.0\.0\.1|localhost):\d+$/,`${variable} must point to a local emulator`);
  }
  const storageRules=fs.readFileSync(require.resolve('./storage.rules'),'utf8');
  const switchPattern=/(function paidServiceUploadsEnabled\(\)\s*\{\s*return )false(;\s*\})/;
  assert.match(storageRules,switchPattern,'Repository Storage rules must default to prelaunch');
  const liveRules=storageRules.replace(switchPattern,'$1true$2');
  async function loadStorageRules(content){
    const response=await fetch(`http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/internal/setRules`,{
      method:'PUT',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({rules:{files:[{name:'storage.rules',content}]}}),
    });
    assert.equal(response.status,200,'Local Storage emulator must accept the rules');
  }
  const projectId='demo-premium-flows';
  // Never run this test against a configured/live Firebase project.
  const namespace=`${projectId}-default-rtdb`;
  const adminApp=admin.initializeApp({projectId,storageBucket:`${projectId}.appspot.com`,databaseURL:`http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST}?ns=${namespace}`},'rules-tests');
  const apps=[];
  async function client(name,login=true){
    const app=initializeApp({projectId,apiKey:'demo-key',storageBucket:`${projectId}.appspot.com`,databaseURL:`https://${namespace}.firebaseio.com`},name);
    apps.push(app);
    const auth=getAuth(app);connectAuthEmulator(auth,`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`,{disableWarnings:true});
    const storage=getStorage(app);const [host,port]=process.env.FIREBASE_STORAGE_EMULATOR_HOST.split(':');connectStorageEmulator(storage,host,Number(port));
    const database=getDatabase(app);const [dbHost,dbPort]=process.env.FIREBASE_DATABASE_EMULATOR_HOST.split(':');connectDatabaseEmulator(database,dbHost,Number(dbPort));
    if(login==='registered')await createUserWithEmailAndPassword(auth,'storage-fixture@example.invalid','emulator-only-password');
    else if(login)await signInAnonymously(auth);
    return {auth,storage,database};
  }
  try{
    await loadStorageRules(storageRules);
    const owner=await client('owner'),other=await client('other'),publicClient=await client('public',false),manager=await client('manager');
    const registered=await client('registered','registered');
    await adminApp.auth().setCustomUserClaims(manager.auth.currentUser.uid,{admin:true});
    await manager.auth.currentUser.getIdToken(true);
    const metadata={contentType:'application/pdf',customMetadata:{ownerUid:owner.auth.currentUser.uid}};
    const payload=new Uint8Array([37,80,68,70,45,49]);

    await t.test('prelaunch: direct anonymous, registered and unauthenticated new uploads are denied',async()=>{
      assert.equal(owner.auth.currentUser.isAnonymous,true);
      assert.equal(registered.auth.currentUser.isAnonymous,false);
      for(const [name,user] of [['anonymous',owner],['registered',registered],['public',publicClient]]){
        const target=`premium_uploads/PIN-123456/blocked-${name}.pdf`;
        const validMetadata={...metadata,customMetadata:{ownerUid:user.auth.currentUser?.uid||'no-user'}};
        await assert.rejects(uploadBytes(ref(user.storage,target),payload,validMetadata),error=>error.code==='storage/unauthorized');
        assert.equal((await adminApp.storage().bucket().file(target).exists())[0],false);
      }
    });

    await t.test('prelaunch: existing files keep read/delete protection and final_reports keeps admin access',async()=>{
      const bucket=adminApp.storage().bucket();
      // Trusted emulator-only seeding represents documents uploaded before prelaunch.
      const existing='premium_uploads/PIN-123456/existing.pdf';
      const ownerCleanup='premium_uploads/PIN-123456/owner-cleanup.pdf';
      const adminCleanup='premium_uploads/PIN-123456/admin-cleanup.pdf';
      for(const target of [existing,ownerCleanup,adminCleanup]){
        await bucket.file(target).save(Buffer.from(payload),{resumable:false,metadata:{contentType:metadata.contentType,metadata:metadata.customMetadata}});
      }
      for(const user of [owner,registered,publicClient]){
        await assert.rejects(getMetadata(ref(user.storage,existing)),/permission|unauthorized/i);
      }
      assert.equal((await getMetadata(ref(manager.storage,existing))).size,payload.length);
      await assert.rejects(deleteObject(ref(other.storage,existing)),/permission|unauthorized/i);
      await assert.rejects(deleteObject(ref(publicClient.storage,existing)),/permission|unauthorized/i);
      await assert.rejects(uploadBytes(ref(owner.storage,existing),new Uint8Array([1]),metadata),/permission|unauthorized/i);
      for(const user of [owner,manager]){
        await assert.rejects(updateMetadata(ref(user.storage,existing),{customMetadata:{ownerUid:other.auth.currentUser.uid}}),/permission|unauthorized/i);
      }
      assert.deepEqual((await bucket.file(existing).download())[0],Buffer.from(payload));
      assert.equal((await getMetadata(ref(manager.storage,existing))).customMetadata.ownerUid,owner.auth.currentUser.uid);
      await deleteObject(ref(owner.storage,ownerCleanup));
      await deleteObject(ref(manager.storage,adminCleanup));
      assert.equal((await bucket.file(ownerCleanup).exists())[0],false);
      assert.equal((await bucket.file(adminCleanup).exists())[0],false);
      assert.equal((await bucket.file(existing).exists())[0],true);

      const report='final_reports/PIN-123456_Prelaunch.pdf';
      await assert.rejects(uploadBytes(ref(owner.storage,report),payload,metadata),/permission|unauthorized/i);
      await uploadBytes(ref(manager.storage,report),payload,{contentType:'application/pdf'});
      assert.match(await getDownloadURL(ref(manager.storage,report)),/PIN-123456_Prelaunch/);
      for(const user of [owner,registered,publicClient]){
        await assert.rejects(getMetadata(ref(user.storage,report)),/permission|unauthorized/i);
        await assert.rejects(deleteObject(ref(user.storage,report)),/permission|unauthorized/i);
      }
      await assert.rejects(uploadBytes(ref(owner.storage,report),payload,metadata),/permission|unauthorized/i);
      await uploadBytes(ref(manager.storage,report),new Uint8Array([37,80,68,70]),{contentType:'application/pdf'});
      assert.equal((await getMetadata(ref(manager.storage,report))).size,4);
      await assert.rejects(uploadBytes(ref(manager.storage,'final_reports/invalid.html'),payload,{contentType:'text/html'}),/permission|unauthorized/i);
      await assert.rejects(uploadBytes(ref(manager.storage,'final_reports/empty.pdf'),new Uint8Array(),{contentType:'application/pdf'}),/permission|unauthorized/i);
      await deleteObject(ref(manager.storage,report));
      assert.equal((await bucket.file(report).exists())[0],false);
    });

    await t.test('live: original upload, ownership, limits, admin reports and database regression cases',async()=>{
    // Only this emulator's in-memory rules change; all original cases stay below.
    await loadStorageRules(liveRules);
    const path=`premium_uploads/PIN-123456/private-${Date.now()}.pdf`;
    await uploadBytes(ref(owner.storage,path),payload,metadata);
    await assert.rejects(getMetadata(ref(publicClient.storage,path)),/permission|unauthorized/i);
    await assert.rejects(getMetadata(ref(owner.storage,path)),/permission|unauthorized/i);
    await assert.rejects(deleteObject(ref(other.storage,path)),/permission|unauthorized/i);
    await assert.rejects(uploadBytes(ref(other.storage,path),payload,{contentType:'application/pdf',customMetadata:{ownerUid:other.auth.currentUser.uid}}),/permission|unauthorized/i);
    await assert.rejects(updateMetadata(ref(owner.storage,path),{customMetadata:{ownerUid:other.auth.currentUser.uid}}),/permission|unauthorized/i);
    assert.equal((await getMetadata(ref(manager.storage,path))).contentType,'application/pdf');
    await assert.rejects(uploadBytes(ref(publicClient.storage,'premium_uploads/PIN-123456/public.pdf'),payload,metadata),/permission|unauthorized/i);
    await assert.rejects(uploadBytes(ref(owner.storage,'premium_uploads/PIN-123456/bad.html'),payload,{...metadata,contentType:'text/html'}),/permission|unauthorized/i);
    await assert.rejects(uploadBytes(ref(owner.storage,'premium_uploads/PIN-123456/spoof.pdf'),payload,{...metadata,customMetadata:{ownerUid:'someone-else'}}),/permission|unauthorized/i);
    await assert.rejects(uploadBytes(ref(owner.storage,'other-path/file.pdf'),payload,metadata),/permission|unauthorized/i);
    await assert.rejects(uploadBytes(ref(owner.storage,'premium_uploads/PIN-123456/too-large.pdf'),new Uint8Array(50*1024*1024+1),metadata),/permission|unauthorized/i);
    await deleteObject(ref(owner.storage,path));
    const report='final_reports/PIN-123456_Report.pdf';
    await assert.rejects(uploadBytes(ref(owner.storage,report),payload,metadata),/permission|unauthorized/i);
    await uploadBytes(ref(manager.storage,report),payload,{contentType:'application/pdf'});
    assert.match(await getDownloadURL(ref(manager.storage,report)),/PIN-123456_Report/);
    await assert.rejects(getMetadata(ref(publicClient.storage,report)),/permission|unauthorized/i);

    // Run the actual upload service and HTTP handlers against emulator Auth/Storage/RTDB.
    // Only the HTTP transport is in-process; Stripe and SMTP must never be contacted here.
    const mails=[];
    const backend={exports:{},URL,console,process:{env:{PAID_SERVICE_MODE:'live',PUBLIC_SITE_URL:'https://example.com',EMAIL_USER:'admin@example.com',EMAIL_PASS:'emulator-only'}},require(name){
      if(name==='node:crypto')return require('node:crypto');
      if(name==='dotenv')return {config(){}};
      if(name==='firebase-functions/v2/https')return {onRequest:(_options,handler)=>handler};
      if(name==='cors')return ()=> (_req,_res,next)=>next();
      if(name==='firebase-admin')return {initializeApp(){},auth:()=>adminApp.auth(),storage:()=>adminApp.storage(),database:()=>adminApp.database()};
      throw Error(`Unexpected external integration: ${name}`);
    }};
    // SMTP is mocked; assert notifications only see already committed database state.
    const baseRequire=backend.require;
    backend.require=name=>name==='stripe'?{}:name==='nodemailer'?{createTransport:()=>({sendMail:async mail=>{
      const pin=mail.subject.match(/PIN-\d{6}/)[0];
      const committed=(await adminApp.database().ref(`premium_requests/${pin}`).once('value')).val();
      assert.equal(committed.status,'documents_received');assert.ok(committed.documentsReceivedEmail.claimId);
      assert.ok(committed.adminNewRequestNotification.claimId);mails.push(mail);return {accepted:[mail.to]};
    }})}:baseRequire(name);
    vm.runInNewContext(fs.readFileSync(require.resolve('./index.js'),'utf8'),backend);
    const uploadSource=fs.readFileSync(require.resolve('../src/services/stripe/premiumService.js'),'utf8')
      .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','ENV').replaceAll('export const ','const ');
    const clientContext={ENV:{VITE_SYMPLIROSI_AITISIS_URL:'symplirosiAitisis'},crypto:webcrypto,
      ...paidServiceConfig({VITE_PAID_SERVICE_MODE:'live'}),
      storage:owner.storage,storageRef:ref,uploadBytes,deleteObject,initAuth:async()=>owner.auth.currentUser,
      fetch:async(handler,options)=>new Promise((resolve,reject)=>{
        const res={statusCode:200,status(code){this.statusCode=code;return this;},json(data){resolve({ok:this.statusCode<400,status:this.statusCode,json:async()=>data});return this;}};
        Promise.resolve(backend.exports[handler]({method:'POST',body:JSON.parse(options.body),headers:{authorization:options.headers.Authorization}},res)).catch(reject);
      }),
    };
    vm.runInNewContext(uploadSource+'\nthis.upload=anevasmaAitisis; this.supplement=prosthikiSeAitisi;',clientContext);
    const document=Object.assign(new Uint8Array([37,80,68,70,45,49]),{name:'fixture.pdf',size:6,type:'application/pdf'});
    const created=await clientContext.upload({email:'fixture@example.com'},[document]);
    assert.equal(created.success,true,created.error);
    let stored=(await adminApp.database().ref(`premium_requests/${created.pin}`).once('value')).val();
    assert.equal(stored.files.length,1);assert.equal(stored.totalBytes,6);assert.equal(stored.status,'documents_received');
    assert.equal(mails.length,2);assert.ok(stored.documentsReceivedEmail.sentAt);assert.ok(stored.adminNewRequestNotification.sentAt);
    const token=await owner.auth.currentUser.getIdToken();
    const retries=await Promise.all(Array.from({length:3},()=>clientContext.fetch('symplirosiAitisis',{
      headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({energeia:'nea_aitisi',pin:created.pin,email:'fixture@example.com',arxeia:stored.files}),
    })));
    for(const retry of retries)assert.equal((await retry.json()).success,true);
    assert.equal(mails.length,2);
    const supplemented=await clientContext.supplement(created.pin,'fixture@example.com',[document]);
    assert.equal(supplemented.success,true,supplemented.error);
    stored=(await adminApp.database().ref(`premium_requests/${created.pin}`).once('value')).val();
    assert.equal(stored.files.length,2);assert.equal(stored.totalBytes,12);assert.equal(stored.paymentStatus,'not_requested');
    assert.equal(mails.length,2); // Supplementary documents do not send first-upload notifications.
    await adminApp.database().ref('premium_requests/PIN-123456').set({email:'fixture@example.com',status:'documents_received'});
    await assert.rejects(get(dbRef(publicClient.database,'premium_requests/PIN-123456')),/permission[ _]denied/i);
    await assert.rejects(get(dbRef(owner.database,'premium_requests/PIN-123456')),/permission[ _]denied/i);
    await assert.rejects(set(dbRef(owner.database,'premium_requests/PIN-123456/paymentStatus'),'paid'),/permission[ _]denied/i);
    assert.equal((await get(dbRef(manager.database,'premium_requests/PIN-123456'))).val().status,'documents_received');
    });
  }finally{
    try{
      await loadStorageRules(storageRules);
    }finally{
      await Promise.all(apps.map(app=>deleteApp(app)));
      await adminApp.delete();
    }
  }
});
