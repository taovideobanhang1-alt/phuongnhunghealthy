// firebase-api.js
const COL_DISHES = 'dishes';
const COL_TODAY = 'todayMenu';
const COL_POSTS = 'posts';

async function uploadImageFile(file, pathPrefix='images') {
  if(!file) return '';
  const id = Date.now() + '-' + Math.random().toString(36).slice(2,8);
  const filename = `${id}_${file.name.replace(/\s+/g,'_')}`;
  const ref = FB.storage.ref().child(`${pathPrefix}/${filename}`);
  await ref.put(file);
  const url = await ref.getDownloadURL();
  return url;
}

function subscribeToDishes(onChange) {
  return FB.db.collection(COL_DISHES).orderBy('group').onSnapshot(snap=>{
    const arr = [];
    snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
    onChange(arr);
  }, (err)=>{ console.error('subscribeToDishes error',err); });
}
async function addDishRemote(dish){ const res = await FB.db.collection(COL_DISHES).add(dish); return res.id; }
async function updateDishRemote(id, data){ await FB.db.collection(COL_DISHES).doc(id).update(data); }
async function deleteDishRemote(id){ await FB.db.collection(COL_DISHES).doc(id).delete(); }

function subscribeToToday(onChange){
  const docRef = FB.db.collection(COL_TODAY).doc('current');
  return docRef.onSnapshot(doc => { onChange(doc.exists ? doc.data().items || [] : []); }, err=>{console.error('subscribeToToday',err);});
}
async function saveTodayMenuRemote(items){
  const docRef = FB.db.collection(COL_TODAY).doc('current');
  await docRef.set({ items, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
}

function subscribeToPosts(onChange){
  return FB.db.collection(COL_POSTS).orderBy('date','desc').onSnapshot(snap=>{
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    onChange(arr);
  }, err => { console.error('subscribeToPosts', err); });
}
async function addPostRemote(post){ await FB.db.collection(COL_POSTS).add(post); }
async function deletePostRemote(id){ await FB.db.collection(COL_POSTS).doc(id).delete(); }
