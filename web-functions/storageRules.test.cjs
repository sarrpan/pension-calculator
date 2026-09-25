const {test}=require('node:test');
const assert=require('node:assert/strict');
const {initializeApp,deleteApp}=require('firebase/app');
const {getAuth,connectAuthEmulator,signInAnonymously}=require('firebase/auth');
const {getStorage,connectStorageEmulator,ref,uploadBytes,getMetadata,deleteObject,updateMetadata,getDownloadURL}=require('firebase/storage');
const {getDatabase,connectDatabaseEmulator,ref:dbRef,get,set}=require('firebase/database');
const admin=require('firebase-admin');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const enabled=process.env.FIREBASE_AUTH_EMULATOR_HOST&&process.env.FIREBASE_STORAGE_EMULATOR_HOST&&process.env.FIREBASE_DATABASE_EMULATOR_HOST;
test('real emulators: anonymous private uploads, owner-only cleanup, admin reports and database restrictions',{skip:!enabled,timeout:90000},async()=>{
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
    if(login)await signInAnonymously(auth);
    return {auth,storage,database};
  }
  try{
    const owner=await client('owner'),other=await client('other'),publicClient=await client('public',false),manager=await client('manager');
    await adminApp.auth().setCustomUserClaims(manager.auth.currentUser.uid,{admin:true});
    await manager.auth.currentUser.getIdToken(true);
    const path=`premium_uploads/PIN-123456/private-${Date.now()}.pdf`;
    const metadata={contentType:'application/pdf',customMetadata:{ownerUid:owner.auth.currentUser.uid}};
    const payload=new Uint8Array([37,80,68,70,45,49]);
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
    const backend={exports:{},URL,console,process:{env:{PUBLIC_SITE_URL:'https://example.com'}},require(name){
      if(name==='dotenv')return {config(){}};
      if(name==='firebase-functions/v2/https')return {onRequest:(_options,handler)=>handler};
      if(name==='cors')return ()=> (_req,_res,next)=>next();
      if(name==='firebase-admin')return {initializeApp(){},auth:()=>adminApp.auth(),storage:()=>adminApp.storage(),database:()=>adminApp.database()};
      throw Error(`Unexpected external integration: ${name}`);
    }};
    // Constructors are imported by the module but should not be used by an upload.
    const baseRequire=backend.require;
    backend.require=name=>['stripe','nodemailer'].includes(name)?{}:baseRequire(name);
    vm.runInNewContext(fs.readFileSync(require.resolve('./index.js'),'utf8'),backend);
    const uploadSource=fs.readFileSync(require.resolve('../src/services/stripe/premiumService.js'),'utf8')
      .replace(/^import .*;\r?\n/gm,'').replaceAll('import.meta.env','ENV').replaceAll('export const ','const ');
    const clientContext={ENV:{VITE_SYMPLIROSI_AITISIS_URL:'symplirosiAitisis'},crypto:webcrypto,
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
    const supplemented=await clientContext.supplement(created.pin,'fixture@example.com',[document]);
    assert.equal(supplemented.success,true,supplemented.error);
    stored=(await adminApp.database().ref(`premium_requests/${created.pin}`).once('value')).val();
    assert.equal(stored.files.length,2);assert.equal(stored.totalBytes,12);assert.equal(stored.paymentStatus,'not_requested');
    await adminApp.database().ref('premium_requests/PIN-123456').set({email:'fixture@example.com',status:'documents_received'});
    await assert.rejects(get(dbRef(publicClient.database,'premium_requests/PIN-123456')),/permission[ _]denied/i);
    await assert.rejects(get(dbRef(owner.database,'premium_requests/PIN-123456')),/permission[ _]denied/i);
    await assert.rejects(set(dbRef(owner.database,'premium_requests/PIN-123456/paymentStatus'),'paid'),/permission[ _]denied/i);
    assert.equal((await get(dbRef(manager.database,'premium_requests/PIN-123456'))).val().status,'documents_received');
  }finally{
    await Promise.all(apps.map(app=>deleteApp(app)));
    await adminApp.delete();
  }
});
