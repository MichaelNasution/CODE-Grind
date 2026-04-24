// IT Del Library Web App Logic

// --- State Management ---
const state = {
    books: [
        { id: 'B001', title: 'Mastering Java Programming', author: 'John Doe', publisher: 'Informatika', year: 2022, total: 5, available: 5, cover: 'java.png' },
        { id: 'B002', title: 'Algorithms and Data Structures', author: 'Jane Smith', publisher: 'Teknos', year: 2021, total: 3, available: 0, cover: 'algo.png' },
        { id: 'B003', title: 'Database Systems Design', author: 'David Lee', publisher: 'DataPress', year: 2023, total: 1, available: 1, cover: 'db.png' },
        { id: 'B004', title: 'Web Development with React', author: 'Michael Scott', publisher: 'Dunder Press', year: 2023, total: 4, available: 4, cover: 'java.png' }, // Placeholder cover
        { id: 'B005', title: 'Machine Learning Basics', author: 'Alan Turing', publisher: 'Future Pub', year: 2024, total: 2, available: 2, cover: 'algo.png' }
    ],
    users: {
        '12S24003': { name: 'Michael Nasution', role: 'student', password: 'sevenlake', borrowed: [], reservations: [], fines: 0 },
        '12S21001': { name: 'Budi Santoso', role: 'student', password: 'password123', borrowed: [], reservations: [], fines: 5000 },
        'L001': { name: 'Ani Yanti', role: 'librarian', password: 'admin' }
    },
    currentUser: null,
    currentView: 'home',
    selectedBook: null
};

// --- Initialization ---
function init() {
    loadFromLocalStorage();
    renderBooks();
    setupEventListeners();
    updateUserUI();
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('library_state');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.books = parsed.books || state.books;
        state.users = parsed.users || state.users;
    }
}

function saveToLocalStorage() {
    localStorage.setItem('library_state', JSON.stringify({
        books: state.books,
        users: state.users
    }));
}

// --- UI Rendering ---
function renderBooks(filter = '') {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = '';

    const filtered = state.books.filter(b => 
        b.title.toLowerCase().includes(filter.toLowerCase()) || 
        b.author.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card fade-in';
        card.innerHTML = `
            <div class="book-cover-wrapper">
                <img src="${book.cover}" alt="${book.title}">
            </div>
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.author}</p>
            </div>
        `;
        card.onclick = () => showBookDetail(book);
        grid.appendChild(card);
    });
}

function showBookDetail(book) {
    state.selectedBook = book;
    document.getElementById('modal-cover').src = book.cover;
    document.getElementById('modal-title').innerText = book.title;
    document.getElementById('modal-author').innerText = book.author;
    document.getElementById('modal-available').innerText = `${book.available}/${book.total}`;
    document.getElementById('modal-publisher').innerText = book.publisher;
    document.getElementById('modal-year').innerText = book.year;

    const borrowBtn = document.getElementById('borrow-btn');
    const reserveBtn = document.getElementById('reserve-btn');

    if (book.available > 0) {
        borrowBtn.innerText = 'Borrow Book';
        borrowBtn.disabled = false;
        reserveBtn.style.display = 'none';
    } else {
        borrowBtn.innerText = 'Out of Stock';
        borrowBtn.disabled = true;
        reserveBtn.style.display = 'block';
    }

    document.getElementById('book-modal').style.display = 'flex';
}

function updateUserUI() {
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const adminNav = document.getElementById('admin-nav');
    const loginNav = document.getElementById('login-nav');

    if (state.currentUser) {
        userName.innerText = state.currentUser.name;
        userAvatar.innerText = state.currentUser.name.charAt(0);
        loginNav.innerHTML = '<span class="material-symbols-outlined">logout</span>Logout';
        adminNav.style.display = state.currentUser.role === 'librarian' ? 'flex' : 'none';
    } else {
        userName.innerText = 'Guest';
        userAvatar.innerText = 'G';
        loginNav.innerHTML = '<span class="material-symbols-outlined">login</span>Login';
        adminNav.style.display = 'none';
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    // Search
    document.getElementById('search-input').oninput = (e) => renderBooks(e.target.value);

    // Modals
    document.getElementById('close-modal').onclick = () => {
        document.getElementById('book-modal').style.display = 'none';
    };

    document.getElementById('login-nav').onclick = () => {
        if (state.currentUser) {
            state.currentUser = null;
            updateUserUI();
            alert('Logged out successfully');
        } else {
            document.getElementById('login-modal').style.display = 'flex';
        }
    };

    document.getElementById('cancel-login').onclick = () => {
        document.getElementById('login-modal').style.display = 'none';
    };

    // Actions
    document.getElementById('do-login').onclick = handleLogin;
    document.getElementById('borrow-btn').onclick = handleBorrow;
    document.getElementById('reserve-btn').onclick = handleReserve;

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            state.currentView = item.dataset.view;
            renderView();
        };
    });
}

function handleLogin() {
    const id = document.getElementById('login-userid').value;
    const pass = document.getElementById('login-password').value;

    const user = state.users[id];
    if (user && user.password === pass) {
        state.currentUser = { ...user, id };
        document.getElementById('login-modal').style.display = 'none';
        updateUserUI();
        alert(`Welcome back, ${user.name}!`);
    } else {
        alert('Invalid credentials');
    }
}

function handleBorrow() {
    if (!state.currentUser) {
        alert('Please login to borrow books');
        return;
    }
    
    if (state.currentUser.role !== 'student') {
        alert('Only students can borrow books');
        return;
    }

    const book = state.selectedBook;
    const user = state.users[state.currentUser.id];

    if (user.borrowed.length >= 3) {
        alert('You have reached the maximum borrow limit (3 books)');
        return;
    }

    book.available--;
    user.borrowed.push({
        id: book.id,
        title: book.title,
        date: new Date().toISOString().split('T')[0],
        due: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    saveToLocalStorage();
    showBookDetail(book);
    renderBooks();
    alert(`Successfully borrowed ${book.title}`);
}

function handleReserve() {
    if (!state.currentUser) {
        alert('Please login to reserve books');
        return;
    }

    const book = state.selectedBook;
    const user = state.users[state.currentUser.id];

    if (user.reservations.includes(book.id)) {
        alert('You already have an active reservation for this book');
        return;
    }

    user.reservations.push(book.id);
    saveToLocalStorage();
    alert(`Reservation placed for ${book.title}. You will be notified when it becomes available.`);
}

function renderView() {
    const mainView = document.getElementById('main-view');
    
    if (state.currentView === 'home') {
        mainView.innerHTML = `
            <h1 class="view-title">Browse Library</h1>
            <div class="book-grid" id="book-grid"></div>
        `;
        renderBooks();
    } else if (state.currentView === 'my-library') {
        if (!state.currentUser) {
            mainView.innerHTML = `<h1 class="view-title">Please login to see your library</h1>`;
            return;
        }
        
        const user = state.users[state.currentUser.id];
        mainView.innerHTML = `
            <h1 class="view-title">My Library</h1>
            <div style="background: var(--secondary-bg); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                <h3>Active Loans</h3>
                <div id="my-loans">
                    ${user.borrowed.length === 0 ? '<p style="color: var(--text-secondary);">No active loans</p>' : ''}
                    <ul style="list-style: none; margin-top: 16px;">
                        ${user.borrowed.map(l => `
                            <li style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                                <span>${l.title}</span>
                                <span style="color: var(--text-secondary);">Due: ${l.due}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            <div style="background: var(--secondary-bg); padding: 24px; border-radius: 12px;">
                <h3>Current Fines</h3>
                <p style="font-size: 24px; font-weight: 600; margin-top: 8px; color: ${user.fines > 0 ? '#d93025' : 'var(--primary)'}">
                    Rp ${user.fines.toLocaleString()}
                </p>
                ${user.fines > 0 ? '<button class="btn btn-primary" style="margin-top: 16px;">Pay Fines</button>' : ''}
            </div>
        `;
    }
}

// Start the app
init();
