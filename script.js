// Khởi tạo dữ liệu
let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Hàm chống XSS
function sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/[<>]/g, '');
}

// Khởi tạo 67 món theo yêu cầu (thêm "Khác")
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
    if (dishes.length < 67) {
        dishes = defaultDishes;
        localStorage.setItem('dishes', JSON.stringify(dishes));
    }
}

// Hiển thị danh sách với accordion, giữ state mở khi tick, giữ position cuộn
function renderDishes(listEl, todayEl, searchQuery = '') {
    const openGroups = [];
    const scrollPositions = {};
    document.querySelectorAll('.accordion-content.active').forEach(content => {
        const header = content.previousElementSibling;
        const group = header.textContent.split(' ')[0];
        openGroups.push(group);
        scrollPositions[group] = content.scrollTop;
    });

    listEl.innerHTML = '';
    todayEl.innerHTML = '';
    const groups = [...new Set(dishes.map(d => d.group))].sort();
    groups.forEach(group => {
        const groupDishes = dishes.filter(d => d.group === group && d.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (groupDishes.length > 0) {
            const groupDiv = document.createElement('div');
            groupDiv.classList.add('accordion');
            groupDiv.innerHTML = `<h4 onclick="toggleAccordion(this)">${group} (${groupDishes.length} món) <span class="arrow">&#9660;</span></h4>`;
            const ul = document.createElement('ul');
            ul.classList.add('accordion-content');
            if (openGroups.includes(group)) {
                ul.classList.add('active');
                groupDiv.querySelector('.arrow').innerHTML = '&#9650;';
            }
            groupDishes.forEach((dish) => {
                const globalIndex = dishes.findIndex(d => d.name === dish.name && d.group === dish.group);
                if (globalIndex !== -1) {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <input type="checkbox" ${dishes[globalIndex].selected ? 'checked' : ''} onchange="toggleSelect(${globalIndex})">
                        ${sanitizeInput(dish.name)}
                        ${dish.img ? `<img src="${dish.img}" alt="${sanitizeInput(dish.name)}" style="width:30px;height:30px;">` : '<span>Chưa có ảnh</span>'}
                        <input type="file" id="img-${globalIndex}" accept="image/*" onchange="updateDishImage(${globalIndex}, this)" style="display:none;">
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
        }
    });

    // Update real-time "Món Hôm Nay" sắp xếp theo group
    const selectedDishes = dishes.filter(d => d.selected);
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
    dishes[index].selected = !dishes[index].selected;
    localStorage.setItem('dishes', JSON.stringify(dishes));
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
}

// Xóa món với confirm
function confirmDeleteDish(index) {
    if (confirm('Bạn có chắc muốn xóa món này không?')) {
        dishes.splice(index, 1);
        localStorage.setItem('dishes', JSON.stringify(dishes));
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
    }
}

// Cập nhật ảnh
function updateDishImage(index, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            dishes[index].img = e.target.result;
            localStorage.setItem('dishes', JSON.stringify(dishes));
            renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        };
        reader.readAsDataURL(file);
    }
}

// Xóa ảnh
function deleteDishImage(index) {
    dishes[index].img = '';
    localStorage.setItem('dishes', JSON.stringify(dishes));
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
}

// Lưu menu
function saveTodayMenu() {
    todayDishes = dishes.filter(d => d.selected);
    localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
    alert('Đã lưu menu hôm nay! Vui lòng kiểm tra trang Menu.');
    if (window.location.href.includes('admin.html')) {
        window.location.href = 'menu.html';
    }
}

// Reset chọn
function resetSelection() {
    dishes.forEach(d => d.selected = false);
    localStorage.setItem('dishes', JSON.stringify(dishes));
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
}

// Thêm món mới
const addDishFormSubmit = function(e) {
    e.preventDefault();
    const name = sanitizeInput(document.getElementById('dish-name').value);
    const group = document.getElementById('dish-group').value;
    const file = document.getElementById('dish-img').files[0];
    let img = '';
    const addDish = () => {
        dishes.push({ name, img, group, selected: false });
        localStorage.setItem('dishes', JSON.stringify(dishes));
        renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'), '');
        this.reset();
    };
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img = e.target.result;
            addDish();
        };
        reader.readAsDataURL(file);
    } else {
        addDish();
    }
};

// Load admin
function loadAdmin() {
    initializeDishes();
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
    document.getElementById('save-menu').addEventListener('click', saveTodayMenu);
    document.getElementById('reset-selection').addEventListener('click', resetSelection);
    document.getElementById('add-dish-form').addEventListener('submit', addDishFormSubmit);
}

// Load menu hôm nay cho trang menu.html
function loadTodayMenu() {
    const menuList = document.getElementById('menu-list');
    if (menuList) {
        menuList.innerHTML = '<h2>Menu Healthy Hôm Nay</h2><p>Giá theo thị trường và khẩu phần bạn chọn</p>';
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
}

// Gọi loadTodayMenu nếu ở trang menu.html
if (window.location.href.includes('menu.html')) {
    loadTodayMenu();
}
