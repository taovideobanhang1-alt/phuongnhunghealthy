<!-- File 7: script.js (JS chung cho quản lý) -->
// Quản lý Menu
let dishes = JSON.parse(localStorage.getItem('dishes')) || [];
let todayDishes = JSON.parse(localStorage.getItem('todayDishes')) || [];

// Hàm load menu cho trang menu.html
function loadMenu() {
    const menuList = document.getElementById('menu-list');
    if (menuList) {
        menuList.innerHTML = '';
        todayDishes.forEach(dish => {
            const item = document.createElement('div');
            item.classList.add('menu-item');
            item.innerHTML = `
                <img src="${dish.img}" alt="${dish.name}">
                <h3>${dish.name}</h3>
                <p>${dish.price} - ${dish.desc}</p>
            `;
            menuList.appendChild(item);
        });
    }
}

// Hàm load admin cho trang admin.html
function loadAdmin() {
    const addForm = document.getElementById('add-dish-form');
    const dishList = document.getElementById('dish-list');
    const todayList = document.getElementById('today-dishes');
    const saveBtn = document.getElementById('save-menu');

    if (addForm) {
        addForm.addEventListener('submit', addDish);
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', saveTodayMenu);
    }
    renderDishes(dishList, todayList);
}

function addDish(e) {
    e.preventDefault();
    const name = document.getElementById('dish-name').value;
    const price = document.getElementById('dish-price').value;
    const desc = document.getElementById('dish-desc').value;
    const img = document.getElementById('dish-img').value;
    dishes.push({ name, price, desc, img, selected: false });
    localStorage.setItem('dishes', JSON.stringify(dishes));
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
    addForm.reset();
}

function renderDishes(listEl, todayEl) {
    if (listEl) listEl.innerHTML = '';
    if (todayEl) todayEl.innerHTML = '';
    dishes.forEach((dish, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${dish.selected ? 'checked' : ''} onchange="toggleSelect(${index})">
            ${dish.name} - ${dish.price} - ${dish.desc} <img src="${dish.img}" alt="${dish.name}" style="width:50px;height:50px;">
            <button onclick="deleteDish(${index})">Xóa</button>
        `;
        if (listEl) listEl.appendChild(li);

        if (dish.selected && todayEl) {
            const todayLi = document.createElement('li');
            todayLi.textContent = `${dish.name} - ${dish.price}`;
            todayEl.appendChild(todayLi);
        }
    });
}

function toggleSelect(index) {
    dishes[index].selected = !dishes[index].selected;
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
}

function deleteDish(index) {
    dishes.splice(index, 1);
    localStorage.setItem('dishes', JSON.stringify(dishes));
    renderDishes(document.getElementById('dish-list'), document.getElementById('today-dishes'));
}

function saveTodayMenu() {
    todayDishes = dishes.filter(dish => dish.selected);
    localStorage.setItem('todayDishes', JSON.stringify(todayDishes));
    alert('Đã lưu menu hôm nay! Xem ở trang Menu.');
}

// Quản lý Blog
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// Hàm load blog cho trang blog.html
function loadBlog() {
    const addForm = document.getElementById('add-post-form');
    const postsDiv = document.getElementById('blog-posts');

    if (addForm) {
        addForm.addEventListener('submit', addPost);
    }
    renderPosts(postsDiv);
}

function addPost(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const img = document.getElementById('post-img').value;
    posts.push({ title, content, img });
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts(document.getElementById('blog-posts'));
    addForm.reset();
}

function renderPosts(divEl) {
    if (divEl) divEl.innerHTML = '';
    posts.forEach((post, index) => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('blog-post');
        postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <img src="${post.img}" alt="${post.title}">
            <p>${post.content}</p>
            <button onclick="deletePost(${index})">Xóa Bài</button>
        `;
        if (divEl) divEl.appendChild(postDiv);
    });
}

function deletePost(index) {
    posts.splice(index, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
    renderPosts(document.getElementById('blog-posts'));
}