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
        // ... (Giữ nguyên như trước, con cắt ngắn để artifact gọn)
    ];
    if (dishes.length === 0) {
        dishes = defaultDishes;
        checkStorageCapacity(dishes, 'dishes');
    }
}

// Render danh sách món
function renderDishes(dishListElement, todayDishesElement, filter = '') {
    if (!dishListElement || !todayDishesElement) return;
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
                ${dish.img ? `<img src="${dish.img}" alt="${sanitizeInput(dish.name)}">` : ''}
                <button onclick="updateDishImage(${dish.index}, this.previousElementSibling)">Cập nhật ảnh</button>
                <input type="file" accept="image/*" style="display: none;" onchange="updateDishImage(${dish.index}, this)">
                <button onclick="deleteDishImage(${dish.index})">Xóa ảnh</button>
                <button onclick="deleteDish(${dish.index})">Xóa món</button>
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
}

// Cập nhật trạng thái chọn món
function updateDishSelection(index, selected, event) {
    event.stopPropagation(); // Ngăn bubbling lên accordion
    if (index >= 0 && index < dishes.length) {
        dishes[index].selected = selected;
        if (checkStorageCapacity(dishes, 'dishes')) {
            saveToFirebase(); // Đồng bộ Firebase ngay
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), ''); // Render realtime
        }
    }
}

// Xóa món
function deleteDish(index) {
    if (index >= 0 && index < dishes.length) {
        const deletedDish = dishes.splice(index, 1)[0];
        todayDishes = todayDishes.filter(d => !(d.name === deletedDish.name && d.group === deletedDish.group));
        if (checkStorageCapacity(dishes, 'dishes') && checkStorageCapacity(todayDishes, 'todayDishes')) {
            saveToFirebase();
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        }
    }
}

// Cập nhật ảnh (giữ nguyên)

// Xóa ảnh (giữ nguyên)

// Lưu menu
function saveTodayMenu() {
    todayDishes = dishes.filter(d => d.selected && d.name && dishes.some(dish => dish.name === d.name && dish.group === d.group));
    todayDishes.timestamp = new Date().toISOString();
    if (checkStorageCapacity(todayDishes, 'todayDishes')) {
        saveToFirebase();
        alert('Đã lưu menu hôm nay! Vui lòng kiểm tra trang Menu.');
        if (window.location.href.includes('admin.html')) {
            window.location.href = 'menu.html';
        }
    }
}

// Reset chọn (giữ nguyên)

// Thêm món mới (giữ nguyên)

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
    const menuList = document.getElementById('menu-list');
    const qrCodeDiv = document.getElementById('qr-code');
    const downloadQrBtn = document.getElementById('download-qr');
    
    let qrInstance; // Để lưu QR instance cho tải xuống
    
    const renderMenu = (dishes, timestamp) => {
        if (!menuList) return;
        menuList.innerHTML = `
            <h2>Menu Healthy Hôm Nay</h2>
            <div class="date-time-container">
                <p class="date-time">Cập nhật lúc: ${new Date(timestamp || new Date()).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
            <p>Giá theo thị trường và khẩu phần bạn chọn</p>
        `;
        const ul = document.createElement('ul');
        const grouped = dishes.reduce((acc, dish) => {
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
        
        if (qrCodeDiv) {
            qrCodeDiv.innerHTML = '<p>Quét mã QR để xem menu mới nhất</p>';
            const qrText = window.location.origin + window.location.pathname; // URL tĩnh
            qrInstance = new QRCode(qrCodeDiv, {
                text: qrText,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        
        if (downloadQrBtn) {
            downloadQrBtn.onclick = () => {
                const qrCanvas = qrCodeDiv.querySelector('canvas');
                if (qrCanvas) {
                    const link = document.createElement('a');
                    link.href = qrCanvas.toDataURL('image/png');
                    link.download = 'menu-qr.png';
                    link.click();
                } else {
                    alert('QR chưa sẵn sàng, vui lòng thử lại.');
                }
            };
        }
    };

    if (typeof firebase !== 'undefined') {
        database.ref('todayDishes').on('value', snapshot => {
            if (snapshot.val()) {
                todayDishes = snapshot.val();
                localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
                renderMenu(todayDishes, todayDishes.timestamp);
            } else {
                todayDishes = [];
                localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
                renderMenu(todayDishes, new Date().toISOString());
            }
        });
    } else {
        syncFromFirebase(() => {
            renderMenu(todayDishes, todayDishes.timestamp);
        });
    }
}

// Gọi loadTodayMenu nếu ở trang menu.html
if (window.location.href.includes('menu.html')) {
    loadTodayMenu();
}
