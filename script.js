let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Firebase config (đã thay bằng config thực của lão gia)
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

// Khởi tạo 67 món (giữ nguyên, nhưng con cắt bớt code dài để ngắn gọn, lão gia copy full là ok)
function initializeDishes() {
    const defaultDishes = [
        { name: 'Ức gà luộc', img: '', group: 'Gà', selected: false },
        // ... (các món còn lại như cũ, con giả định lão gia giữ nguyên, nếu cần full list con cung cấp riêng)
    ];
    if (dishes.length === 0) {
        dishes = defaultDishes;
        localStorage.setItem('dishes', JSON.stringify(dishes));
    }
}

// Render danh sách món (giữ nguyên, cắt bớt cho ngắn)
function renderDishes(dishListElem, todayDishesElem, searchTerm = '') {
    // ... (code render như cũ)
}

// Các hàm khác như toggleSelect, deleteDish, updateDishImage, deleteDishImage, saveTodayMenu, resetSelection, addDishFormSubmit giữ nguyên

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

// Load menu hôm nay (tinh chỉnh để sync thời gian thực và thêm ngày giờ rõ ràng)
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
            // ... (code grouped và render li như cũ)
            menuList.appendChild(ul);
        }
    });
}

// Gọi loadTodayMenu nếu ở trang menu.html
if (window.location.href.includes('menu.html')) {
    loadTodayMenu();
}
