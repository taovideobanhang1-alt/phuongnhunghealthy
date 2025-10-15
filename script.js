let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Firebase config (lão gia thay bằng config thật nếu dùng)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
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
    if (dishes.length === 0) {
        dishes = defaultDishes;
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
        }
    }
}

// Hiển thị danh sách với accordion
function renderDishes(listEl, todayEl, searchQuery = '') {
    if (!listEl || !todayEl) return;
    if (dishes.length === 0) {
        initializeDishes();
    }

    const openGroups = [];
    const scrollPositions = {};
    document.querySelectorAll('.accordion-content.active').forEach(content => {
        const header = content.previousElementSibling;
        const groupText = header.textContent.trim();
        const group = groupText.substring(0, groupText.lastIndexOf(' (')).trim();
        openGroups.push(group);
        scrollPositions[group] = content.scrollTop;
    });

    listEl.innerHTML = '';
    todayEl.innerHTML = '';
    const groups = [...new Set(dishes.map(d => d.group))].sort();
    if (groups.length === 0) {
        listEl.innerHTML = '<p>Chưa có món nào. Vui lòng thêm món mới.</p>';
        return;
    }

    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'accordion';
        const h4 = document.createElement('h4');
        h4.innerHTML = `${group} (${dishes.filter(d => d.group === group).length}) <span class="arrow">&#9660;</span>`;
        h4.onclick = () => toggleAccordion(h4);
        groupDiv.appendChild(h4);

        const ul = document.createElement('ul');
        ul.className = 'accordion-content';
        if (openGroups.includes(group)) {
            ul.classList.add('active');
            h4.querySelector('.arrow').innerHTML = '&#9650;';
        }

        dishes.forEach((dish, globalIndex) => {
            if (dish.group === group) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <input type="checkbox" ${dish.selected ? 'checked' : ''} onchange="toggleSelect(${globalIndex})">
                    ${sanitizeInput(dish.name)} ${dish.img ? `<img src="${dish.img}" alt="${sanitizeInput(dish.name)}" style="width:30px;height:30px;">` : ''}
                    <input type="file" id="img-${globalIndex}" accept="image/jpeg,image/png,image/gif" onchange="updateDishImage(${globalIndex}, this)" style="display:none;">
                    <button onclick="document.getElementById('img-${globalIndex}').click()">Thay Ảnh</button>
                    <button onclick="deleteDishImage(${globalIndex})">Xóa Ảnh</button>
                    <button onclick="confirmDeleteDish(${globalIndex})">Xóa Món</button>
                `;
                ul.appendChild(li);
            }
        });
        groupDiv.appendChild(ul);
        listEl.appendChild(groupDiv);
        if (openGroups.includes(group)) {
            ul.scrollTop = scrollPositions[group] || 0;
        }
    });

    // Update real-time "Món Hôm Nay"
    const selectedDishes = dishes.filter(d => d.selected && d.name);
    const groupedSelected = selectedDishes.reduce((acc, dish) => {
        if (!acc[dish.group]) acc[dish.group] = [];
        acc[dish.group].push(dish);
        return acc;
    }, {});
    Object.keys(groupedSelected).sort().forEach(group => {
        const h4 = document.createElement('h4');
        h4.textContent = group;
        todayEl.appendChild(h4);
        groupedSelected[group].forEach((dish, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${index + 1}. ${sanitizeInput(dish.name)} ${dish.img ? `<img src="${dish.img}" alt="${sanitizeInput(dish.name)}" style="width:30px;height:30px;">` : ''}`;
            todayEl.appendChild(li);
        });
    });
}

// Toggle accordion
function toggleAccordion(element) {
    const content = element.nextElementSibling;
    content.classList.toggle('active');
    element.querySelector('.arrow').innerHTML = content.classList.contains('active') ? '&#9650;' : '&#9660;';
}

// Toggle chọn món
function toggleSelect(index) {
    if (index >= 0 && index < dishes.length) {
        dishes[index].selected = !dishes[index].selected;
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    } else {
        console.error(`Lỗi toggleSelect: Chỉ số ${index} không hợp lệ`);
        alert('Lỗi: Không thể chọn món. Vui lòng thử lại.');
    }
}

// Xóa món với confirm
function confirmDeleteDish(index) {
    if (index >= 0 && index < dishes.length && confirm('Bạn có chắc muốn xóa món này không?')) {
        const deletedDish = dishes[index];
        dishes.splice(index, 1);
        todayDishes = todayDishes.filter(d => !(d.name === deletedDish.name && d.group === deletedDish.group));
        if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

// Cập nhật ảnh
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

// Xóa ảnh
function deleteDishImage(index) {
    if (index >= 0 && index < dishes.length) {
        dishes[index].img = '';
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

// Lưu menu
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

// Reset chọn
function resetSelection() {
    dishes.forEach(d => d.selected = false);
    todayDishes = [];
    if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
        saveToFirebase();
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
    }
}

// Thêm món mới
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
