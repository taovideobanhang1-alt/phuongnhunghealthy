/* script.js
   Admin for Phuong Nhung Healthy Food
   - Uses Cloudinary unsigned upload preset
   - LocalStorage fallback (default). Optional Firestore enabled if put firebase code in admin.html
*/

/* ========== CONFIG ========== */
// IMPORTANT: nếu cloud name/preset khác, sửa ở đây:
const CLOUD_NAME = 'duwdobplq';            // cloud name (from Cloudinary console)
const UPLOAD_PRESET = 'pn_unsigned';      // unsigned preset name (you saved)
const CLOUD_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/* ========== Data model (default 66 items) ========== */
/* Lão gia đã cung cấp danh sách 66 món — con import sẵn dưới đây */
const DEFAULT_DISHES = [
  // Nhóm Gà (10)
  { id:'d1', group:'Gà', name:'Ức gà luộc', img:'', selected:false },
  { id:'d2', group:'Gà', name:'Đùi gà xào sả ớt', img:'', selected:false },
  { id:'d3', group:'Gà', name:'Gà nướng (đùi + má đùi)', img:'', selected:false },
  { id:'d4', group:'Gà', name:'Gà luộc (đùi + má đùi)', img:'', selected:false },
  { id:'d5', group:'Gà', name:'Ức gà xào ớt xanh đỏ', img:'', selected:false },
  { id:'d6', group:'Gà', name:'Gà xào nấm', img:'', selected:false },
  { id:'d7', group:'Gà', name:'Gà khô gừng nghệ', img:'', selected:false },
  { id:'d8', group:'Gà', name:'Gà xào dứa', img:'', selected:false },
  { id:'d9', group:'Gà', name:'Ức gà quấn lá lốt', img:'', selected:false },
  { id:'d10', group:'Gà', name:'Mọc gà nấm hương', img:'', selected:false },

  // Bò (6)
  { id:'d11', group:'Bò', name:'Bò xào nấm đùi gà', img:'', selected:false },
  { id:'d12', group:'Bò', name:'Bò xào nấm hải sản', img:'', selected:false },
  { id:'d13', group:'Bò', name:'Bò xào hoa thiên lý', img:'', selected:false },
  { id:'d14', group:'Bò', name:'Bò xào giá', img:'', selected:false },
  { id:'d15', group:'Bò', name:'Bò kho hoa quả', img:'', selected:false },
  { id:'d16', group:'Bò', name:'Bò xào nấm hương tươi', img:'', selected:false },

  // Tôm (3)
  { id:'d17', group:'Tôm', name:'Tôm hấp', img:'', selected:false },
  { id:'d18', group:'Tôm', name:'Tôm rang ba chỉ', img:'', selected:false },
  { id:'d19', group:'Tôm', name:'Tôm rim', img:'', selected:false },

  // Cá (8)
  { id:'d20', group:'Cá', name:'Cá hấp', img:'', selected:false },
  { id:'d21', group:'Cá', name:'Cá chiên', img:'', selected:false },
  { id:'d22', group:'Cá', name:'Cá nướng', img:'', selected:false },
  { id:'d23', group:'Cá', name:'Cá sông chao giòn', img:'', selected:false },
  { id:'d24', group:'Cá', name:'Cá thu sốt cà chua', img:'', selected:false },
  { id:'d25', group:'Cá', name:'Cá thu om tiêu', img:'', selected:false },
  { id:'d26', group:'Cá', name:'Cá basa kho tiêu', img:'', selected:false },
  { id:'d27', group:'Cá', name:'Cá kho dưa', img:'', selected:false },

  // Thịt Lợn (7)
  { id:'d28', group:'Thịt Lợn', name:'Thịt băm rang', img:'', selected:false },
  { id:'d29', group:'Thịt Lợn', name:'Thịt ba chỉ rang tôm', img:'', selected:false },
  { id:'d30', group:'Thịt Lợn', name:'Thịt lợn kho dừa', img:'', selected:false },
  { id:'d31', group:'Thịt Lợn', name:'Thịt lợn om mắc mật', img:'', selected:false },
  { id:'d32', group:'Thịt Lợn', name:'Thịt lợn luộc', img:'', selected:false },
  { id:'d33', group:'Thịt Lợn', name:'Chả sen', img:'', selected:false },
  { id:'d34', group:'Thịt Lợn', name:'Chả lá lốt', img:'', selected:false },

  // Rau (16)
  { id:'d35', group:'Rau', name:'Súp lơ luộc', img:'', selected:false },
  { id:'d36', group:'Rau', name:'Bí xanh luộc', img:'', selected:false },
  { id:'d37', group:'Rau', name:'Đỗ cô ve luộc', img:'', selected:false },
  { id:'d38', group:'Rau', name:'Bắp cải luộc', img:'', selected:false },
  { id:'d39', group:'Rau', name:'Cà rốt luộc', img:'', selected:false },
  { id:'d40', group:'Rau', name:'Củ dền luộc', img:'', selected:false },
  { id:'d41', group:'Rau', name:'Xu hào luộc', img:'', selected:false },
  { id:'d42', group:'Rau', name:'Cải chíp luộc', img:'', selected:false },
  { id:'d43', group:'Rau', name:'Măng xào', img:'', selected:false },
  { id:'d44', group:'Rau', name:'Nấm đùi gà om', img:'', selected:false },
  { id:'d45', group:'Rau', name:'Nấm bao tử', img:'', selected:false },
  { id:'d46', group:'Rau', name:'Mướp đắng xào', img:'', selected:false },
  { id:'d47', group:'Rau', name:'Củ cải xào', img:'', selected:false },
  { id:'d48', group:'Rau', name:'Mướp đắng xào trứng', img:'', selected:false },
  { id:'d49', group:'Rau', name:'Mướp hương luộc', img:'', selected:false },
  { id:'d50', group:'Rau', name:'Mướp hương xào giá đỗ', img:'', selected:false },

  // Đậu (3)
  { id:'d51', group:'Đậu', name:'Đậu cà chua', img:'', selected:false },
  { id:'d52', group:'Đậu', name:'Đậu tẩm hành', img:'', selected:false },
  { id:'d53', group:'Đậu', name:'Đậu sống', img:'', selected:false },

  // Trứng (4)
  { id:'d54', group:'Trứng', name:'Trứng luộc', img:'', selected:false },
  { id:'d55', group:'Trứng', name:'Trứng rán cuốn rong biển', img:'', selected:false },
  { id:'d56', group:'Trứng', name:'Trứng rán hành', img:'', selected:false },
  { id:'d57', group:'Trứng', name:'Trứng rán', img:'', selected:false },

  // Cơm (3)
  { id:'d58', group:'Cơm', name:'Cơm trắng gạo Nhật', img:'', selected:false },
  { id:'d59', group:'Cơm', name:'Cơm lứt tổng hợp', img:'', selected:false },
  { id:'d60', group:'Cơm', name:'Cơm lứt + hạt dinh dưỡng', img:'', selected:false },

  // Món Chay (6)
  { id:'d61', group:'Món Chay', name:'Sườn non chay', img:'', selected:false },
  { id:'d62', group:'Món Chay', name:'Gà chay', img:'', selected:false },
  { id:'d63', group:'Món Chay', name:'Bò chay', img:'', selected:false },
  { id:'d64', group:'Món Chay', name:'Tảo xoắn', img:'', selected:false },
  { id:'d65', group:'Món Chay', name:'Lạc rang', img:'', selected:false },
  { id:'d66', group:'Món Chay', name:'Muối vừng', img:'', selected:false }
];

/* ========== Storage helpers ========== */
const STORAGE_KEY = 'pn_dishes_v1';
const MENU_KEY = 'pn_today_menu_v1';
const POSTS_KEY = 'pn_posts_v1';

/* Save/load - default to localStorage. If Firestore (window.__FIRESTORE) provided, you can extend to sync. */
function saveToLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function loadFromLocal(){
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
function saveToday(list){ localStorage.setItem(MENU_KEY, JSON.stringify(list)); }
function loadToday(){ const r=localStorage.getItem(MENU_KEY); return r?JSON.parse(r):[]; }
function savePosts(posts){ localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); }
function loadPosts(){ const r = localStorage.getItem(POSTS_KEY); return r?JSON.parse(r):[]; }

/* ========== UI rendering ========== */
const groupsContainer = document.getElementById('groupsContainer');
const todayListDiv = document.getElementById('todayList');
const saveMenuBtn = document.getElementById('saveMenu');
const clearSelectionBtn = document.getElementById('clearSelection');

let dishes = loadFromLocal() || DEFAULT_DISHES.slice();
let today = loadToday();
let posts = loadPosts();

function groupKeys(arr){
  const s = new Set(arr.map(d=>d.group));
  return Array.from(s);
}

/* Render groups accordion - each group lists text items (no image shown) but has button 'Ảnh' hover enabled to view */
function renderGroups(){
  groupsContainer.innerHTML = '';
  const groups = groupKeys(dishes);
  groups.forEach(g=>{
    const groupBox = document.createElement('div');
    groupBox.className = 'group-box';
    const header = document.createElement('div');
    header.className = 'group-row';
    header.innerHTML = `<div class="gname">${g} (<span class="small">${dishes.filter(d=>d.group===g).length}</span>)</div>
                        <div><button class="btn" data-group="${g}">+</button></div>`;
    groupsContainer.appendChild(header);

    // list items
    const list = document.createElement('div');
    list.style.marginTop='8px';
    list.style.marginBottom='12px';
    dishes.filter(d=>d.group===g).forEach(d=>{
      const item = document.createElement('div');
      item.className='dish-item';
      const left = document.createElement('div');
      left.className='dish-left';
      const img = document.createElement('img');
      img.src = d.img || placeholderFor(d.name);
      img.alt = d.name;
      img.loading = 'lazy';
      img.style.width='56px'; img.style.height='56px';
      const meta = document.createElement('div');
      meta.innerHTML = `<div class="dish-meta">${d.name}</div><div class="small">${d.group}</div>`;
      left.appendChild(img); left.appendChild(meta);

      const right = document.createElement('div');
      right.className='controls';
      const cb = document.createElement('input');
      cb.type='checkbox'; cb.checked = d.selected;
      cb.addEventListener('change', ()=>{ d.selected = cb.checked; updateTodayFromSelection(); saveToLocal(dishes); renderSelectedList(); renderGroups(); });
      const btnImg = document.createElement('button'); btnImg.className='btn'; btnImg.textContent='Ảnh';
      btnImg.addEventListener('click', ()=> openImageEditor(d.id));
      const btnDel = document.createElement('button'); btnDel.className='btn'; btnDel.textContent='Xóa';
      btnDel.addEventListener('click', ()=> { if(confirm('Xóa món này?')) { dishes = dishes.filter(x=>x.id!==d.id); saveToLocal(dishes); renderGroups(); renderSelectedList(); } });
      right.appendChild(cb); right.appendChild(btnImg); right.appendChild(btnDel);

      item.appendChild(left); item.appendChild(right);
      list.appendChild(item);
    });
    groupsContainer.appendChild(list);
  });
}

/* placeholder tiny base64 (light gray) so layout not empty */
function placeholderFor(name){
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='100%' height='100%' fill='#f0f5f0'/><text x='50%' y='50%' font-size='18' text-anchor='middle' fill='#9aa79a' font-family='Arial' dy='.35em'>${escapeHtml(name)}</text></svg>`);
}
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

/* Selected list render */
function renderSelectedList(){
  const sel = dishes.filter(d=>d.selected);
  const container = todayListDiv;
  container.innerHTML = '';
  const count = document.createElement('div'); count.className='select-count';
  if(sel.length===0){ count.textContent = '1. Chưa có món được chọn.'; container.appendChild(count); return; }
  const ol = document.createElement('ol');
  sel.forEach(s=>{ const li=document.createElement('li'); li.textContent = s.name; ol.appendChild(li); });
  container.appendChild(count);
  container.appendChild(ol);

  const btnWrap = document.createElement('div');
  btnWrap.style.marginTop='10px';
  const sbtn = document.createElement('button'); sbtn.className='btn green'; sbtn.textContent='💾 Lưu Menu Hôm Nay';
  sbtn.onclick = ()=> { saveToday(sel.map(x=>x.id)); alert('Đã lưu menu hôm nay.'); saveToday(sel.map(x=>x.id)); }
  const clear = document.createElement('button'); clear.className='btn red'; clear.textContent='Bỏ chọn tất cả';
  clear.onclick = ()=> { if(confirm('Bỏ chọn tất cả món?')){ dishes.forEach(d=>d.selected=false); saveToLocal(dishes); renderGroups(); renderSelectedList(); } };
  btnWrap.appendChild(sbtn); btnWrap.appendChild(clear);
  container.appendChild(btnWrap);
}

/* update today array when checkbox toggled */
function updateTodayFromSelection(){
  today = dishes.filter(d=>d.selected).map(d=>d.id);
}

/* ========== add new dish & upload ========== */
const fileInput = document.getElementById('fileInput');
const addDishBtn = document.getElementById('addDishBtn');
addDishBtn.addEventListener('click', async ()=>{
  const name = document.getElementById('newName').value.trim();
  const group = document.getElementById('newGroup').value;
  if(!name){ alert('Nhập tên món'); return; }
  const id = 'd' + Date.now();
  const file = fileInput.files && fileInput.files[0];
  let imgUrl = '';
  if(file){
    try{
      const res = await uploadToCloudinary(file);
      imgUrl = res.secure_url;
    }catch(err){
      console.error('Upload lỗi', err); alert('Upload ảnh lỗi, món vẫn được thêm nhưng không có ảnh.'); 
    }
  }
  dishes.push({id, group, name, img: imgUrl, selected:false});
  saveToLocal(dishes);
  document.getElementById('newName').value=''; fileInput.value='';
  renderGroups();
});

/* Cloudinary unsigned upload (file object) */
async function uploadToCloudinary(file){
  if(!UPLOAD_PRESET || !CLOUD_NAME) throw new Error('Cloudinary config thiếu');
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const r = await fetch(CLOUD_UPLOAD_URL, { method:'POST', body: fd });
  if(!r.ok) throw new Error('Cloudinary upload failed: ' + r.status);
  return r.json();
}

/* helper to upload remote URL (test console) */
async function uploadRemoteUrlToCloudinary(url){
  // helper for testing in console: passes remote url to cloudinary
  const fd = new FormData();
  fd.append('file', url);
  fd.append('upload_preset', UPLOAD_PRESET);
  const r = await fetch(CLOUD_UPLOAD_URL, { method:'POST', body: fd });
  return r.json();
}

/* open image editor dialog (quick prompt) */
function openImageEditor(dishId){
  const dish = dishes.find(x=>x.id===dishId);
  if(!dish) return;
  const choice = prompt(`Upload URL ảnh (1) hoặc nhập "file" để chọn file từ máy\nTên món: ${dish.name}\n\nNhập "file" để upload từ máy, hoặc dán 1 url ảnh:`);
  if(!choice) return;
  if(choice.toLowerCase()==='file'){
    // open hidden file input
    const f = document.createElement('input'); f.type='file'; f.accept='image/*';
    f.addEventListener('change', async ()=> {
      if(!f.files[0]) return;
      try{
        const res = await uploadToCloudinary(f.files[0]);
        dish.img = res.secure_url;
        saveToLocal(dishes);
        renderGroups();
        renderSelectedList();
        alert('Upload ảnh thành công');
      }catch(e){ console.error(e); alert('Upload lỗi'); }
    });
    f.click();
  } else {
    // assume URL
    dish.img = choice.trim();
    saveToLocal(dishes);
    renderGroups();
    renderSelectedList();
    alert('Đã cập nhật ảnh từ URL');
  }
}

/* ========== import default 66 ========== */
document.getElementById('import-default').addEventListener('click', ()=>{
  if(!confirm('Import 66 món mặc định vào danh sách (sẽ thêm nếu chưa có)?')) return;
  // merge but do not duplicate by name (keeps old ids)
  DEFAULT_DISHES.forEach(d=>{
    if(!dishes.some(x=>x.name===d.name && x.group===d.group)){
      dishes.push({...d});
    }
  });
  saveToLocal(dishes);
  renderGroups(); renderSelectedList();
  alert('Hoàn tất import. Nếu muốn thêm ảnh cho từng món, nhấn "Ảnh" hoặc sử dụng chức năng upload.');
});

/* reset -> default */
document.getElementById('resetDefault').addEventListener('click', ()=>{
  if(!confirm('Reset về danh sách 66 món mặc định (sẽ ghi đè dữ liệu hiện tại)?')) return;
  dishes = DEFAULT_DISHES.slice();
  saveToLocal(dishes);
  renderGroups(); renderSelectedList();
});

/* ========== Blog publish ========== */
document.getElementById('publishPost').addEventListener('click', async ()=>{
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const file = document.getElementById('postImage').files[0];
  if(!title || !content){ alert('Nhập tiêu đề và nội dung'); return; }
  let imgUrl = '';
  if(file){
    try{
      const res = await uploadToCloudinary(file);
      imgUrl = res.secure_url;
    }catch(e){
      console.error(e); alert('Upload ảnh bài viết lỗi'); 
    }
  }
  const post = { id:'p'+Date.now(), title, content, img: imgUrl, date: new Date().toISOString() };
  posts.unshift(post);
  savePosts(posts);
  document.getElementById('postTitle').value=''; document.getElementById('postContent').value=''; document.getElementById('postImage').value='';
  renderPosts();
  alert('Đã đăng bài (lưu local). Nếu muốn sync lên server/Firestore, bật cấu hình Firebase trong admin.html');
});
function renderPosts(){
  const el = document.getElementById('recentPosts');
  if(posts.length===0){ el.textContent='Chưa có bài viết.'; return; }
  el.innerHTML = posts.slice(0,5).map(p=>`<div style="margin-bottom:8px"><strong>${p.title}</strong><div class="small">${(new Date(p.date)).toLocaleString()}</div></div>`).join('');
}

/* ========== selection helpers ========== */
function renderSelectedFromTodaySaved(){
  const saved = loadToday();
  dishes.forEach(d=> d.selected = saved.includes(d.id));
}

/* ========== init ========== */
function init(){
  renderSelectedFromTodaySaved();
  renderGroups();
  renderSelectedList();
  renderPosts();
}
init();

/* ========== OPTIONAL: expose helper for console testing ========== */
window._pn = {
  dishes,
  saveToLocal,
  uploadRemoteUrlToCloudinary,
  CLOUD_UPLOAD_URL,
  CLOUD_NAME,
  UPLOAD_PRESET
};
