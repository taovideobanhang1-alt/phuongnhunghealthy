// script.js (Phương Nhung Healthy v3.1)

// Storage keys
var LS_DISHES = "phn_v3_dishes";
var LS_TODAY = "phn_v3_today";
var LS_POSTS = "phn_v3_posts";
var LS_ADMIN = "phn_v3_admin";

// Initialize data from localStorage or default
var dishes = JSON.parse(localStorage.getItem(LS_DISHES)) || [];
var todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || [];
var posts = JSON.parse(localStorage.getItem(LS_POSTS)) || [];

// Helpers
function sanitizeInput(s) {
  return String(s || "").replace(/[<>]/g, "");
}
function normalizeGroup(g) {
  if (g === "Thịt Lợn") return "Lợn";
  if (g === "Món Chay") return "Chay";
  return g;
}
// Save to localStorage
function saveLocalDishes() { localStorage.setItem(LS_DISHES, JSON.stringify(dishes)); }
function saveLocalToday()  { localStorage.setItem(LS_TODAY,  JSON.stringify(todayDishes)); }
function saveLocalPosts()  { localStorage.setItem(LS_POSTS,  JSON.stringify(posts)); }

// Render admin dish list
function renderDishesAdmin(searchQuery) {
  searchQuery = (searchQuery || "").toLowerCase();
  var listEl = document.getElementById("dish-list");
  var todayEl = document.getElementById("today-dishes");
  listEl.innerHTML = "";
  todayEl.innerHTML = "";
  // Nhóm món
  var groups = [...new Set(dishes.map(d => normalizeGroup(d.group)))].sort();
  groups.forEach(group => {
    var items = dishes.filter(d => normalizeGroup(d.group) === group && d.name.toLowerCase().includes(searchQuery));
    if (!items.length) return;
    var wrap = document.createElement("div");
    wrap.className = "accordion";
    var h = document.createElement("h4");
    h.dataset.group = group;
    h.innerHTML = group + " (" + items.length + ") <span class='arrow'>&#9660;</span>";
    h.onclick = function() { toggleAccordion(h); };
    var ul = document.createElement("ul");
    ul.className = "accordion-content";
    items.forEach(d => {
      var idx = dishes.indexOf(d);
      var li = document.createElement("li");
      // Checkbox chọn món hôm nay
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!d.selected;
      cb.onchange = function() {
        dishes[idx].selected = cb.checked;
        saveLocalDishes();
      };
      // Tên món
      var name = document.createElement("span");
      name.textContent = sanitizeInput(d.name);
      // Ảnh món
      var img = document.createElement("img");
      img.src = d.img || "";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "cover";
      img.style.marginLeft = "8px";
      // Input file ẩn
      var file = document.createElement("input");
      file.type = "file"; file.accept = "image/*"; file.style.display = "none";
      file.onchange = function() { updateDishImage(idx, file); };
      // Nút tải ảnh
      var btnImg = document.createElement("button");
      btnImg.className = "btn-green"; btnImg.textContent = "Ảnh";
      btnImg.onclick = function() { file.click(); };
      // Nút xóa
      var btnDel = document.createElement("button");
      btnDel.className = "btn-danger"; btnDel.textContent = "Xóa";
      btnDel.onclick = function() {
        if (confirm("Xóa món này?")) {
          dishes.splice(idx, 1);
          saveLocalDishes();
          renderDishesAdmin(document.getElementById("search-dish").value);
        }
      };
      li.appendChild(cb);
      li.appendChild(name);
      if (d.img) li.appendChild(img);
      li.appendChild(file);
      li.appendChild(btnImg);
      li.appendChild(btnDel);
      ul.appendChild(li);
    });
    wrap.appendChild(h);
    wrap.appendChild(ul);
    listEl.appendChild(wrap);
  });
  // Danh sách món hôm nay
  todayDishes = dishes.filter(d => d.selected);
  todayDishes.forEach((d, i) => {
    var li = document.createElement("li");
    li.textContent = (i+1) + ". " + d.name;
    todayEl.appendChild(li);
  });
}
function toggleAccordion(headerEl) {
  var content = headerEl.nextElementSibling;
  if (content.style.display === "block") {
    content.style.display = "none";
    headerEl.querySelector('.arrow').innerHTML = "&#9660;";
  } else {
    content.style.display = "block";
    headerEl.querySelector('.arrow').innerHTML = "&#9650;";
  }
}

// Xử lý ảnh (nén, cắt)
function updateDishImage(index, input) {
  var file = input.files[0];
  if (!file) return;
  processImageToCanvas(file, function(dataUrl) {
    dishes[index].img = dataUrl;
    saveLocalDishes();
    renderDishesAdmin(document.getElementById("search-dish").value);
  });
}
function processImageToCanvas(file, cb) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var w = img.width, h = img.height;
      var r = 4/3, tw = w, th = Math.round(w/r);
      if (th > h) { th = h; tw = Math.round(h*r); }
      var sx = (w-tw)/2, sy = (h-th)/2;
      var canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 900;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, tw, th, 0, 0, 1200, 900);
      cb(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Thêm món mới
function addDishFormSubmit(e) {
  e.preventDefault();
  var name = sanitizeInput(document.getElementById("dish-name").value);
  var group = document.getElementById("dish-group").value;
  var file = document.getElementById("dish-img").files[0];
  if (!name) return alert("Thiếu tên món");
  var add = function(imgData) {
    dishes.push({ name: name, img: imgData, group: normalizeGroup(group), selected: false });
    saveLocalDishes();
    renderDishesAdmin("");
    document.getElementById("add-dish-form").reset();
  };
  if (file) processImageToCanvas(file, add);
  else add("");
}

// Lưu menu hôm nay
function saveTodayMenu() {
  todayDishes = dishes.filter(d => d.selected);
  saveLocalToday();
  alert("Đã lưu menu hôm nay!");
}

// Quản lý blog (admin)
function renderPostsAdmin() {
  var adminPosts = document.getElementById("admin-posts");
  adminPosts.innerHTML = "";
  posts.slice().reverse().forEach(function(p) {
    var div = document.createElement("div");
    div.className = "blog-post";
    var html = "<h3>" + sanitizeInput(p.title) + "</h3>";
    if (p.img) {
      html += "<img src='" + p.img + "' alt=''>";
    }
    html += "<p>" + sanitizeInput(p.content) + "</p>";
    div.innerHTML = html;
    adminPosts.appendChild(div);
  });
}
function addPostFormSubmit(e) {
  e.preventDefault();
  var title = sanitizeInput(document.getElementById("post-title").value);
  var content = sanitizeInput(document.getElementById("post-content").value);
  var file = document.getElementById("post-img").files[0];
  if (!title || !content) return alert("Thiếu tiêu đề hoặc nội dung");
  var addPost = function(imgData) {
    posts.push({ title: title, content: content, img: imgData });
    saveLocalPosts();
    renderPostsAdmin();
    document.getElementById("add-post-form").reset();
  };
  if (file) processImageToCanvas(file, addPost);
  else addPost("");
}

// Xử lý đăng nhập admin
function isAdminLogged() {
  var s = JSON.parse(localStorage.getItem(LS_ADMIN) || "{}");
  return s.pwd === "123" && s.expiry > Date.now();
}
function setAdminLogged() {
  localStorage.setItem(LS_ADMIN, JSON.stringify({ pwd: "123", expiry: Date.now() + 7*86400*1000 }));
}
function checkLogin() {
  if (document.getElementById("admin-pass").value === "123") {
    setAdminLogged();
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-layout").style.display = "flex";
    loadAdmin();
  } else {
    document.getElementById("login-status").textContent = "Sai mật khẩu";
  }
}
window.checkLogin = checkLogin;

function loadAdmin() {
  renderDishesAdmin();
  renderPostsAdmin();
  document.getElementById("search-dish").addEventListener("input", function() {
    renderDishesAdmin(this.value);
  });
  document.getElementById("reset-selection").onclick = function() {
    dishes.forEach(d => d.selected = false);
    saveLocalDishes();
    renderDishesAdmin("");
  };
  document.getElementById("save-menu").onclick = saveTodayMenu;
  document.getElementById("add-dish-form").onsubmit = addDishFormSubmit;
  document.getElementById("add-post-form").onsubmit = addPostFormSubmit;
}

// Khởi tạo trang
(function init() {
  // Nếu ở trang admin
  if (document.getElementById("admin-layout")) {
    if (isAdminLogged()) {
      document.getElementById("login-section").style.display = "none";
      document.getElementById("admin-layout").style.display = "flex";
      loadAdmin();
    }
  }
  // Nếu ở trang blog
  var blogList = document.getElementById("blog-list");
  if (blogList) {
    posts.slice().reverse().forEach(function(p) {
      var div = document.createElement("div");
      div.className = "blog-post";
      var html = "<h3>" + sanitizeInput(p.title) + "</h3>";
      if (p.img) {
        html += "<img src='" + p.img + "' alt=''>";
      }
      html += "<p>" + sanitizeInput(p.content) + "</p>";
      div.innerHTML = html;
      blogList.appendChild(div);
    });
  }
  // Nếu ở trang menu
  var menuSection = document.getElementById("menu-list");
  if (menuSection) {
    // Đồng hồ thời gian thực
    setInterval(function() {
      var now = new Date();
      var clockEl = document.getElementById("realtime-clock");
      if (clockEl) clockEl.textContent = now.toLocaleString();
    }, 1000);
    // Xóa thông báo tải
    var h2 = menuSection.querySelector("h2");
    if (h2) h2.remove();
    var ul = document.createElement("ul");
    menuSection.appendChild(ul);
    var preview = document.getElementById("hover-preview");
    preview.innerHTML = "";
    todayDishes = JSON.parse(localStorage.getItem(LS_TODAY)) || [];
    if (todayDishes.length === 0) {
      ul.innerHTML = "<h2>Chưa có menu hôm nay</h2>";
    } else {
      todayDishes.forEach(function(d) {
        var li = document.createElement("li");
        li.className = "dish-entry";
        var span = document.createElement("span");
        span.className = "menu-name";
        span.textContent = d.name;
        li.appendChild(span);
        if (d.img) {
          var img = document.createElement("img");
          img.className = "dish-photo";
          img.src = d.img;
          img.style.display = "none";
          li.appendChild(img);
          // Hover (PC)
          span.addEventListener("mousemove", function(e) {
            if (!window.matchMedia("(max-width: 768px)").matches) {
              preview.style.left = (e.clientX + 20) + "px";
              preview.style.top = (e.clientY + 20) + "px";
            }
          });
          span.addEventListener("mouseenter", function() {
            if (d.img && !window.matchMedia("(max-width: 768px)").matches) {
              preview.innerHTML = "<img src='" + d.img + "'>";
              preview.style.opacity = 1;
            }
          });
          span.addEventListener("mouseleave", function() {
            preview.style.opacity = 0;
          });
          // Click (mobile)
          span.addEventListener("click", function() {
            li.classList.toggle("open");
            var imgElem = li.querySelector(".dish-photo");
            if (imgElem) {
              imgElem.style.display = (imgElem.style.display === "block") ? "none" : "block";
            }
          });
        }
        ul.appendChild(li);
      });
      // Tạo mã QR cho Zalo (theo hướng dẫn)
      new QRious({
        element: document.getElementById("qr-code"),
        value: "https://zalo.me/0902032188",
        size: 160,
        background: "white"
      });
    }
  }
})();
