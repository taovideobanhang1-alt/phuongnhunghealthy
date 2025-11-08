// script.js (Phương Nhung Healthy v3.0)
// - Firebase compat v9 expected (firebase-app-compat.js + firebase-database-compat.js loaded in HTML)
// - Admin password: 123 (kept simple per yêu cầu), saved in localStorage with 7-day expiry

/* ========== CONFIG ========== */
var firebaseConfig = {
  apiKey: "AIzaSyA6bPO-ozAderQl_WyRDvr1FFtFmOV2whE",
  authDomain: "phuongnhung-healthy-dd33d.firebaseapp.com",
  databaseURL: "https://phuongnhung-healthy-dd33d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phuongnhung-healthy-dd33d",
  storageBucket: "phuongnhung-healthy-dd33d.appspot.com",
  messagingSenderId: "311113370048",
  appId: "1:311113370048:web:3fe2160cf5db11f7e66025"
};

/* ========== RUNTIME FLAGS & STORAGE KEYS ========== */
var firebaseAvailable = false;
try {
  if (window.firebase && firebase && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    // firebase.database should be available with compat build
    if (firebase.database) {
      firebaseAvailable = true;
      console.log('[PHN] Firebase initialized (compat)');
    }
  }
} catch (e) {
  firebaseAvailable = false;
  console.warn('[PHN] Firebase init failed:', e);
}

var LS_DISHES = 'phn_v3_dishes';
var LS_TODAY = 'phn_v3_today';
var LS_POSTS = 'phn_v3_posts';
var ADMIN_STORAGE_KEY = 'phn_v3_admin';

/* ========== In-memory state ========== */
var dishes = JSON.parse(localStorage.getItem(LS_DISHES)) || [];
var todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || [];
var posts = JSON.parse(localStorage.getItem(LS_POSTS)) || [];

/* ========== Utilities ========== */
function sanitizeInput(s) {
  if (s === undefined || s === null) return '';
  return String(s).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/[<>]/g, '');
}
function nowISO() { return (new Date()).toISOString(); }
function normalizeGroup(g) {
  if (!g) return g;
  if (g === 'Thịt Lợn') return 'Lợn';
  if (g === 'Món Chay') return 'Chay';
  return g;
}

/* ========== Init default dishes (if empty) ========== */
function initializeDishes() {
  if (!dishes || dishes.length < 60) {
    var defaultDishes = [
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
    dishes = defaultDishes.map(function (d) {
      return { name: d.name, img: d.img, group: normalizeGroup(d.group), selected: d.selected };
    });
    localStorage.setItem(LS_DISHES, JSON.stringify(dishes));
  }
}

/* ========== Local persistence helpers ========== */
function saveLocalDishes() { localStorage.setItem(LS_DISHES, JSON.stringify(dishes)); }
function saveLocalToday() { localStorage.setItem(LS_TODAY, JSON.stringify(todayDishes)); }
function saveLocalPosts() { localStorage.setItem(LS_POSTS, JSON.stringify(posts)); }

/* ========== Firebase write helpers ========== */
function writeDishesToFirebase() {
  if (!firebaseAvailable) return;
  try {
    firebase.database().ref('/dishes').set(dishes);
  } catch (e) {
    console.warn('[PHN] writeDishesToFirebase error', e);
  }
}
function writeTodayToFirebase() {
  if (!firebaseAvailable) return;
  try {
    firebase.database().ref('/todayDishes').set(todayDishes);
  } catch (e) {
    console.warn('[PHN] writeTodayToFirebase error', e);
  }
}

/* ========== Realtime listeners ========== */
function attachMenuRealtime() {
  if (!firebaseAvailable) {
    console.warn('[PHN] attachMenuRealtime: firebase not available, using local fallback');
    loadTodayMenu();
    return;
  }
  try {
    firebase.database().ref('/dishes').on('value', function (snap) {
      var val = snap.val();
      if (val) {
        dishes = val;
        saveLocalDishes();
      }
    });
    firebase.database().ref('/todayDishes').on('value', function (snap) {
      var val = snap.val();
      if (val) {
        todayDishes = val;
        saveLocalToday();
        if (typeof renderTodayIntoMenu === 'function') renderTodayIntoMenu();
      }
    });
    console.log('[PHN] attachMenuRealtime: listeners attached');
  } catch (e) {
    console.warn('[PHN] attachMenuRealtime error', e);
  }
}

/* ========== Menu rendering (menu.html) ========== */
function renderTodayIntoMenu() {
  var menuList = document.getElementById('menu-list');
  if (!menuList) return;
  menuList.innerHTML = '<h2>Menu Healthy Hôm Nay</h2><p>Giá theo thị trường và khẩu phần bạn chọn</p>';
  var ul = document.createElement('ul');
  var grouped = (todayDishes || []).reduce(function (acc, dish) {
    var g = normalizeGroup(dish.group || dish.group);
    if (!acc[g]) acc[g] = [];
    acc[g].push(dish);
    return acc;
  }, {});
  Object.keys(grouped).sort(function (a, b) { return a.localeCompare(b, 'vi'); }).forEach(function (group) {
    var h4 = document.createElement('h4');
    h4.textContent = group;
    ul.appendChild(h4);
    grouped[group].forEach(function (dish, idx) {
      var li = document.createElement('li');
      li.innerHTML = (idx + 1) + '. ' + sanitizeInput(dish.name);
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
  // ===== Hover preview logic =====
  try{
    var preview = document.getElementById('hover-preview');
    if (preview){
      var moveHandler = function(ev){ 
        var x = ev.clientX + 18; var y = ev.clientY + 18;
        preview.style.left = x + 'px'; preview.style.top = y + 'px';
      };
      menuList.querySelectorAll('li').forEach(function(li){
        var img = li.querySelector('img.dish-image');
        var nameEl = li.querySelector('span, .menu-name') || li;
        if (!img || !nameEl) return;
        nameEl.classList.add('menu-name');
        nameEl.addEventListener('mouseenter', function(e){
          if (window.innerWidth <= 768) return;
          preview.innerHTML = '<img src="'+ img.src +'" alt="preview">';
          preview.style.opacity = 1; preview.style.transform = 'translateY(0)';
          preview.setAttribute('aria-hidden','false');
          moveHandler(e);
          document.addEventListener('mousemove', moveHandler);
        });
        nameEl.addEventListener('mouseleave', function(){
          if (window.innerWidth <= 768) return;
          preview.style.opacity = 0; preview.style.transform = 'translateY(6px)';
          preview.setAttribute('aria-hidden','true');
          document.removeEventListener('mousemove', moveHandler);
        });
        nameEl.addEventListener('click', function(){
          if (window.innerWidth > 768) return;
          li.classList.toggle('open');
          var exists = li.querySelector('.dish-photo');
          if (!exists){
            var ph = document.createElement('img');
            ph.src = img.src; ph.alt = img.alt; ph.className = 'dish-photo';
            li.appendChild(ph);
          }
        });
      });
    }
  } catch(e){ console.warn('[PHN] hover preview logic error', e); }
}


function loadTodayMenu() {
  todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || todayDishes || [];
  renderTodayIntoMenu();
}

/* ========== Admin rendering & interactions ========== */
function renderDishesAdmin(searchQuery) {
  if (!searchQuery) searchQuery = '';
  var listEl = document.getElementById('dish-list');
  var todayEl = document.getElementById('today-dishes');
  if (!listEl || !todayEl) return;

  // preserve open groups
  var openGroups = [];
  document.querySelectorAll('.accordion-content.active').forEach(function (c) {
    var h = c.previousElementSibling;
    if (h) openGroups.push(h.dataset.group);
  });

  listEl.innerHTML = '';
  todayEl.innerHTML = '';

  var groups = Array.from(new Set(dishes.map(function (d) { return normalizeGroup(d.group); }))).sort(function (a, b) { return a.localeCompare(b, 'vi'); });

  groups.forEach(function (group) {
    var groupDishes = dishes.filter(function (d) { return normalizeGroup(d.group) === group && d.name.toLowerCase().includes(searchQuery.toLowerCase()); });
    if (!groupDishes || groupDishes.length === 0) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'accordion';

    var h4 = document.createElement('h4');
    h4.dataset.group = group;
    h4.onclick = function () { toggleAccordion(this); };
    h4.innerHTML = sanitizeInput(group) + ' (' + groupDishes.length + ' món) <span class="arrow">&#9660;</span>';

    var ul = document.createElement('ul');
    ul.className = 'accordion-content';
    if (openGroups.indexOf(group) !== -1) {
      ul.classList.add('active');
      var arrow = h4.querySelector('.arrow');
      if (arrow) arrow.innerHTML = '&#9650;';
    }

    groupDishes.forEach(function (dish) {
      var idx = dishes.findIndex(function (x) { return x.name === dish.name && normalizeGroup(x.group) === group; });
      if (idx === -1) return;

      var li = document.createElement('li');

      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!dishes[idx].selected;
      cb.onchange = function () { toggleSelect(idx); };

      var nameSpan = document.createElement('span');
      nameSpan.innerHTML = sanitizeInput(dish.name);

      var imgWrap = document.createElement('span');
      if (dish.img) {
        var im = document.createElement('img');
        im.src = dish.img;
        im.alt = sanitizeInput(dish.name);
        im.style.width = '40px';
        im.style.height = '40px';
        im.style.objectFit = 'cover';
        im.style.marginLeft = '8px';
        imgWrap.appendChild(im);
      } else {
        imgWrap.textContent = ' Chưa có ảnh';
      }

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      fileInput.id = 'img-' + idx;
      fileInput.onchange = function () { updateDishImage(idx, this); };

      var btnChange = document.createElement('button');
      btnChange.type = 'button';
      btnChange.className = 'btn-green';
      btnChange.textContent = 'Thay Ảnh';
      btnChange.onclick = function () { document.getElementById('img-' + idx).click(); };

      var btnDelImg = document.createElement('button');
      btnDelImg.type = 'button';
      btnDelImg.className = 'btn-green';
      btnDelImg.textContent = 'Xóa Ảnh';
      btnDelImg.onclick = function () { deleteDishImage(idx); };

      var btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-danger';
      btnDel.textContent = 'Xóa Món';
      btnDel.onclick = function () { confirmDeleteDish(idx); };

      li.appendChild(cb);
      li.appendChild(nameSpan);
      li.appendChild(imgWrap);
      li.appendChild(fileInput);
      li.appendChild(btnChange);
      li.appendChild(btnDelImg);
      li.appendChild(btnDel);

      ul.appendChild(li);
    });

    wrapper.appendChild(h4);
    wrapper.appendChild(ul);
    listEl.appendChild(wrapper);
  });

  // render today list grouped
  var selected = dishes.filter(function (d) { return d.selected; });
  var grouped = selected.reduce(function (acc, d) { var g = normalizeGroup(d.group); if (!acc[g]) acc[g] = []; acc[g].push(d); return acc; }, {});
  Object.keys(grouped).sort(function (a, b) { return a.localeCompare(b, 'vi'); }).forEach(function (group) {
    var h4 = document.createElement('h4');
    h4.textContent = group;
    todayEl.appendChild(h4);
    grouped[group].forEach(function (d, i) {
      var li = document.createElement('li');
      li.innerHTML = (i + 1) + '. ' + sanitizeInput(d.name);
      if (d.img) li.innerHTML += ' <img src="' + d.img + '" style="width:30px;height:30px;margin-left:8px;">';
      todayEl.appendChild(li);
    });
  });
}

/* ========== Admin actions ========== */
function toggleAccordion(el) {
  var content = el.nextElementSibling;
  if (!content) return;
  content.classList.toggle('active');
  var arrow = el.querySelector('.arrow');
  if (arrow) arrow.innerHTML = content.classList.contains('active') ? '\u25B2' : '\u25BC';
}

function toggleSelect(index) {
  if (!dishes[index]) return;
  dishes[index].selected = !dishes[index].selected;
  saveLocalDishes();
  writeDishesToFirebase();
  renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
}

function confirmDeleteDish(index) {
  if (!Number.isInteger(index) || !dishes[index]) return;
  if (!confirm('Bạn có chắc muốn xóa món này không?')) return;
  dishes.splice(index, 1);
  saveLocalDishes();
  writeDishesToFirebase();
  renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
}

function updateDishImage(index, input){
  var file = input.files && input.files[0];
  if (!file) return;
  processImageToCanvas(file, function(dataUrl){
    var readerFallback = function(){
      var r = new FileReader();
      r.onload = function(e){ if (dishes[index]){ dishes[index].img = e.target.result; saveLocalDishes(); writeDishesToFirebase(); renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : ''); } };
      r.readAsDataURL(file);
    };
    if (dataUrl && dishes[index]){
      dishes[index].img = dataUrl;
      saveLocalDishes(); writeDishesToFirebase();
      renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
    } else { readerFallback(); }
  });
}
  };
  reader.readAsDataURL(file);
}

function deleteDishImage(index) {
  if (!dishes[index]) return;
  dishes[index].img = '';
  saveLocalDishes();
  writeDishesToFirebase();
  renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
}

function saveTodayMenu() {
  todayDishes = dishes.filter(function (d) { return d.selected; });
  saveLocalToday();
  writeTodayToFirebase();
  alert('Đã lưu menu hôm nay! (Đồng bộ lên Firebase nếu có kết nối)');
}

function resetSelection() {
  dishes.forEach(function (d) { d.selected = false; });
  saveLocalDishes();
  writeDishesToFirebase();
  renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
}

function addDishFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  var name = sanitizeInput(document.getElementById('dish-name').value || '');
  var group = document.getElementById('dish-group') ? document.getElementById('dish-group').value : 'Khác';
  var fileInput = document.getElementById('dish-img');
  var file = fileInput && fileInput.files ? fileInput.files[0] : null;
  if (!name) { alert('Vui lòng nhập tên món'); return; }
  var addFn = function (imgData) {
    dishes.push({ name: name, img: imgData || '', group: normalizeGroup(group), selected: false });
    saveLocalDishes();
    writeDishesToFirebase();
    renderDishesAdmin('');
    if (document.getElementById('add-dish-form')) document.getElementById('add-dish-form').reset();
  };
  if (file){
    processImageToCanvas(file, function(dataUrl){
      if (dataUrl){ addFn(dataUrl); }
      else {
        var r = new FileReader();
        r.onload = function(ev){ addFn(ev.target.result); };
        r.readAsDataURL(file);
      }
    });
  } else addFn('');
}

/* ========== Admin load (bind events) ========== */
function loadAdmin() {
  initializeDishes();
  renderDishesAdmin('');
  var search = document.getElementById('search-dish');
  if (search) search.addEventListener('input', function () { renderDishesAdmin(search.value); });

  var saveBtn = document.getElementById('save-menu');
  if (saveBtn) saveBtn.addEventListener('click', saveTodayMenu);

  var resetBtn = document.getElementById('reset-selection');
  if (resetBtn) resetBtn.addEventListener('click', resetSelection);

  var addForm = document.getElementById('add-dish-form');
  if (addForm) addForm.addEventListener('submit', addDishFormSubmit);

  if (firebaseAvailable) {
    try {
      firebase.database().ref('/dishes').on('value', function (snap) {
        var val = snap.val();
        if (val) {
          dishes = val;
          saveLocalDishes();
          renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
        }
      });
      firebase.database().ref('/todayDishes').on('value', function (snap) {
        var val = snap.val();
        if (val) {
          todayDishes = val;
          saveLocalToday();
          renderDishesAdmin(document.getElementById('search-dish') ? document.getElementById('search-dish').value : '');
        }
      });
      console.log('[PHN] loadAdmin: firebase listeners attached');
    } catch (e) {
      console.warn('[PHN] loadAdmin firebase listener error', e);
    }
  }
}

/* ========== Blog functions (local storage) ========== */
function loadBlog() {
  posts = JSON.parse(localStorage.getItem(LS_POSTS)) || [];
  var container = document.getElementById('blog-list') || document.getElementById('blog-posts');
  if (!container) return;
  container.innerHTML = '';
  for (var i = posts.length - 1; i >= 0; i--) {
    var p = posts[i];
    var div = document.createElement('div');
    div.className = 'blog-post';
    div.innerHTML = '<h3>' + sanitizeInput(p.title) + '</h3><p>' + sanitizeInput(p.content) + '</p>' + (p.img ? ('<p><img src="' + sanitizeInput(p.img) + '" style="max-width:100%"></p>') : '');
    container.appendChild(div);
  }
}
function savePost(title, content, img) {
  posts = posts || [];
  posts.push({ title: title, content: content, img: img || '', created: nowISO() });
  saveLocalPosts();
  loadBlog();
}
function deletePost(index) {
  if (!confirm('Xóa bài viết?')) return;
  posts.splice(index, 1);
  saveLocalPosts();
  loadBlog();
}

/* ========== QR code generation (menu page) ========== */
function generateQRCodeForMenu() {
  try {
    var el = document.getElementById('qr-code');
    var canvasEl = document.getElementById('qr-code');
    if (!canvasEl && !el) return;
    var url = window.location.href.split('#')[0];
    // QRious library: new QRious({ element: canvasEl, value: url, size: 140 })
    if (typeof QRious !== 'undefined') {
      try {
        var qr = new QRious({ element: canvasEl, value: url, size: 160 });
      } catch (err) {
        console.warn('[PHN] QRious generation failed', err);
      }
    } else {
      // fallback: draw simple text
      if (canvasEl && canvasEl.getContext) {
        var ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, 160, 160);
        ctx.font = '12px Arial';
        ctx.fillText('QR unavailable', 10, 20);
      }
    }
  } catch (e) { console.warn('[PHN] generateQRCodeForMenu err', e); }
}

/* ========== Realtime clock on menu page ========== */
function startRealtimeClock() {
  var el = document.getElementById('realtime-clock') || document.getElementById('menu-datetime');
  if (!el) return;
  function tick() {
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    var hh = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    var ss = String(d.getSeconds()).padStart(2, '0');
    el.textContent = dd + '/' + mm + '/' + yyyy + ' - ' + hh + ':' + min + ':' + ss;
  }
  tick();
  setInterval(tick, 1000);
}

/* ========== Admin login (localStorage-based, expiry 7 days) ========== */
function isAdminLogged() {
  try {
    var s = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));
    if (!s || !s.pwd || !s.expiry) return false;
    if (s.pwd !== '123') return false;
    if (Date.now() > s.expiry) return false;
    return true;
  } catch (e) { return false; }
}
function setAdminLogged() {
  var expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ pwd: '123', expiry: expiry }));
}
function checkLogin() {
  var v = document.getElementById('admin-pass') ? document.getElementById('admin-pass').value : '';
  if (v === '123') {
    setAdminLogged();
    var ls = document.getElementById('login-section');
    var ad = document.getElementById('admin-layout');
    if (ls) ls.style.display = 'none';
    if (ad) ad.style.display = 'flex';
    if (typeof loadAdmin === 'function') loadAdmin();
  } else {
    var st = document.getElementById('login-status');
    if (st) st.textContent = 'Mật khẩu không đúng';
  }
}

/* ========== Init on page load ========== */
(function initOnLoad() {
  // initialize default dishes if needed
  initializeDishes();

  // If on menu page: attach realtime + QR + clock
  if (document.getElementById('menu-list')) {
    startRealtimeClock();
    // generate QR after tiny delay to ensure DOM ready
    setTimeout(generateQRCodeForMenu, 250);
    if (firebaseAvailable) attachMenuRealtime();
    else loadTodayMenu();
  }

  // If on admin page: check login state
  if (document.getElementById('admin-layout') || document.getElementById('login-section')) {
    if (isAdminLogged()) {
      var ls = document.getElementById('login-section');
      var ad = document.getElementById('admin-layout');
      if (ls) ls.style.display = 'none';
      if (ad) ad.style.display = 'flex';
      if (typeof loadAdmin === 'function') loadAdmin();
    } else {
      var ls = document.getElementById('login-section');
      var ad = document.getElementById('admin-layout');
      if (ls) ls.style.display = 'block';
      if (ad) ad.style.display = 'none';
    }
  }

  // If on blog page
  if (document.getElementById('blog-list') || document.getElementById('blog-posts')) {
    loadBlog();
  }

  // Expose some helpers to global for debugging
  window.phn_debug = {
    firebaseAvailable: firebaseAvailable,
    dishes: function () { return dishes; },
    todayDishes: function () { return todayDishes; }
  };
})();

/* ========== Export key functions for HTML to call ========== */
window.attachMenuRealtime = attachMenuRealtime;
window.loadAdmin = loadAdmin;
window.loadBlog = loadBlog;
window.loadTodayMenu = loadTodayMenu;
window.renderTodayIntoMenu = renderTodayIntoMenu;
window.saveTodayMenu = saveTodayMenu;
window.resetSelection = resetSelection;
window.checkLogin = checkLogin;

/* ===== Image preprocess: crop to 4:3 and resize to max 1200x900 ===== */
function processImageToCanvas(file, cb){
  try{
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var ratio = 4/3;
        var iw = img.width, ih = img.height;
        var targetW = iw, targetH = Math.round(iw/ratio);
        if (targetH > ih){ targetH = ih; targetW = Math.round(ih*ratio); }
        var sx = Math.round((iw - targetW)/2);
        var sy = Math.round((ih - targetH)/2);
        var outW = Math.min(1200, targetW);
        var outH = Math.round(outW/ratio);
        var c = document.createElement('canvas');
        c.width = outW; c.height = outH;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, sx, sy, targetW, targetH, 0, 0, outW, outH);
        cb(c.toDataURL('image/jpeg', 0.9));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }catch(err){ console.warn('[PHN] processImageToCanvas error', err); cb(null); }
}
