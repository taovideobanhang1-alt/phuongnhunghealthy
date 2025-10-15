let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Firebase config (giữ nguyên config thực của lão gia)
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

// Khởi tạo 67 món đầy đủ
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
        { name: 'Rau cải luộc', img: '', group: 'Rau', selected: false },
        { name: 'Rau muống xào tỏi', img: '', group: 'Rau', selected: false },
        { name: 'Rau cải ngọt xào', img: '', group: 'Rau', selected: false },
        { name: 'Bắp cải luộc', img: '', group: 'Rau', selected: false },
        { name: 'Đậu phụ chiên', img: '', group: 'Đậu', selected: false },
        { name: 'Đậu phụ sốt cà chua', img: '', group: 'Đậu', selected: false },
        { name: 'Đậu phụ om nấm', img: '', group: 'Đậu', selected: false },
        { name: 'Đậu phụ kho nấm', img: '', group: 'Đậu', selected: false },
        { name: 'Trứng chiên', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng ốp la', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng luộc', img: '', group: 'Trứng', selected: false },
        { name: 'Trứng rán cà chua', img: '', group: 'Trứng', selected: false },
        { name: 'Cơm trắng', img: '', group: 'Cơm', selected: false },
        { name: 'Cơm gạo lứt', img: '', group: 'Cơm', selected: false },
        { name: 'Cơm chiên rau củ', img: '', group: 'Cơm', selected: false },
        { name: 'Nấm xào thập cẩm', img: '', group: 'Món Chay', selected: false },
        { name: 'Đậu hũ kho nấm rơm', img: '', group: 'Món Chay', selected: false },
        { name: 'Rau củ luộc thập cẩm', img: '', group: 'Món Chay', selected: false },
        { name: 'Nấm rơm kho tiêu', img: '', group: 'Món Chay', selected: false },
        { name: 'Canh rau cải', img: '', group: 'Món Chay', selected: false },
        { name: 'Canh bí đỏ', img: '', group: 'Món Chay', selected: false },
        { name: 'Canh nấm kim châm', img: '', group: 'Món Chay', selected: false },
        { name: 'Canh rong biển', img: '', group: 'Món Chay', selected: false },
        { name: 'Canh chua chay', img: '', group: 'Món Chay', selected: false },
        { name: 'Nước ép cà rốt', img: '', group: 'Khác', selected: false },
        { name: 'Nước ép táo', img: '', group: 'Khác', selected: false },
        { name: 'Nước ép dứa', img: '', group: 'Khác', selected: false },
        { name: 'Salad rau trộn', img: '', group: 'Khác', selected: false },
        { name: 'Salad cá ngừ', img: '', group: 'Khác', selected: false },
        { name: 'Khoai lang luộc', img: '', group: 'Khác', selected: false },
        { name: 'Khoai tây chiên', img: '', group: 'Khác', selected: false }
    ];
    if (dishes.length === 0) {
        dishes = defaultDishes;
        localStorage.setItem('dishes', JSON.stringify(dishes));
        saveToFirebase(); // Đồng bộ lên Firebase ngay khi khởi tạo
    }
}

// Render danh sách món (giữ nguyên)
function renderDishes(dishListElem, todayDishesElem, searchTerm = '') {
    if (!dishListElem || !todayDishesElem) return;
    dishListElem.innerHTML = '';
    const grouped = dishes.reduce((acc, dish, index) => {
        if (!acc[dish.group]) acc[dish.group] = [];
        if (!searchTerm || dish.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            acc[dish.group].push({ ...dish, index });
        }
        return acc;
    }, {});
    Object.keys(grouped).sort().forEach(group => {
        const div = document.createElement('div');
        div.className = 'accordion';
        const h4 = document.createElement('h4');
        h4.textContent = group;
        h4.onclick = () => {
            const content = div.querySelector('.accordion-content');
            content.classList.toggle('active');
        };
        const content = document.createElement('div');
        content.className = 'accordion-content active';
        const ul = document.createElement('ul');
        grouped[group].forEach(dish => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = dish.selected;
            checkbox.onchange = () => toggleSelect(dish.index);
            li.appendChild(checkbox);
            if (dish.img) {
                const img = document.createElement('img');
                img.src = dish.img;
                img.alt = sanitizeInput(dish.name);
                li.appendChild(img);
            }
            const span = document.createElement('span');
            span.textContent = sanitizeInput(dish.name);
            li.appendChild(span);
            const imgInput = document.createElement('input');
            imgInput.type = 'file';
            imgInput.accept = 'image/*';
            imgInput.onchange = (e) => updateDishImage(dish.index, e.target);
            li.appendChild(imgInput);
            const deleteImgBtn = document.createElement('button');
            deleteImgBtn.textContent = 'Xóa ảnh';
            deleteImgBtn.onclick = () => deleteDishImage(dish.index);
            li.appendChild(deleteImgBtn);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Xóa món';
            deleteBtn.onclick = () => deleteDish(dish.index);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
        });
        content.appendChild(ul);
        div.appendChild(h4);
        div.appendChild(content);
        dishListElem.appendChild(div);
    });
    todayDishesElem.innerHTML = '';
    todayDishes.forEach((dish, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${sanitizeInput(dish.name)} (${dish.group})`;
        todayDishesElem.appendChild(li);
    });
}

// Các hàm khác giữ nguyên
function toggleSelect(index) {
    if (index >= 0 && index < dishes.length) {
        dishes[index].selected = !dishes[index].selected;
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

function deleteDish(index) {
    if (index >= 0 && index < dishes.length) {
        const deletedDish = dishes[index];
        dishes.splice(index, 1);
        todayDishes = todayDishes.filter(d => !(d.name === deletedDish.name && d.group === deletedDish.group));
        if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

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
        if (file.size > 1 * 1024 * 1024) {
            alert('File ảnh quá lớn (tối đa 1MB). Vui lòng chọn ảnh nhỏ hơn.');
            return;
        }
        compressImage(file, function(compressedData) {
            if (compressedData) {
                dishes[index].img = compressedData;
                if (checkStorageCapacity(dishes, 'dishes')) {
                    saveToFirebase();
                    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
                    input.value = '';
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

function deleteDishImage(index) {
    if (index >= 0 && index < dishes.length) {
        dishes[index].img = '';
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

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

function resetSelection() {
    dishes.forEach(d => d.selected = false);
    todayDishes = [];
    if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
        saveToFirebase();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
    }
}

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

// Load admin
function loadAdmin() {
    syncFromFirebase(() => {
        initializeDishes();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
        document.getElementById('save-menu').addEventListener('click', saveTodayMenu);
        document.getElementById('reset-selection').addEventListener('click', resetSelection);
        document.getElementById('add-dish-form').addEventListener('submit', addDishFormSubmit);
    });
}

// Load menu hôm nay
function loadTodayMenu() {
    syncFromFirebase(() => {
        const menuList = document.getElementById('menu-list');
        if (menuList) {
            menuList.innerHTML = `
                <h2>Menu Healthy Hôm Nay</h2>
                <div class="date-time-container">
                    <p class="date-time">Menu ngày hôm nay: ${new Date().toLocaleDateString('vi-VN')} - Cập nhật lúc: ${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} (thời gian thực)</p>
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
