let currentPage = 1;
let currentFilters = {};
let pageSize = 10;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function parseUsDate(value) {
    if (!value) return null;
    const parts = value.trim().split('/');
    if (parts.length !== 3) return null;
    const [mm, dd, yyyy] = parts.map(p => p.trim());
    if (!mm || !dd || !yyyy) return null;
    const m = parseInt(mm, 10);
    const d = parseInt(dd, 10);
    const y = parseInt(yyyy, 10);
    if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(y)) return null;
    const iso = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    return iso;
}

function parseAnyDate(value) {
    if (!value) return null;
    const v = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    return parseUsDate(v);
}

function formatDisplayDate(iso) {
    if (!iso) return '';
    const day = iso.split('T')[0];
    const parts = day.split('-');
    if (parts.length !== 3) return iso;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return iso;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function setTransactionType(type) {
    document.getElementById('transactionType').value = type;
    document.getElementById('incomeBtn').classList.toggle('active', type === 'income');
    document.getElementById('expenseBtn').classList.toggle('active', type === 'expense');
    document.getElementById('income-source-container').style.display = (type === 'income') ? 'block' : 'none';
    loadCategoriesForForm(type);
}

function showMessage(message) {
    // keep it simple and non-blocking later; for now alert matches existing behavior
    alert(message);
}

function collectInput() {
    const formType = document.getElementById('transactionType').value;
    return {
        type: formType,
        amount: document.getElementById('amount').value,
        category_id: document.getElementById('category').value,
        date: parseAnyDate(document.getElementById('date').value) || '',
        description: document.getElementById('description').value,
        payment_method: document.getElementById('payment-method').value,
        source: document.getElementById('income-source').value
    };
}

async function addTransaction(event) {
    event.preventDefault();
    const data = collectInput();
    try {
        const response = await fetch('/api/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            showMessage('Transaction saved!');
            document.getElementById('add-transaction-form').reset();
            const now = new Date();
            document.getElementById('date').value = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
            setTransactionType('expense');
            currentPage = 1;
            await loadTransactions(currentFilters);
        } else {
            const err = await response.json();
            showMessage(err.error || 'Failed to save');
        }
    } catch (error) {
        showMessage('Network error');
    }
}

function badgeForCategory(name) {
    if (!name) return '<span class="pill pill-muted">—</span>';
    const key = name.toLowerCase();
    let cls = 'pill pill-muted';
    if (key.includes('tech')) cls = 'pill pill-blue';
    if (key.includes('service') || key.includes('income')) cls = 'pill pill-green';
    if (key.includes('operat')) cls = 'pill pill-orange';
    if (key.includes('equip')) cls = 'pill pill-purple';
    return `<span class="${cls}">${name}</span>`;
}

function methodLabel(method) {
    if (!method) return '—';
    if (method === 'CREDIT_CARD') return 'Card';
    if (method === 'E_WALLET') return 'ACH Transfer';
    if (method === 'CASH') return 'Cash';
    return method;
}

function displayTransactions(payload) {
    const transactions = payload?.transactions || [];
    const tbody = document.getElementById('transaction-tbody');
    const empty = document.getElementById('empty-message');
    const table = document.getElementById('transaction-table');
    tbody.innerHTML = '';

    if (!transactions || transactions.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'flex';
        document.getElementById('showing-range').textContent = '0';
        document.getElementById('showing-total').textContent = payload?.total || 0;
        updateTotalNetFlow(payload?.net_flow || 0);
        renderPagination(payload?.page || 1, payload?.total_pages || 1);
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';
    const total = payload?.total || transactions.length;
    const page = payload?.page || 1;
    const pageSizeLocal = payload?.page_size || pageSize;
    const startIdx = (page - 1) * pageSizeLocal + 1;
    const endIdx = (page - 1) * pageSizeLocal + transactions.length;
    document.getElementById('showing-range').textContent = `${startIdx}-${endIdx}`;
    document.getElementById('showing-total').textContent = total;

    transactions.forEach(t => {
        const isIncome = (t.kind || '').toLowerCase() === 'income';
        const amount = parseFloat(t.amount) || 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDisplayDate(t.date)}</td>
            <td>${t.description || '-'}</td>
            <td>${badgeForCategory(t.category)}</td>
            <td>${methodLabel(t.payment_method)}</td>
            <td class="${isIncome ? 'amount-income' : 'amount-expense'}">
                ${isIncome ? '+' : '-'}$${Math.abs(amount).toFixed(2)}
            </td>
            <td>
                <button class="action-btn delete" data-id="${t.id}" data-type="${isIncome ? 'income' : 'expense'}"><svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 15C2.04167 15 1.64931 14.8368 1.32292 14.5104C0.996528 14.184 0.833333 13.7917 0.833333 13.3333V2.5H0V0.833333H4.16667V0H9.16667V0.833333H13.3333V2.5H12.5V13.3333C12.5 13.7917 12.3368 14.184 12.0104 14.5104C11.684 14.8368 11.2917 15 10.8333 15H2.5V15M10.8333 2.5H2.5V13.3333V13.3333V13.3333H10.8333V13.3333V13.3333V2.5V2.5M4.16667 11.6667H5.83333V4.16667H4.16667V11.6667V11.6667M7.5 11.6667H9.16667V4.16667H7.5V11.6667V11.6667M2.5 2.5V2.5V13.3333V13.3333V13.3333V13.3333V13.3333V13.3333V2.5V2.5" fill="#94A3B8"/>
</svg></button>
            </td>
        `;
        row.querySelector('.delete').addEventListener('click', function () {
            deleteTransaction(this.dataset.id, this.dataset.type);
        });
        tbody.appendChild(row);
    });
    updateTotalNetFlow(payload?.net_flow || 0);
    renderPagination(payload?.page || 1, payload?.total_pages || 1);
}

function updateTotalNetFlow(total) {
    const el = document.getElementById('total-net-flow');
    if (el) {
        const abs = Math.abs(total).toFixed(2);
        el.textContent = total >= 0 ? `+$${abs}` : `-$${abs}`;
        el.style.color = total >= 0 ? 'var(--color-success)' : 'var(--color-error)';
    }
}

async function loadTransactions(filters = {}) {
    currentFilters = filters;
    let url = '/api/';
    const params = new URLSearchParams();
    if (filters.category_id && filters.category_id !== 'all') params.append('category_id', filters.category_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    params.append('page', String(currentPage));
    params.append('page_size', String(pageSize));
    if ([...params].length) url += '?' + params.toString();

    try {
        const res = await fetch(url);
        const data = await res.json();
        displayTransactions(data);
    } catch (e) {
        console.error('Failed to load transactions', e);
        displayTransactions({ transactions: [], total: 0, page: 1, total_pages: 1, net_flow: 0 });
    }
}

function applyFiltersFromUI() {
    const cat = document.getElementById('filter-category').value;
    const startIso = parseAnyDate(document.getElementById('filter-from').value);
    const endIso = parseAnyDate(document.getElementById('filter-to').value) || startIso;

    const income = document.getElementById('filter-income').checked;
    const expense = document.getElementById('filter-expense').checked;

    let type = 'all';
    if (income && !expense) type = 'income';
    if (!income && expense) type = 'expense';
    if (!income && !expense) type = 'none';

    const filters = {
        category_id: cat,
        start_date: startIso || '',
        end_date: startIso ? (endIso || startIso) : '',
        type
    };
    currentPage = 1;
    loadTransactions(filters);
}

function resetFilters() {
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-from').value = '';
    const toEl = document.getElementById('filter-to');
    if (toEl) toEl.value = '';
    document.getElementById('filter-income').checked = true;
    document.getElementById('filter-expense').checked = true;
    currentPage = 1;
    loadTransactions({});
}

async function deleteTransaction(id, type) {
    if (!confirm('Delete this transaction?')) return;
    try {
        const res = await fetch(`/api/${type}/${id}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCookie('csrftoken') }
        });
        if (res.ok) {
            showMessage('Deleted!');
            await loadTransactions(currentFilters);
        } else {
            showMessage('Delete failed');
        }
    } catch (e) {
        showMessage('Network error');
    }
}

async function loadCategoriesAll() {
    const res = await fetch('/api/categories/');
    const data = await res.json();
    return data.categories || [];
}

async function loadCategoriesForForm(type = 'expense') {
    const categorySelect = document.getElementById('category');
    const categories = await loadCategoriesAll();

    categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
    const wanted = type === 'income' ? 'INCOME' : 'EXPENSE';
    categories.filter(c => c.type === wanted).forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
    });
}

async function loadCategoriesForFilters() {
    const filterSelect = document.getElementById('filter-category');
    const categories = await loadCategoriesAll();
    filterSelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        filterSelect.appendChild(opt);
    });
}

function renderPagination(page, totalPages) {
    const el = document.getElementById('pagination');
    if (!el) return;
    el.innerHTML = '';
    if (!totalPages || totalPages <= 1) return;

    const mk = (label, p, active = false) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'page-btn' + (active ? ' active' : '');
        b.textContent = label;
        b.addEventListener('click', () => {
            currentPage = p;
            loadTransactions(currentFilters);
        });
        return b;
    };

    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, page + 1);

    if (page > 1) el.appendChild(mk('‹', page - 1));
    for (let p = start; p <= end; p++) el.appendChild(mk(String(p), p, p === page));
    if (page < totalPages) el.appendChild(mk('›', page + 1));
}

function exportCsv() {
    const params = new URLSearchParams();
    if (currentFilters.category_id && currentFilters.category_id !== 'all') params.append('category_id', currentFilters.category_id);
    if (currentFilters.start_date) params.append('start_date', currentFilters.start_date);
    if (currentFilters.end_date) params.append('end_date', currentFilters.end_date);
    if (currentFilters.type && currentFilters.type !== 'all') params.append('type', currentFilters.type);
    const url = '/api/export/' + (params.toString() ? `?${params.toString()}` : '');
    window.location.href = url;
}

function setNewTxOpen(open) {
    const card = document.getElementById('new-transaction-card');
    if (!card) return;
    card.style.display = open ? '' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    document.getElementById('date').value = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
    loadCategoriesForFilters();
    setTransactionType('expense');
    loadTransactions({});

    document.getElementById('add-transaction-form').addEventListener('submit', addTransaction);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    document.getElementById('filter-category').addEventListener('change', applyFiltersFromUI);
    document.getElementById('filter-from').addEventListener('change', applyFiltersFromUI);
    const filterTo = document.getElementById('filter-to');
    if (filterTo) filterTo.addEventListener('change', applyFiltersFromUI);
    document.getElementById('filter-income').addEventListener('change', applyFiltersFromUI);
    document.getElementById('filter-expense').addEventListener('change', applyFiltersFromUI);

    document.getElementById('incomeBtn').addEventListener('click', () => setTransactionType('income'));
    document.getElementById('expenseBtn').addEventListener('click', () => setTransactionType('expense'));

    document.getElementById('export-csv').addEventListener('click', exportCsv);
    document.getElementById('open-new-tx').addEventListener('click', () => setNewTxOpen(true));
    document.getElementById('close-new-tx').addEventListener('click', () => setNewTxOpen(false));
});