let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];

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

// Khởi tạo Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
}

// Sync dữ liệu từ Firebase
function syncFromFirebase(callback) {
    if (typeof firebase === 'undefined') {
        callback();
        return;
    }
    database.ref('dishes').once('value').then(snapshot => {
        if (snapshot.val()) {
            dishes = snapshot.val();
            localStorage.setItem('dishes', JSON.stringify(dishes));
        }
        database.ref('todayDishes').once('value').then(snapshot => {
            if (snapshot.val()) {
                todayDishes = snapshot.val();
                localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
            }
            callback();
        });
    }).catch(() => {
        console.error('Lỗi Firebase sync');
        callback();
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

// Nén ảnh (nếu lão gia cần, con giữ nguyên từ trước)
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
            const maxWidth = 800;
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
            }, 'image/jpeg', 0.7);
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
        if (testData.length > 5 * 1024 * 1024) {
            alert('Dung lượng dữ liệu quá lớn, không thể lưu.');
            return false;
        }
        localStorage.setItem(key, testData);
        return true;
    } catch (e) {
        alert('Lỗi lưu trữ: Dung lượng đầy.');
        return false;
    }
}

// Khởi tạo dishes (mẫu 67 món, con thêm đầy đủ)
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
        { name: 'Đậu phụ rán', img: '', group: 'Đậu', selected: false },
        { name: 'Đậu phụ sốt cà chua', img: '', group: 'Đậu', selected: false },
        { name: 'Trứng rán', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng luộc', img: '', group: 'Trứng', selected: false },
        { name: 'Cơm trắng', img: '', group: 'Cơm', selected: false },
        { name: 'Cơm gạo lứt', img: '', group: 'Cơm', selected: false },
        { name: 'Cơm trộn rau củ', img: '', group: 'Cơm', selected: false },
        { name: 'Nấm xào rau', img: '', group: 'Món Chay', selected: false },
        { name: 'Salad rau', img: '', group: 'Món Chay', selected: false },
        { name: 'Khác 1', img: '', group: 'Khác', selected: false },
        { name: 'Khác 2', img: '', group: 'Khác', selected: false },
    ];
    if (dishes.length === 0) {
        dishes = defaultDishes;
        localStorage.setItem('dishes', JSON.stringify(dishes));
    }
}

// Render dishes ở admin
function renderDishes(dishListElement, todayDishesElement, filter = '') {
    if (!dishListElement || !todayDishesElement) return;
    const scrollPosition = window.scrollY;
    dishListElement.innerHTML = '';
    const grouped = dishes.reduce((acc, dish, index) => {
        if (!acc[dish.group]) acc[dish.group] = [];
        if (!filter || dish.name.toLowerCase().includes(filter.toLowerCase())) {
            acc[dish.group].push({ ...dish, index });
        }
        return acc;
    }, {});
    Object.keys(grouped).sort().forEach(group => {
        const accordion = document.createElement('div');
        accordion.className = 'accordion';
        const h4 = document.createElement('h4');
        h4.textContent = group;
        const content = document.createElement('div');
        content.className = 'accordion-content';
        const ul = document.createElement('ul');
        grouped[group].forEach(dish => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" ${dish.selected ? 'checked' : ''} onchange="updateDishSelection(${dish.index}, this.checked, event)">
                <span>${sanitizeInput(dish.name)}</span>
            `;
            ul.appendChild(li);
        });
        content.appendChild(ul);
        accordion.appendChild(h4);
        accordion.appendChild(content);
        dishListElement.appendChild(accordion);
        h4.onclick = () => {
            content.classList.toggle('active');
        };
    });
    todayDishesElement.innerHTML = '';
    todayDishes.forEach(dish => {
        const li = document.createElement('li');
        li.innerHTML = `${sanitizeInput(dish.name)} (${dish.group})`;
        todayDishesElement.appendChild(li);
    });
    window.scrollTo(0, scrollPosition);
}

// Update selection
function updateDishSelection(index, selected, event) {
    event.stopPropagation();
    dishes[index].selected = selected;
    todayDishes = dishes.filter(d => d.selected);
    todayDishes.timestamp = new Date().toISOString();
    localStorage.setItem('dishes', JSON.stringify(dishes));
    localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
    saveToFirebase();
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
}

// Load admin
function loadAdmin() {
    syncFromFirebase(() => {
        initializeDishes();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
    });
}

// Load menu
function loadTodayMenu() {
    const menuList = document.getElementById('menu-list');
    syncFromFirebase(() => {
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
                ul.appendChild(li);
            });
        });
        menuList.appendChild(ul);
    });
}

if (window.location.href.includes('admin.html')) {
    loadAdmin();
}
if (window.location.href.includes('menu.html')) {
    loadTodayMenu();
}
