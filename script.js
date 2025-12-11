// script.js (admin + site logic, with Import 66 món integration)

/* placeholders */
const PLACEHOLDER_FOOD = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23f2f6f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%238b9f8b" font-size="20">Ảnh món đang cập nhật</text></svg>';
const PLACEHOLDER_POST = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23f7f7f7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999999" font-size="20">Ảnh bài viết</text></svg>';

let ALL_DISHES = [];
let TODAY_ITEMS = [];
let ALL_POSTS = [];

let unsubDishes = null, unsubToday = null, unsubPosts = null;

function uid(prefix='id'){ return prefix + Math.random().toString(36).slice(2,9); }

/* ---------------- Menu Page ---------------- */
function initMenuPage(){
  const root = document.getElementById('menu-list');
  const clockEl = document.getElementById('menu-clock');
  const qr = document.getElementById('menu-qr');
  const preview = document.getElementById('hover-preview');
  const previewImg = preview ? preview.querySelector('img') : null;

  function renderList(){
    root.innerHTML = '';
    if(!TODAY_ITEMS || TODAY_ITEMS.length===0){
      root.innerHTML = '<p class="text-muted">Chưa có thực đơn hôm nay.</p>';
    } else {
      const ul = document.createElement('ul'); ul.className='menu-text-list';
      TODAY_ITEMS.forEach((d,i)=>{
        const li = document.createElement('li');
        const idx = document.createElement('div'); idx.className='idx'; idx.textContent=(i+1);
        const name = document.createElement('div'); name.className='name'; name.textContent = d.name;
        li.appendChild(idx); li.appendChild(name);

        li.addEventListener('mouseenter', (ev)=>{
          if(!d.img){ preview.style.opacity = 0; return; }
          previewImg.src = d.img;
          preview.style.opacity = 1; preview.style.transform = 'translateY(0) scale(1)';
          const x = Math.min(window.innerWidth - 320, ev.clientX + 18);
          const y = Math.min(window.innerHeight - 220, ev.clientY + 12);
          preview.style.left = x + 'px'; preview.style.top = y + 'px';
        });
        li.addEventListener('mousemove', (ev)=>{
          if(!d.img) return;
          const x = Math.min(window.innerWidth - 320, ev.clientX + 18);
          const y = Math.min(window.innerHeight - 220, ev.clientY + 12);
          preview.style.left = x + 'px'; preview.style.top = y + 'px';
        });
        li.addEventListener('mouseleave', ()=>{ preview.style.opacity = 0; });

        li.addEventListener('click', ()=>{
          if(!d.img) return;
          const w = window.open('','_blank'); w.document.write(`<img src="${d.img}" style="max-width:100%;height:auto">`);
        });

        ul.appendChild(li);
      });
      root.appendChild(ul);
    }
    if(qr) qr.src = 'https://quickchart.io/chart?cht=qr&chs=160x160&chl=' + encodeURIComponent(location.href);
    if(clockEl) clockEl.textContent = 'Thực đơn hôm nay — ' + new Date().toLocaleString();
  }

  if(!unsubToday) unsubToday = subscribeToToday((items)=>{ TODAY_ITEMS = items; renderList(); });
  if(!unsubDishes) unsubDishes = subscribeToDishes((arr)=>{ ALL_DISHES = arr; });

  renderList();
  setInterval(()=>{ if(clockEl) clockEl.textContent = 'Thực đơn hôm nay — ' + new Date().toLocaleString(); },1000);
}

/* ---------------- Blog Page ---------------- */
function initBlogPage(){
  const root = document.getElementById('blog-list');
  function render(){
    root.innerHTML = '';
    if(!ALL_POSTS || ALL_POSTS.length===0){ root.innerHTML = '<p class="text-muted">Chưa có bài viết.</p>'; return; }
    ALL_POSTS.forEach(p=>{
      const box = document.createElement('div'); box.className='post';
      const img = document.createElement('img'); img.loading='lazy'; img.alt = p.title; img.src = p.img || PLACEHOLDER_POST;
      const content = document.createElement('div');
      const h = document.createElement('h3'); h.textContent = p.title;
      const time = document.createElement('div'); time.className='text-muted'; time.textContent = new Date(p.date).toLocaleString();
      const para = document.createElement('p'); para.textContent = p.content;
      content.appendChild(h); content.appendChild(time); content.appendChild(para);
      box.appendChild(img); box.appendChild(content);
      root.appendChild(box);
    });
  }

  if(!unsubPosts) unsubPosts = subscribeToPosts((posts)=>{ ALL_POSTS = posts; render(); });
  render();
}

/* ---------------- Contact Page ---------------- */
function initContactPage(){
  const btn = document.getElementById('btn-directions');
  const dest = encodeURIComponent('17 Phố Muối, Phường Tam Thanh, TP. Lạng Sơn');
  if(btn){
    btn.addEventListener('click', ()=>{
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${dest}`;
          window.open(url,'_blank');
        }, ()=>{
          const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
          window.open(url,'_blank');
        }, {timeout:10000});
      } else {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
        window.open(url,'_blank');
      }
    });
  }
}

/* ---------------- Admin Page ---------------- */
async function initAdminPage(){
  const dishContainer = document.getElementById('dish-list');
  const todayListEl = document.getElementById('today-dishes');
  const addForm = document.getElementById('add-dish-form');
  const saveMenuBtn = document.getElementById('save-menu');
  const resetBtn = document.getElementById('reset-selection');
  const searchInput = document.getElementById('search-dish');

  if(!unsubDishes) unsubDishes = subscribeToDishes((arr)=>{ ALL_DISHES = arr; renderGroups(searchInput ? searchInput.value : ''); renderToday(); });
  if(!unsubToday) unsubToday = subscribeToToday((items)=>{ TODAY_ITEMS = items; renderToday(); });
  if(!unsubPosts) unsubPosts = subscribeToPosts((posts)=>{ ALL_POSTS = posts; renderAdminPosts(); });

  const GROUPS = ['Gà','Bò','Cá','Lợn','Rau','Đậu','Trứng','Cơm','Chay','Khác'];

  function renderGroups(filter=''){
    dishContainer.innerHTML = '';
    GROUPS.forEach(g=>{
      const items = ALL_DISHES.filter(d => d.group===g && d.name.toLowerCase().includes(filter.toLowerCase()));
      if(items.length===0) return;
      const wrap = document.createElement('div'); wrap.className='accordion card';
      const head = document.createElement('div'); head.className='group-header'; head.textContent = g + ' ('+items.length+')';
      const arrow = document.createElement('div'); arrow.textContent = '+';
      head.appendChild(arrow);
      const list = document.createElement('div'); list.className='group-list';
      items.forEach(d=>{
        const row = document.createElement('div'); row.className='dish-row';
        const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !!d.selected;
        cb.addEventListener('change', async ()=>{ await updateDishRemote(d.id, { selected: cb.checked }); });
        const name = document.createElement('div'); name.textContent = d.name; name.style.flex='1';
        const btnImg = document.createElement('button'); btnImg.textContent='Ảnh'; btnImg.className='small-btn';
        const fileInput = document.createElement('input'); fileInput.type='file'; fileInput.accept='image/*'; fileInput.style.display='none';
        fileInput.addEventListener('change', async ()=>{ const f = fileInput.files[0]; if(!f) return; const url = await uploadImageFile(f, 'dishes'); await updateDishRemote(d.id, { img: url }); });
        btnImg.addEventListener('click', ()=> fileInput.click());
        const btnDel = document.createElement('button'); btnDel.textContent='Xóa'; btnDel.className='small-btn';
        btnDel.addEventListener('click', async ()=>{ if(!confirm('Xóa món "'+d.name+'" ?')) return; await deleteDishRemote(d.id); });
        row.appendChild(cb); row.appendChild(name); row.appendChild(btnImg); row.appendChild(fileInput); row.appendChild(btnDel);
        list.appendChild(row);
      });
      head.addEventListener('click', ()=>{ list.classList.toggle('active'); arrow.textContent = list.classList.contains('active') ? '−' : '+'; });
      wrap.appendChild(head); wrap.appendChild(list);
      dishContainer.appendChild(wrap);
    });
  }

  function renderToday(){
    todayListEl.innerHTML = '';
    if(!TODAY_ITEMS || TODAY_ITEMS.length===0){ todayListEl.innerHTML = '<li class="text-muted">Chưa có món được chọn.</li>'; return; }
    TODAY_ITEMS.forEach((d,i)=>{
      const li = document.createElement('li');
      li.textContent = (i+1) + '. ' + d.name;
      const rem = document.createElement('button'); rem.textContent='Bỏ'; rem.className='small-btn'; rem.style.marginLeft='8px';
      rem.addEventListener('click', async ()=> { await updateDishRemote(d.id, { selected: false }); });
      li.appendChild(rem);
      todayListEl.appendChild(li);
    });
  }

  addForm.addEventListener('submit', async (e)=>{ 
    e.preventDefault(); 
    const name = document.getElementById('dish-name').value.trim(); 
    const group = document.getElementById('dish-group').value; 
    const file = document.getElementById('dish-img').files[0]; 
    if(!name){ alert('Nhập tên món'); return; } 
    let imgUrl = ''; 
    if(file) imgUrl = await uploadImageFile(file, 'dishes'); 
    await addDishRemote({ name, group, img: imgUrl, selected: false }); 
    addForm.reset(); 
    alert('Đã thêm món'); 
  });

  saveMenuBtn.addEventListener('click', async ()=>{ 
    const items = ALL_DISHES.filter(d=>d.selected).map(d=>({ id:d.id, name:d.name, group:d.group, img:d.img || '' })); 
    await saveTodayMenuRemote(items); 
    alert('Đã lưu thực đơn hôm nay!'); 
  });

  resetBtn.addEventListener('click', async ()=>{ 
    if(!confirm('Bỏ chọn tất cả?')) return; 
    const updates = ALL_DISHES.map(d => updateDishRemote(d.id, { selected: false }).catch(()=>{})); 
    await Promise.all(updates); 
    alert('Đã bỏ chọn tất cả.'); 
  });

  searchInput.addEventListener('input', (e)=> renderGroups(e.target.value));

  /* Admin posts */
  const addPostForm = document.getElementById('add-post-form');
  const adminPostList = document.getElementById('admin-posts');

  function renderAdminPosts(){
    adminPostList.innerHTML = '';
    if(!ALL_POSTS || ALL_POSTS.length===0){ adminPostList.innerHTML = '<div class="text-muted">Chưa có bài viết.</div>'; return; }
    ALL_POSTS.forEach(p=>{
      const div = document.createElement('div'); div.className='card'; div.style.padding='10px'; div.style.marginBottom='8px';
      const h = document.createElement('h4'); h.textContent = p.title;
      const time = document.createElement('div'); time.className='text-muted'; time.textContent = new Date(p.date).toLocaleString();
      const para = document.createElement('p'); para.textContent = p.content;
      const del = document.createElement('button'); del.textContent='Xóa'; del.className='small-btn';
      del.addEventListener('click', async ()=>{ if(confirm('Xóa bài viết này?')) await deletePostRemote(p.id); });
      div.appendChild(h); div.appendChild(time);
      if(p.img){ const im = document.createElement('img'); im.src = p.img; im.style.width='100%'; im.style.maxHeight='160px'; im.style.objectFit='cover'; im.style.borderRadius='8px'; div.appendChild(im); }
      div.appendChild(para); div.appendChild(del);
      adminPostList.appendChild(div);
    });
  }

  addPostForm.addEventListener('submit', async (e)=>{ 
    e.preventDefault(); 
    const title = document.getElementById('post-title').value.trim(); 
    const content = document.getElementById('post-content').value.trim(); 
    const file = document.getElementById('post-img').files[0]; 
    if(!title || !content){ alert('Nhập đầy đủ tiêu đề và nội dung'); return; } 
    let imgUrl = ''; 
    if(file) imgUrl = await uploadImageFile(file, 'posts'); 
    await addPostRemote({ title, content, img: imgUrl, date: new Date().toISOString() }); 
    addPostForm.reset(); 
    alert('Đã đăng bài!'); 
  });

  renderGroups('');
  renderToday();
  renderAdminPosts();
}

/* ---------------- Import 66 món default ---------------- */
function setupImportButton(){
  const btn = document.getElementById('import-defaults');
  const status = document.getElementById('import-status');
  if(!btn) return;

  const DEFAULT_ITEMS = [
    // Nhóm Gà (10)
    {name:'Ức gà luộc', group:'Gà'},
    {name:'Đùi gà xào sả ớt', group:'Gà'},
    {name:'Gà nướng (đùi + má đùi)', group:'Gà'},
    {name:'Gà luộc (đùi + má đùi)', group:'Gà'},
    {name:'Ức gà xào ớt xanh đỏ', group:'Gà'},
    {name:'Gà xào nấm', group:'Gà'},
    {name:'Gà khô gừng nghệ', group:'Gà'},
    {name:'Gà xào dứa', group:'Gà'},
    {name:'Ức gà quấn lá lốt', group:'Gà'},
    {name:'Mọc gà nấm hương', group:'Gà'},
    // Nhóm Bò (6)
    {name:'Bò xào nấm đùi gà', group:'Bò'},
    {name:'Bò xào nấm hải sản', group:'Bò'},
    {name:'Bò xào hoa thiên lý', group:'Bò'},
    {name:'Bò xào giá', group:'Bò'},
    {name:'Bò kho hoa quả', group:'Bò'},
    {name:'Bò xào nấm hương tươi', group:'Bò'},
    // Nhóm Tôm (3)
    {name:'Tôm hấp', group:'Tôm'},
    {name:'Tôm rang ba chỉ', group:'Tôm'},
    {name:'Tôm rim', group:'Tôm'},
    // Nhóm Cá (8)
    {name:'Cá hấp', group:'Cá'},
    {name:'Cá chiên', group:'Cá'},
    {name:'Cá nướng', group:'Cá'},
    {name:'Cá sông chao giòn', group:'Cá'},
    {name:'Cá thu sốt cà chua', group:'Cá'},
    {name:'Cá thu om tiêu', group:'Cá'},
    {name:'Cá basa kho tiêu', group:'Cá'},
    {name:'Cá kho dưa', group:'Cá'},
    // Nhóm Thịt Lợn (7)
    {name:'Thịt băm rang', group:'Lợn'},
    {name:'Thịt ba chỉ rang tôm', group:'Lợn'},
    {name:'Thịt lợn kho dừa', group:'Lợn'},
    {name:'Thịt lợn om mắc mật', group:'Lợn'},
    {name:'Thịt lợn luộc', group:'Lợn'},
    {name:'Chả sen', group:'Lợn'},
    {name:'Chả lá lốt', group:'Lợn'},
    // Nhóm Rau (16)
    {name:'Súp lơ luộc', group:'Rau'},
    {name:'Bí xanh luộc', group:'Rau'},
    {name:'Đỗ cô ve luộc', group:'Rau'},
    {name:'Bắp cải luộc', group:'Rau'},
    {name:'Cà rốt luộc', group:'Rau'},
    {name:'Củ dền luộc', group:'Rau'},
    {name:'Xu hào luộc', group:'Rau'},
    {name:'Cải chíp luộc', group:'Rau'},
    {name:'Măng xào', group:'Rau'},
    {name:'Nấm đùi gà om', group:'Rau'},
    {name:'Nấm bao tử', group:'Rau'},
    {name:'Mướp đắng xào', group:'Rau'},
    {name:'Củ cải xào', group:'Rau'},
    {name:'Mướp đắng xào trứng', group:'Rau'},
    {name:'Mướp hương luộc', group:'Rau'},
    {name:'Mướp hương xào giá đỗ', group:'Rau'},
    // Nhóm Đậu (3)
    {name:'Đậu cà chua', group:'Đậu'},
    {name:'Đậu tẩm hành', group:'Đậu'},
    {name:'Đậu sống', group:'Đậu'},
    // Nhóm Trứng (4)
    {name:'Trứng luộc', group:'Trứng'},
    {name:'Trứng rán cuốn rong biển', group:'Trứng'},
    {name:'Trứng rán hành', group:'Trứng'},
    {name:'Trứng rán', group:'Trứng'},
    // Nhóm Cơm (3)
    {name:'Cơm trắng gạo Nhật', group:'Cơm'},
    {name:'Cơm lứt tổng hợp', group:'Cơm'},
    {name:'Cơm lứt + hạt dinh dưỡng', group:'Cơm'},
    // Nhóm Món Chay (6)
    {name:'Sườn non chay', group:'Chay'},
    {name:'Gà chay', group:'Chay'},
    {name:'Bò chay', group:'Chay'},
    {name:'Tảo xoắn', group:'Chay'},
    {name:'Lạc rang', group:'Chay'},
    {name:'Muối vừng', group:'Chay'}
  ];

  btn.addEventListener('click', async ()=>{
    if(!confirm('Xác nhận import 66 món mặc định vào Firestore? (sẽ không trùng lặp nếu đã có tên giống)')) return;
    btn.disabled = true;
    status.textContent = 'Đang import...';
    let added = 0, skipped = 0;
    for(let i=0;i<DEFAULT_ITEMS.length;i++){
      const it = DEFAULT_ITEMS[i];
      try{
        // check existing by exact name
        const q = await FB.db.collection('dishes').where('name','==', it.name).get();
        if(!q.empty){ skipped++; continue; }
        await addDishRemote({ name: it.name, group: it.group, img: '', selected: false });
        added++;
        status.textContent = `Đã import ${added} / ${DEFAULT_ITEMS.length} ...`;
        await new Promise(r=>setTimeout(r,120)); // small throttle so UI updates
      }catch(err){
        console.error('Import error for', it.name, err);
      }
    }
    status.textContent = `Hoàn tất — Thêm ${added}, Bỏ qua ${skipped}.`;
    btn.disabled = false;
    // After import, UI should update via realtime subscriptions
    setTimeout(()=>{ if(window.initAdminPage) initAdminPage(); }, 500);
  });
}

/* -------------------- global init based on DOM -------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('menu-list')) initMenuPage();
  if(document.getElementById('blog-list')) initBlogPage();
  if(document.getElementById('contact-map')) initContactPage();
  // initAdminPage called after password prompt in admin.html
});
