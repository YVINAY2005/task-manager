/**
 * app.js - Main frontend logic for TaskMaster
 * Added some basic validation and error handling.
 * 
 * NOTE: I'm using vanilla JS here to keep it simple as requested.
 */

const API_URL = 'http://localhost:5000/api';

// Global state
const state = {
    user: null,
    token: null,
    tasks: [],
    pagination: {
        page: 1,
        totalPages: 1
    },
    filters: {
        search: '',
        status: 'All',
        sort: 'newest',
        page: 1,
        limit: 6
    }
};

// DOM References
const dom = {
    authSection: document.getElementById('authSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    loginCard: document.getElementById('loginCard'),
    registerCard: document.getElementById('registerCard'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    taskForm: document.getElementById('taskForm'),
    taskGrid: document.getElementById('taskGrid'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    emptyState: document.getElementById('emptyState'),
    pagination: document.getElementById('pagination'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    sortSelect: document.getElementById('sortSelect'),
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    navLinks: document.getElementById('navLinks'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    loggedOutLinks: document.getElementById('loggedOutLinks'),
    loggedInLinks: document.getElementById('loggedInLinks')
};

// --- Initialization ---
function init() {
    loadLocalAuth();
    setupEventListeners();
}

// Check if we already have a session in localStorage
function loadLocalAuth() {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        state.user = JSON.parse(savedUser);
        state.token = savedToken;
        updateUIForAuthState();
        fetchTasks();
    } else {
        updateUIForAuthState();
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    // Auth Toggles
    document.getElementById('toRegister').addEventListener('click', (e) => {
        e.preventDefault();
        dom.loginCard.classList.add('hidden');
        dom.registerCard.classList.remove('hidden');
    });

    document.getElementById('toLogin').addEventListener('click', (e) => {
        e.preventDefault();
        dom.registerCard.classList.add('hidden');
        dom.loginCard.classList.remove('hidden');
    });

    document.getElementById('showLoginBtn').addEventListener('click', () => {
        dom.loginCard.classList.remove('hidden');
        dom.registerCard.classList.add('hidden');
        dom.authSection.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        dom.registerCard.classList.remove('hidden');
        dom.loginCard.classList.add('hidden');
        dom.authSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Form Submissions
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.registerForm.addEventListener('submit', handleRegister);
    dom.taskForm.addEventListener('submit', handleTaskSubmit);

    // Dashboard Controls
    dom.logoutBtn.addEventListener('click', logout);
    dom.addTaskBtn.addEventListener('click', () => openTaskModal());
    
    dom.searchInput.addEventListener('input', debounce(() => {
        state.filters.search = dom.searchInput.value;
        state.filters.page = 1;
        fetchTasks();
    }, 500));

    dom.statusFilter.addEventListener('change', () => {
        state.filters.status = dom.statusFilter.value;
        state.filters.page = 1;
        fetchTasks();
    });

    dom.sortSelect.addEventListener('change', () => {
        state.filters.sort = dom.sortSelect.value;
        state.filters.page = 1;
        fetchTasks();
    });

    // Modal
    document.getElementById('closeModal').addEventListener('click', closeTaskModal);
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Mobile Menu
    dom.mobileMenuToggle.addEventListener('click', () => {
        dom.navLinks.classList.toggle('show');
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === dom.taskModal) closeTaskModal();
    });
}

// --- Auth Functions ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            loginSuccess(data);
            showToast('Login successful!', 'success');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        showToast('Server error during login', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            loginSuccess(data);
            showToast('Account created successfully!', 'success');
        } else {
            showToast(data.message || data.errors?.[0]?.msg || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast('Server error during registration', 'error');
    }
}

function loginSuccess(data) {
    state.user = data.user;
    state.token = data.token;
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    
    updateUIForAuthState();
    fetchTasks();
    
    // Reset forms
    dom.loginForm.reset();
    dom.registerForm.reset();
}

function logout() {
    state.user = null;
    state.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    updateUIForAuthState();
    showToast('Logged out successfully', 'success');
}

function updateUIForAuthState() {
    if (state.token) {
        dom.authSection.classList.add('hidden');
        dom.dashboardSection.classList.remove('hidden');
        dom.loggedOutLinks.classList.add('hidden');
        dom.loggedInLinks.classList.remove('hidden');
        dom.userName.textContent = `Hi, ${state.user.name.split(' ')[0]}`;
    } else {
        dom.authSection.classList.remove('hidden');
        dom.dashboardSection.classList.add('hidden');
        dom.loggedOutLinks.classList.remove('hidden');
        dom.loggedInLinks.classList.add('hidden');
        dom.taskGrid.innerHTML = '';
        // Reset to login card if logged out
        dom.loginCard.classList.remove('hidden');
        dom.registerCard.classList.add('hidden');
    }
}

// --- Task Functions ---
async function fetchTasks() {
    if (!state.token) return;

    dom.loadingSpinner.classList.remove('hidden');
    dom.emptyState.classList.add('hidden');
    
    const { search, status, sort, page, limit } = state.filters;
    const queryParams = new URLSearchParams({ search, status, sort, page, limit });

    try {
        const response = await fetch(`${API_URL}/tasks?${queryParams}`, {
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        const data = await response.json();

        if (data.success) {
            state.tasks = data.data;
            state.pagination = data.pagination;
            renderTasks();
            renderPagination();
        } else {
            if (response.status === 401) logout();
            showToast(data.message || 'Failed to fetch tasks', 'error');
        }
    } catch (err) {
        showToast('Server error while fetching tasks', 'error');
    } finally {
        dom.loadingSpinner.classList.add('hidden');
    }
}

function renderTasks() {
    // Clear everything except spinner and empty state
    const children = Array.from(dom.taskGrid.children);
    children.forEach(child => {
        if (child.id !== 'loadingSpinner' && child.id !== 'emptyState') {
            child.remove();
        }
    });

    if (state.tasks.length === 0) {
        dom.emptyState.classList.remove('hidden');
        return;
    }

    state.tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        dom.taskGrid.appendChild(taskCard);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.status.toLowerCase().replace(' ', '-')}`;
    
    const date = new Date(task.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    card.innerHTML = `
        <div class="task-header">
            <span class="task-status status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
            <div class="task-actions">
                <button class="action-btn edit" title="Edit Task"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <h3>${escapeHTML(task.title)}</h3>
        <p>${escapeHTML(task.description || 'No description provided.')}</p>
        <div class="task-footer">
            <div class="task-date">
                <i class="far fa-calendar-alt"></i> ${date}
            </div>
            <div class="task-status-dropdown">
                <select class="select-input quick-status" data-id="${task._id}">
                    <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
        </div>
    `;

    // Add event listeners to buttons
    card.querySelector('.edit').addEventListener('click', () => openTaskModal(task));
    card.querySelector('.delete').addEventListener('click', () => handleDeleteTask(task._id));
    card.querySelector('.quick-status').addEventListener('change', (e) => handleStatusUpdate(task._id, e.target.value));

    return card;
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        status: document.getElementById('taskStatus').value
    };

    const isEdit = !!taskId;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_URL}/tasks/${taskId}` : `${API_URL}/tasks`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(taskData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(isEdit ? 'Task updated!' : 'Task created!', 'success');
            closeTaskModal();
            fetchTasks();
        } else {
            showToast(data.message || 'Operation failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

async function handleDeleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${state.token}` }
        });

        const data = await response.json();

        if (data.success) {
            showToast('Task deleted', 'success');
            fetchTasks();
        } else {
            showToast('Delete failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

async function handleStatusUpdate(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`Status updated to ${newStatus}`, 'success');
            fetchTasks(); 
        } else {
            showToast('Update failed', 'error');
        }
    } catch (err) {
        showToast('Server error', 'error');
    }
}

// --- Pagination ---
function renderPagination() {
    dom.pagination.innerHTML = '';
    
    const { page, totalPages } = state.pagination;
    
    if (totalPages <= 1) return;

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = page === 1;
    prevBtn.addEventListener('click', () => {
        state.filters.page--;
        fetchTasks();
    });
    dom.pagination.appendChild(prevBtn);

    // Pages
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === page ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                state.filters.page = i;
                fetchTasks();
            });
            dom.pagination.appendChild(pageBtn);
        } else if (i === page - 2 || i === page + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dom.pagination.appendChild(dots);
        }
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = page === totalPages;
    nextBtn.addEventListener('click', () => {
        state.filters.page++;
        fetchTasks();
    });
    dom.pagination.appendChild(nextBtn);
}

// --- Utilities ---
function openTaskModal(task = null) {
    if (task) {
        dom.modalTitle.textContent = 'Edit Task';
        document.getElementById('taskId').value = task._id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDesc').value = task.description || '';
        document.getElementById('taskStatus').value = task.status;
    } else {
        dom.modalTitle.textContent = 'Add New Task';
        dom.taskForm.reset();
        document.getElementById('taskId').value = '';
    }
    dom.taskModal.classList.add('show');
}

function closeTaskModal() {
    dom.taskModal.classList.remove('show');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Run init
document.addEventListener('DOMContentLoaded', init);
