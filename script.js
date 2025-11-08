// script.js (Phương Nhung Healthy v3.1 - FIXED)

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

/* ========== Firebase Init (compat mode) ========== */
var firebaseAvailable = false;
try {
  if (window.firebase && firebase.initializeApp) {
    firebase.initializeApp(firebaseConfig);
    firebaseAvailable = true;
    console.log("[PHN] Firebase ready");
  }
} catch (e) { console.warn("[PHN] Firebase init failed", e); }

/* ========== Storage Keys ========== */
var LS_DISHES = "phn_v3_dishes";
var LS_TODAY = "phn_v3_today";
var LS_POSTS = "phn_v3_posts";
var ADMIN_STORAGE_KEY = "phn_v3_admin";

/* ========== Local State ========== */
var dishes = JSON.parse(localStorage.getItem(LS_DISHES)) || [];
var todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || [];
var posts = JSON.parse(localStorage.getItem(LS_POSTS)) || [];

/* ========== Helpers ========== */
function sanitizeInput(s) {
  return String(s || "").replace(/[<>]/g, "");
}
function normalizeGroup(g) {
  if (g === "Thịt Lợn") return "Lợn";
  if (g === "Món Chay") return "Chay";
  return g;
}

/* ========== Default Dishes Loader (giữ nguyên bản của Lão Gia) ========== */
function initializeDishes() {
  if (dishes.length < 10) {
    alert("Dữ liệu món đang trống — tải lại trang để đồng bộ Firebase.");
  }
}

/* ========== Save Local & Firebase ========== */
function saveLocalDishes() { localStorage.setItem(LS_DISHES, JSON.stringify(dishes)); }
function saveLocalToday() { localStorage.setItem(LS_TODAY, JSON.stringify(todayDishes)); }
function saveLocalPosts() { localStorage.setItem(LS_POSTS, JSON.stringify(posts)); }

function writeDishesToFirebase() {
  if (firebaseAvailable) firebase.database().ref("/dishes").set(dishes);
}
function writeTodayToFirebase() {
  if (firebaseAvailable) firebase.database().ref("/todayDishes").set(todayDishes);
}

/* ========== Admin UI Rendering ========== */
function renderDishesAdmin(searchQuery) {
  searchQuery = (searchQuery || "").toLowerCase();
  var listEl = document.getElementById("dish-list");
  var todayEl = document.getElementById("today-dishes");
  if (!listEl || !todayEl) return;

  listEl.innerHTML = "";
  todayEl.innerHTML = "";

  var groups = [...new Set(dishes.map(d => normalizeGroup(d.group)))].sort((a, b) => a.localeCompare(b, "vi"));
  groups.forEach(group => {
    var items = dishes.filter(d => normalizeGroup(d.group) === group && d.name.toLowerCase().includes(searchQuery));
    if (!items.length) return;

    var wrap = document.createElement("div");
    wrap.className = "accordion";

    var h = document.createElement("h4");
    h.dataset.group = group;
    h.innerHTML = group + " (" + items.length + ") <span class='arrow'>&#9660;</span>";
    h.onclick = () => toggleAccordion(h);

    var ul = document.createElement("ul");
    ul.className = "accordion-content";

    items.forEach((d, i) => {
      var idx = dishes.indexOf(d);
      var li = document.createElement("li");

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!d.selected;
      cb.onchange = () => toggleSelect(idx);

      var name = document.createElement("span");
      name.textContent = sanitizeInput(d.name);

      var img = document.createElement("img");
      img.src = d.img || "";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "cover";
      img.style.marginLeft = "8px";

      var file = document.createElement("input");
      file.type = "file";
      file.accept = "image/*";
      file.style.display = "none";
      file.onchange = () => updateDishImage(idx, file);

      var btnImg = document.createElement("button");
      btnImg.className = "btn-green";
      btnImg.textContent = "Ảnh";
      btnImg.onclick = () => file.click();

      li.appendChild(cb);
      li.appendChild(name);
      if (d.img) li.appendChild(img);
      li.appendChild(file);
      li.appendChild(btnImg);
      ul.appendChild(li);
    });

    wrap.appendChild(h);
    wrap.appendChild(ul);
    listEl.appendChild(wrap);
  });

  // render today selection
  todayDishes = dishes.filter(d => d.selected);
  todayDishes.forEach((d, i) => {
    var li = document.createElement("li");
    li.textContent = (i + 1) + ". " + d.name;
    todayEl.appendChild(li);
  });
}

/* ========== FIX: Image Upload (đã sửa hỏng dấu ngoặc) ========== */
function updateDishImage(index, input) {
  var file = input.files?.[0];
  if (!file) return;
  processImageToCanvas(file, dataUrl => {
    dishes[index].img = dataUrl;
    saveLocalDishes(); writeDishesToFirebase();
    renderDishesAdmin(document.getElementById("search-dish").value);
  });
}

/* ========== Add dish ========== */
function addDishFormSubmit(e) {
  e.preventDefault();
  var name = sanitizeInput(document.getElementById("dish-name").value);
  var group = document.getElementById("dish-group").value;
  var file = document.getElementById("dish-img").files[0];
  if (!name) return alert("Thiếu tên món");

  var add = img => {
    dishes.push({ name, img, group: normalizeGroup(group), selected: false });
    saveLocalDishes(); writeDishesToFirebase();
    renderDishesAdmin("");
    document.getElementById("add-dish-form").reset();
  };

  if (!file) return add("");
  processImageToCanvas(file, add);
}

/* ========== Save Today Menu ========== */
function saveTodayMenu() {
  todayDishes = dishes.filter(d => d.selected);
  saveLocalToday(); writeTodayToFirebase();
  alert("Đã lưu menu hôm nay!");
}

/* ========== Tabs Fix ========== */
document.addEventListener("click", e => {
  if (e.target.classList.contains("tab-btn")) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    e.target.classList.add("active");
    document.getElementById(e.target.dataset.tab).classList.add("active");
  }
});

/* ========== Login ========== */
function isAdminLogged() {
  var s = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "{}");
  return s.pwd === "123" && s.expiry > Date.now();
}
function setAdminLogged() {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ pwd: "123", expiry: Date.now() + 7*86400*1000 }));
}
function checkLogin() {
  if (document.getElementById("admin-pass").value === "123") {
    setAdminLogged();
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-layout").style.display = "flex";
    loadAdmin();
  } else document.getElementById("login-status").textContent = "Sai mật khẩu";
}

/* ========== Page Init ========== */
(function init() {
  if (document.getElementById("admin-layout")) {
    if (isAdminLogged()) {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("admin-layout").style.display = "flex";
      loadAdmin();
    }
  }
})();
window.checkLogin = checkLogin;

/* ========== Image Compress ========== */
function processImageToCanvas(file, cb){
  var reader = new FileReader();
  reader.onload = e=>{
    var img=new Image();
    img.onload=function(){
      var r=4/3,w=img.width,h=img.height,tw=w,th=Math.round(w/r);
      if(th>h){th=h;tw=Math.round(h*r);}
      var sx=(w-tw)/2,sy=(h-th)/2,c=document.createElement("canvas");
      c.width=1200;c.height=900;
      c.getContext("2d").drawImage(img,sx,sy,tw,th,0,0,1200,900);
      cb(c.toDataURL("image/jpeg",0.9));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
