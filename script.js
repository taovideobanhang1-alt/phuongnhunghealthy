
// script.js - Firebase realtime + local fallback + blog + admin functions

// --- Firebase config (from Lão Gia) ---
const firebaseConfig = {
  apiKey: "AIzaSyA6bPO-ozAderQl_WyRDvr1FFtFmOV2whE",
  authDomain: "phuongnhung-healthy-dd33d.firebaseapp.com",
  databaseURL: "https://phuongnhung-healthy-dd33d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phuongnhung-healthy-dd33d",
  storageBucket: "phuongnhung-healthy-dd33d.firebasestorage.app",
  messagingSenderId: "311113370048",
  appId: "1:311113370048:web:3fe2160cf5db11f7e66025",
  measurementId: "G-WKZ591J0BS"
};

// init firebase (uses firebase-app.js + firebase-database.js loaded in pages that need it)
let firebaseAvailable = false;
try {
  if (window.firebase && firebaseConfig) {
    firebase.initializeApp(firebaseConfig);
    firebaseAvailable = true;
  }
} catch(e) {
  console.warn('Firebase init failed:', e);
  firebaseAvailable = false;
}

// Local fallback storage keys
const LS_DISHES = 'dnh_dishes_v1';
const LS_TODAY = 'dnh_today_v1';
const LS_POSTS = 'dnh_posts_v1';

// In-memory
let dishes = JSON.parse(localStorage.getItem(LS_DISHES)) || [];
let todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || [];
let posts = JSON.parse(localStorage.getItem(LS_POSTS)) || [];

// sanitize
function sanitizeInput(input='') {
  return String(input).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,'').replace(/[<>]/g,'');
}

// normalize group names per Lão Gia's request
function normalizeGroupName(g) {
  if (!g) return g;
  if (g === 'Thịt Lợn') return 'Lợn';
  if (g === 'Món Chay') return 'Chay';
  return g;
}

// --- Initialize default dishes if empty ---
function initializeDishes() {
  if (!dishes || dishes.length < 60) {
    const defaultDishes = [
        { name: 'Ức gà luộc', img: '', group: 'Gà', selected: false },
        { name: 'Đùi gà xào sả ớt', img: '', group: 'Gà', selected: false },
        { name: 'Gà nướng (đùi + má đùi)', img: '', group: 'Gà', selected: false },
        { name: 'Gà luộc (đùi + má đùi)', img: '', group: 'Gà', selected: false },
        { name: 'Ức gà xào ớt xanh đỏ', img: '', group: 'Gà', selected: false },
        { name: 'Gà xào nấm', img: '', group: 'Gà', selected: false },
        { name: 'Gà khô gừng nghệ', img: '', group: 'Gà', selected: false },
        { name: 'Gà xào dứa', img: '', group: 'Gà', selected: false },
        { name: 'Ức gà quấn lá lốt', img: '', group: 'Gà', selected: false },
        { name: 'Mọc gà nấm hương', img: '', group: 'Gà', selected: false },
        { name: 'Bò xào nấm đùi gà', img: '', group: 'Bò', selected: false },
        { name: 'Bò xào nấm hải sản', img: '', group: 'Bò', selected: false },
        { name: 'Bò xào hoa thiên lý', img: '', group: 'Bò', selected: false },
        { name: 'Bò xào giá', img: '', group: 'Bò', selected: false },
        { name: 'Bò kho hoa quả', img: '', group: 'Bò', selected: false },
        { name: 'Bò xào nấm hương tươi', img: '', group: 'Bò', selected: false },
        { name: 'Tôm hấp', img: '', group: 'Tôm', selected: false },
        { name: 'Tôm rang ba chỉ', img: '', group: 'Tôm', selected: false },
        { name: 'Tôm rim', img: '', group: 'Tôm', selected: false },
        { name: 'Cá hấp', img: '', group: 'Cá', selected: false },
        { name: 'Cá chiên', img: '', group: 'Cá', selected: false },
        { name: 'Cá nướng', img: '', group: 'Cá', selected: false },
        { name: 'Cá sông chao giòn', img: '', group: 'Cá', selected: false },
        { name: 'Cá thu sốt cà chua', img: '', group: 'Cá', selected: false },
        { name: 'Cá thu om tiêu', img: '', group: 'Cá', selected: false },
        { name: 'Cá basa kho tiêu', img: '', group: 'Cá', selected: false },
        { name: 'Cá kho dưa', img: '', group: 'Cá', selected: false },
        { name: 'Thịt băm rang', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Thịt ba chỉ rang tôm', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Thịt lợn kho dừa', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Thịt lợn om mắc mật', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Thịt lợn luộc', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Chả sen', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Chả lá lốt', img: '', group: 'Thịt Lợn', selected: false },
        { name: 'Súp lơ luộc', img: '', group: 'Rau', selected: false },
        { name: 'Bí xanh luộc', img: '', group: 'Rau', selected: false },
        { name: 'Đỗ cô ve luộc', img: '', group: 'Rau', selected: false },
        { name: 'Bắp cải luộc', img: '', group: 'Rau', selected: false },
        { name: 'Cà rốt luộc', img: '', group: 'Rau', selected: false },
        { name: 'Củ dền luộc', img: '', group: 'Rau', selected: false },
        { name: 'Xu hào luộc', img: '', group: 'Rau', selected: false },
        { name: 'Cải chíp luộc', img: '', group: 'Rau', selected: false },
        { name: 'Măng xào', img: '', group: 'Rau', selected: false },
        { name: 'Nấm đùi gà om', img: '', group: 'Rau', selected: false },
        { name: 'Nấm bao tử', img: '', group: 'Rau', selected: false },
        { name: 'Mướp đắng xào', img: '', group: 'Rau', selected: false },
        { name: 'Củ cải xào', img: '', group: 'Rau', selected: false },
        { name: 'Mướp đắng xào trứng', img: '', group: 'Rau', selected: false },
        { name: 'Mướp hương luộc', img: '', group: 'Rau', selected: false },
        { name: 'Mướp hương xào giá đỗ', img: '', group: 'Rau', selected: false },
        { name: 'Đậu cà chua', img: '', group: 'Đậu', selected: false },
        { name: 'Đậu tẩm hành', img: '', group: 'Đậu', selected: false },
        { name: 'Đậu sống', img: '', group: 'Đậu', selected: false },
        { name: 'Trứng luộc', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng rán cuốn rong biển', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng rán hành', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng rán', img: '', group: 'Trứng', selected: false },
        { name: 'Cơm trắng gạo Nhật', img: '', group: 'Cơm', selected: false },
        { name: 'Cơm lứt tổng hợp', img: '', group: 'Cơm', selected: false },
        { name: 'Cơm lứt + hạt dinh dưỡng', img: '', group: 'Cơm', selected: false },
        { name: 'Sườn non chay', img: '', group: 'Món Chay', selected: false },
        { name: 'Gà chay', img: '', group: 'Món Chay', selected: false },
        { name: 'Bò chay', img: '', group: 'Món Chay', selected: false },
        { name: 'Tảo xoắn', img: '', group: 'Món Chay', selected: false },
        { name: 'Lạc rang', img: '', group: 'Món Chay', selected: false },
        { name: 'Muối vừng', img: '', group: 'Món Chay', selected: false },
        { name: 'Món khác mẫu', img: '', group: 'Khác', selected: false }
    ];
    dishes = defaultDishes.map(function(d){ return { name: d.name, img: d.img, group: normalizeGroupName(d.group), selected: d.selected }; });
    localStorage.setItem(LS_DISHES, JSON.stringify(dishes));
  }
}

// --- Helpers to persist local fallback
function saveLocalDishes() { localStorage.setItem(LS_DISHES, JSON.stringify(dishes)); }
function saveLocalToday() { localStorage.setItem(LS_TODAY, JSON.stringify(todayDishes)); }
function saveLocalPosts() { localStorage.setItem(LS_POSTS, JSON.stringify(posts)); }

// --- Firebase helpers ---
function writeDishesToFirebase() {
  if (!firebaseAvailable) return;
  try {
    firebase.database().ref('/dishes').set(dishes);
  } catch(e) { console.warn('writeDishesToFirebase', e); }
}
function writeTodayToFirebase() {
  if (!firebaseAvailable) return;
  try {
    firebase.database().ref('/todayDishes').set(todayDishes);
  } catch(e) { console.warn('writeTodayToFirebase', e); }
}

// --- Read realtime listeners (menu page will call attachMenuRealtime) ---
function attachMenuRealtime() {
  if (!firebaseAvailable) {
    console.warn('Firebase not available');
    // fallback to local storage rendering
    loadTodayMenu();
    return;
  }
  // listen dishes and todayDishes
  firebase.database().ref('/dishes').on('value', function(snapshot) {
    var val = snapshot.val();
    if (val) {
      dishes = val;
      saveLocalDishes();
    }
  });
  firebase.database().ref('/todayDishes').on('value', function(snapshot) {
    var val = snapshot.val();
    if (val) {
      todayDishes = val;
      saveLocalToday();
      // if on menu page, render
      if (typeof renderTodayIntoMenu === 'function') renderTodayIntoMenu();
      else if (typeof loadTodayMenu === 'function') loadTodayMenu();
    }
  });
}

// --- Rendering for menu (menu.html) ---
function renderTodayIntoMenu() {
  var menuList = document.getElementById('menu-list');
  if (!menuList) return;
  menuList.innerHTML = '<h2>Menu Healthy Hôm Nay</h2><p>Giá theo thị trường và khẩu phần bạn chọn</p>';
  var ul = document.createElement('ul');
  var grouped = (todayDishes || []).reduce(function(acc, dish) {
    var grp = normalizeGroupName(dish.group || dish.group);
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(dish);
    return acc;
  }, {});
  Object.keys(grouped).sort(function(a,b){ return a.localeCompare(b,'vi'); }).forEach(function(group) {
    var h4 = document.createElement('h4'); h4.textContent = group; ul.appendChild(h4);
    grouped[group].forEach(function(dish, index) {
      var li = document.createElement('li');
      li.innerHTML = (index + 1) + '. ' + sanitizeInput(dish.name);
      if (dish.img) {
        var img = document.createElement('img');
        img.src = dish.img;
        img.alt = sanitizeInput(dish.name);
        img.className = 'dish-image';
        li.appendChild(img);
      }
      ul.appendChild(li);
    });
  });
  menuList.appendChild(ul);
}

// Legacy local load (fallback)
function loadTodayMenu() {
  todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || todayDishes || [];
  renderTodayIntoMenu();
}

// --- Admin rendering and interaction ---
function renderDishesAdmin(searchQuery) {
  if (!searchQuery) searchQuery = '';
  var listEl = document.getElementById('dish-list');
  var todayEl = document.getElementById('today-dishes');
  if (!listEl || !todayEl) return;
  // collect open groups
  var open = [];
  document.querySelectorAll('.accordion-content.active').forEach(function(c){ var h = c.previousElementSibling; if (h) open.push(h.dataset.group); });

  listEl.innerHTML = '';
  todayEl.innerHTML = '';
  var groups = Array.from(new Set(dishes.map(function(d){ return normalizeGroupName(d.group); }))).sort(function(a,b){ return a.localeCompare(b,'vi'); });
  groups.forEach(function(group) {
    var groupDishes = dishes.filter(function(d){ return normalizeGroupName(d.group) === group && d.name.toLowerCase().includes(searchQuery.toLowerCase()); });
    if (groupDishes.length===0) return;
    var div = document.createElement('div'); div.className='accordion';
    var h4 = document.createElement('h4'); h4.dataset.group = group; h4.onclick = function(){ toggleAccordion(this); };
    h4.innerHTML = sanitizeInput(group) + ' (' + groupDishes.length + ' món) <span class="arrow">&#9660;</span>';
    var ul = document.createElement('ul'); ul.className='accordion-content';
    if (open.indexOf(group) !== -1) { ul.classList.add('active'); h4.querySelector('.arrow').innerHTML='&#9650;'; }
    groupDishes.forEach(function(dish) {
      var idx = dishes.findIndex(function(x){ return x.name === dish.name && normalizeGroupName(x.group) === group; });
      if (idx === -1) return;
      var li = document.createElement('li');
      var cb = document.createElement('input'); cb.type='checkbox'; cb.checked=!!dishes[idx].selected; cb.onchange=function(){ toggleSelect(idx); };
      var spanName = document.createElement('span'); spanName.innerHTML = sanitizeInput(dish.name);
      var imgWrap = document.createElement('span');
      if (dish.img) { var im = document.createElement('img'); im.src=dish.img; im.alt=sanitizeInput(dish.name); im.style.width='30px'; im.style.height='30px'; im.style.objectFit='cover'; imgWrap.appendChild(im); }
      else { imgWrap.textContent=' Chưa có ảnh'; }
      var fileInput = document.createElement('input'); fileInput.type='file'; fileInput.accept='image/*'; fileInput.style.display='none'; fileInput.id = 'img-'+idx;
      fileInput.onchange = function(){ updateDishImage(idx, this); };
      var btnChange = document.createElement('button'); btnChange.type='button'; btnChange.className='btn-green'; btnChange.textContent='Thay Ảnh'; btnChange.onclick=function(){ document.getElementById('img-'+idx).click(); };
      var btnDelImg = document.createElement('button'); btnDelImg.type='button'; btnDelImg.className='btn-green'; btnDelImg.textContent='Xóa Ảnh'; btnDelImg.onclick=function(){ deleteDishImage(idx); };
      var btnDel = document.createElement('button'); btnDel.type='button'; btnDel.className='btn-danger'; btnDel.textContent='Xóa Món'; btnDel.onclick=function(){ confirmDeleteDish(idx); };
      li.appendChild(cb); li.appendChild(spanName); li.appendChild(imgWrap); li.appendChild(fileInput); li.appendChild(btnChange); li.appendChild(btnDelImg); li.appendChild(btnDel);
      ul.appendChild(li);
    });
    div.appendChild(h4); div.appendChild(ul); listEl.appendChild(div);
  });

  // real-time today list
  var selected = dishes.filter(function(d){ return d.selected; });
  var grouped = selected.reduce(function(acc,d){ var g = normalizeGroupName(d.group); if (!acc[g]) acc[g]=[]; acc[g].push(d); return acc; }, {});
  Object.keys(grouped).sort(function(a,b){ return a.localeCompare(b,'vi'); }).forEach(function(group){
    var h4 = document.createElement('h4'); h4.textContent = group; todayEl.appendChild(h4);
    grouped[group].forEach(function(dish,i){ var li=document.createElement('li'); li.innerHTML = (i+1) + '. ' + sanitizeInput(dish.name) + (dish.img?('<img src="'+dish.img+'" style="width:30px;height:30px;">'):''); todayEl.appendChild(li); });
  });
}

// Toggle accordion
function toggleAccordion(el) {
  var c = el.nextElementSibling;
  if (!c) return;
  c.classList.toggle('active');
  var arrow = el.querySelector('.arrow');
  if (arrow) arrow.innerHTML = c.classList.contains('active') ? '\u25B2' : '\u25BC';
}

// Toggle select
function toggleSelect(index) {
  if (!dishes[index]) return;
  dishes[index].selected = !dishes[index].selected;
  saveLocalDishes();
  // update firebase too
  writeDishesToFirebase();
}

// delete dish confirm
function confirmDeleteDish(index) {
  if (!Number.isInteger(index) || !dishes[index]) return;
  if (confirm('Bạn có chắc muốn xóa món này không?')) {
    dishes.splice(index,1);
    saveLocalDishes();
    writeDishesToFirebase();
    renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
  }
}

// update image via FileReader
function updateDishImage(index, input) {
  var file = input.files[0];
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      if (dishes[index]) {
        dishes[index].img = e.target.result;
        saveLocalDishes();
        writeDishesToFirebase();
        renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
      }
    };
    reader.readAsDataURL(file);
  }
}

// delete image
function deleteDishImage(index) {
  if (dishes[index]) {
    dishes[index].img = '';
    saveLocalDishes();
    writeDishesToFirebase();
    renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
  }
}

// save today menu (writes both local and firebase)
function saveTodayMenu() {
  todayDishes = dishes.filter(function(d){ return d.selected; });
  saveLocalToday();
  writeTodayToFirebase();
  writeDishesToFirebase();
  alert('Đã lưu menu hôm nay! Mọi thiết bị sẽ cập nhật trong giây lát.');
}

// reset selection
function resetSelection() {
  dishes.forEach(function(d){ d.selected=false; });
  saveLocalDishes();
  writeDishesToFirebase();
  renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
}

// add dish form
function addDishFormSubmit(e) {
  e.preventDefault();
  var form = document.getElementById('add-dish-form');
  var name = sanitizeInput(document.getElementById('dish-name').value || '');
  var groupRaw = document.getElementById('dish-group') ? document.getElementById('dish-group').value : 'Khác';
  var group = normalizeGroupName(groupRaw);
  var file = document.getElementById('dish-img') && document.getElementById('dish-img').files ? document.getElementById('dish-img').files[0] : null;
  if (!name) { alert('Vui lòng nhập tên món.'); return; }
  var add = function(img){ dishes.push({name: name, img: img, group: group, selected:false}); saveLocalDishes(); writeDishesToFirebase(); renderDishesAdmin(''); form.reset(); };
  if (file) {
    var reader = new FileReader();
    reader.onload = function(e){ add(e.target.result); };
    reader.readAsDataURL(file);
  } else add('');
}

// load admin (attach UI)
function loadAdmin() {
  initializeDishes();
  renderDishesAdmin('');
  var saveBtn = document.getElementById('save-menu');
  var resetBtn = document.getElementById('reset-selection');
  var addForm = document.getElementById('add-dish-form');
  if (saveBtn) saveBtn.addEventListener('click', saveTodayMenu);
  if (resetBtn) resetBtn.addEventListener('click', resetSelection);
  if (addForm) addForm.addEventListener('submit', addDishFormSubmit);
  var search = document.getElementById('search-dish');
  if (search) search.addEventListener('input', function(){ renderDishesAdmin(search.value); });
  // attach firebase listeners to keep local in sync
  if (firebaseAvailable) {
    firebase.database().ref('/dishes').on('value', function(snap){ var val = snap.val(); if (val) { dishes = val; saveLocalDishes(); renderDishesAdmin(search?search.value:''); } });
    firebase.database().ref('/todayDishes').on('value', function(snap){ var val = snap.val(); if (val) { todayDishes = val; saveLocalToday(); renderDishesAdmin(search?search.value:''); } });
  }
}

// --- Blog functions (localStorage) ---
function loadBlog() {
  posts = JSON.parse(localStorage.getItem(LS_POSTS)) || [];
  var container = document.getElementById('blog-posts');
  if (!container) return;
  container.innerHTML = '';
  for (var i = posts.length - 1; i >= 0; i--) {
    var p = posts[i];
    var div = document.createElement('div'); div.className='blog-post';
    var html = '<h3>' + sanitizeInput(p.title) + '</h3><p>' + sanitizeInput(p.content) + '</p>';
    if (p.img) html += '<p><img src="' + sanitizeInput(p.img) + '" alt=""></p>';
    html += '<p><button onclick="deletePost(' + i + ')" class="btn-danger">Xóa</button></p>';
    div.innerHTML = html;
    container.appendChild(div);
  }
}

function savePost(title, content, img) {
  posts = posts || [];
  posts.push({ title: title, content: content, img: img, created: new Date().toISOString() });
  saveLocalPosts();
  loadBlog();
}

function deletePost(indexFromEnd) {
  if (indexFromEnd >= 0 && indexFromEnd < posts.length) {
    if (!confirm('Xóa bài viết?')) return;
    posts.splice(indexFromEnd,1);
    saveLocalPosts();
    loadBlog();
  }
}

// add post form handler (call from blog page)
document.addEventListener('submit', function(e){
  if (e.target && e.target.id === 'add-post-form') {
    e.preventDefault();
    var t = sanitizeInput(document.getElementById('post-title').value || '');
    var c = sanitizeInput(document.getElementById('post-content').value || '');
    var img = sanitizeInput(document.getElementById('post-img').value || '');
    if (!t || !c) { alert('Vui lòng nhập tiêu đề & nội dung'); return; }
    savePost(t,c,img);
    e.target.reset();
  }
});

// helper to be used by menu page when firebase provides data
function attachMenuRealtimeFallback() {
  if (firebaseAvailable) attachMenuRealtime();
  else loadTodayMenu();
}

// Ensure initial setup
initializeDishes();
saveLocalDishes();

// Export functions if needed globally
window.loadAdmin = loadAdmin;
window.loadBlog = loadBlog;
window.loadTodayMenu = loadTodayMenu;
window.attachMenuRealtime = attachMenuRealtime;
window.renderTodayIntoMenu = renderTodayIntoMenu;
window.saveTodayMenu = saveTodayMenu;
window.resetSelection = resetSelection;
