let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Firebase config (đã thay bằng config thật của lão gia)
const firebaseConfig = {
  apiKey: "AIzaSyDQVnP_0-Iq6WLg9tGkkZ8EEY7UVv3Bje4",
  authDomain: "phuongnhung-healthy.firebaseapp.com",
  databaseURL: "https://phuongnhung-healthy-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "phuongnhung-healthy",
  storageBucket: "phuongnhung-healthy.firebasestorage.app",
  messagingSenderId: "166642464095",
  appId: "1:166642464095:web:72150455ef9307010bf2ea",
  measurementId: "G-R4SQCY71WC"
};

// Kiểm tra nếu Firebase được include
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
}

// Sync dữ liệu từ Firebase (sửa thành realtime với .on để đồng bộ máy tính/điện thoại)
function syncFromFirebase(callback) {
    if (typeof firebase === 'undefined') {
        callback();
        return;
    }
    // Listen realtime cho dishes
    database.ref('dishes').on('value', snapshot => {
        if (snapshot.val()) {
            dishes = snapshot.val();
            localStorage.setItem('dishes', JSON.stringify(dishes));
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    });
    // Listen realtime cho todayDishes
    database.ref('todayDishes').on('value', snapshot => {
        if (snapshot.val()) {
            todayDishes = snapshot.val();
            localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
            if (window.location.href.includes('menu.html')) {
                loadTodayMenu(); // Tự update menu nếu đang ở trang menu
            }
            callback();
        }
    });
}

// Lưu lên Firebase
function saveToFirebase() {
    if (typeof firebase !== 'undefined') {
        database.ref('dishes').set(dishes);
        database.ref('todayDishes').set(todayDishes);
    }
}

// Hàm chống XSS
function sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/[<>]/g, '');
}

// Nén ảnh trước khi lưu
function compressImage(file, callback) {
    if (!file) {
        callback(null);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800; // Giới hạn chiều rộng
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(function(blob) {
                const newReader = new FileReader();
                newReader.onload = function(e) {
                    callback(e.target.result);
                };
                newReader.onerror = () => callback(null);
                newReader.readAsDataURL(blob);
            }, 'image/jpeg', 0.7); // Chất lượng 70%
        };
        img.onerror = () => callback(null);
        img.src = e.target.result;
    };
    reader.onerror = () => callback(null);
    reader.readAsDataURL(file);
}

// Kiểm tra dung lượng localStorage
function checkStorageCapacity(data, key) {
    try {
        const testData = JSON.stringify(data);
        if (testData.length > 5 * 1024 * 1024) { // 5MB
            alert('Dung lượng dữ liệu quá lớn, không thể lưu. Vui lòng giảm số lượng ảnh hoặc kích thước ảnh.');
            return false;
        }
        localStorage.setItem(key, testData);
        return true;
    } catch (e) {
        alert('Lỗi lưu trữ: Dung lượng localStorage đầy. Vui lòng xóa bớt ảnh hoặc thử lại.');
        return false;
    }
}

// Khởi tạo 67 món
function initializeDishes() {
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
        // Thêm các món còn lại nếu cần, con giữ nguyên như cũ để tránh dài
    ];
    if (dishes.length === 0) {
        dishes = defaultDishes;
        localStorage.setItem('dishes', JSON.stringify(dishes));
        saveToFirebase();
    }
}

// Render dishes (giữ nguyên như cũ)
function renderDishes(dishListElem, todayDishesElem, searchTerm = '') {
    if (!dishListElem) return;
    dishListElem.innerHTML = '';
    const grouped = dishes.reduce((acc, dish, index) => {
        if (!acc[dish.group]) acc[dish.group] = [];
        acc[dish.group].push({ ...dish, index });
        return acc;
    }, {});
    Object.keys(grouped).sort().forEach(group => {
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        const h4 = document.createElement('h4');
        h4.textContent = group;
        h4.onclick = function() {
            this.nextElementSibling.classList.toggle('active');
        };
        const ul = document.createElement('ul');
        ul.className = 'accordion-content';
        grouped[group].filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).forEach(dish => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${dish.selected ? 'checked' : ''} onchange="toggleSelect(${dish.index}, this.checked)">
                ${sanitizeInput(dish.name)}
                ${dish.img ? `<img src="${dish.img}" alt="${sanitizeInput(dish.name)}">` : ''}
                <button onclick="document.getElementById('file-${dish.index}').click()">Sửa Ảnh</button>
                <input type="file" id="file-${dish.index}" accept="image/*" style="display:none" onchange="updateDishImage(${dish.index}, this)">
                <button onclick="deleteDishImage(${dish.index})">Xóa Ảnh</button>
                <button onclick="deleteDish(${dish.index})">Xóa Món</button>
            `;
            ul.appendChild(li);
        });
        accordion.appendChild(h4);
        accordion.appendChild(ul);
        dishListElem.appendChild(accordion);
    });
    renderTodayDishes(todayDishesElem);
}

// Render today dishes (giữ nguyên)
function renderTodayDishes(elem) {
    if (!elem) return;
    elem.innerHTML = '';
    todayDishes.forEach(dish => {
        const li = document.createElement('li');
        li.textContent = `${sanitizeInput(dish.name)} (${dish.group})`;
        elem.appendChild(li);
    });
}

// Toggle select (giữ nguyên)
function toggleSelect(index, selected) {
    dishes[index].selected = selected;
    if (checkStorageCapacity(dishes, 'dishes')) {
        saveToFirebase();
        renderTodayDishes(document.getElementById('today-dishes'));
    }
}

// Xóa món (giữ nguyên)
function deleteDish(index) {
    const deletedDish = dishes[index];
    dishes.splice(index, 1);
    todayDishes = todayDishes.filter(d => !(d.name === deletedDish.name && d.group === deletedDish.group));
    if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
        saveToFirebase();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
    }
}

// Cập nhật ảnh (giữ nguyên)
function updateDishImage(index, input) {
    if (index < 0 || index >= dishes.length) {
        console.error(`Lỗi updateDishImage: Chỉ số ${index} không hợp lệ`);
        alert('Lỗi: Món không tồn tại.');
        return;
    }
    const file = input.files[0];
    if (file) {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            alert('Vui lòng chọn file ảnh hợp lệ (jpg, png, gif).');
            return;
        }
        if (file.size > 1 * 1024 * 1024) { // Giới hạn 1MB
            alert('File ảnh quá lớn (tối đa 1MB). Vui lòng chọn ảnh nhỏ hơn.');
            return;
        }
        compressImage(file, function(compressedData) {
            if (compressedData) {
                dishes[index].img = compressedData;
                if (checkStorageCapacity(dishes, 'dishes')) {
                    saveToFirebase();
                    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
                    input.value = ''; // Reset input file
                }
            } else {
                console.error('Lỗi nén ảnh');
                alert('Lỗi: Không thể nén ảnh. Vui lòng thử file khác.');
            }
        });
    } else {
        alert('Vui lòng chọn một file ảnh.');
    }
}

// Xóa ảnh (giữ nguyên)
function deleteDishImage(index) {
    if (index >= 0 && index < dishes.length) {
        dishes[index].img = '';
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

// Lưu menu (giữ nguyên)
function saveTodayMenu() {
    todayDishes = dishes.filter(d => d.selected && d.name && dishes.some(dish => dish.name === d.name && dish.group === d.group));
    if (checkStorageCapacity(todayDishes, 'todayDishes')) {
        saveToFirebase();
        alert('Đã lưu menu hôm nay! Vui lòng kiểm tra trang Menu.');
        if (window.location.href.includes('admin.html')) {
            window.location.href = 'menu.html';
        }
    }
}

// Reset chọn (giữ nguyên)
function resetSelection() {
    dishes.forEach(d => d.selected = false);
    todayDishes = [];
    if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
        saveToFirebase();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
    }
}

// Thêm món mới (giữ nguyên)
const addDishFormSubmit = function(e) {
    e.preventDefault();
    const name = sanitizeInput(document.getElementById('dish-name').value);
    const group = document.getElementById('dish-group').value;
    const file = document.getElementById('dish-img').files[0];
    if (!name.trim()) {
        alert('Vui lòng nhập tên món.');
        return;
    }
    let img = '';
    const addDish = () => {
        dishes.push({ name, img, group, selected: false });
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
            this.reset();
        }
    };
    if (file) {
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            alert('Vui lòng chọn file ảnh hợp lệ (jpg, png, gif).');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            alert('File ảnh quá lớn (tối đa 1MB). Vui lòng chọn ảnh nhỏ hơn.');
            return;
        }
        compressImage(file, function(compressedData) {
            if (compressedData) {
                img = compressedData;
                addDish();
            } else {
                console.error('Lỗi nén ảnh khi thêm món');
                alert('Lỗi: Không thể nén ảnh mới. Vui lòng thử lại.');
            }
        });
    } else {
        addDish();
    }
};

// Load admin (sửa để sync realtime)
function loadAdmin() {
    syncFromFirebase(() => {
        initializeDishes();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
        document.getElementById('save-menu').addEventListener('click', saveTodayMenu);
        document.getElementById('reset-selection').addEventListener('click', resetSelection);
        document.getElementById('add-dish-form').addEventListener('submit', addDishFormSubmit);
    });
}

// Load menu hôm nay (sửa để sync realtime)
function loadTodayMenu() {
    syncFromFirebase(() => {
        const menuList = document.getElementById('menu-list');
        if (menuList) {
            menuList.innerHTML = `
                <h2>Menu Healthy Hôm Nay</h2>
                <div class="date-time-container">
                    <p class="date-time">Cập nhật lúc: ${new Date().toLocaleDateString('vi-VN')} - ${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</p>
                </div>
                <p>Giá theo thị trường và khẩu phần bạn chọn</p>
            `;
            const ul = document.createElement('ul');
            const grouped = todayDishes.reduce((acc, dish) => {
                if (!acc[dish.group]) acc[dish.group] = [];
                acc[dish.group].push(dish);
                return acc;
            }, {});
            Object.keys(grouped).sort().forEach(group => {
                const h4 = document.createElement('h4');
                h4.textContent = group;
                ul.appendChild(h4);
                grouped[group].forEach((dish, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `${index + 1}. ${sanitizeInput(dish.name)}`;
                    if (dish.img) {
                        const img = document.createElement('img');
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
    });
}

// Gọi loadTodayMenu nếu ở trang menu.html
if (window.location.href.includes('menu.html')) {
    loadTodayMenu();
}

// Load blog nếu ở blog.html (giữ nguyên, con không sửa vì không liên quan)
function loadBlog() {
    // Code blog nếu có, nhưng hiện tại file blog.html có form, con giữ nguyên
}

// Thêm hàm generate QR cho menu.html
function generateQR() {
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
        const url = window.location.href; // Hoặc thay bằng 'https://phuongnhunghealthy.com/menu.html'
        QRCode.toCanvas(qrContainer, url, { width: 200 }, function (error) {
            if (error) console.error(error);
        });
    }
}

// Thêm hàm download QR
function downloadQR() {
    const canvas = document.getElementById('qr-code');
    if (canvas) {
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'menu-qr.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
}

// Gọi generateQR nếu ở menu.html
if (window.location.href.includes('menu.html')) {
    generateQR();
}
