function setTransactionType(type) {
    document.getElementById('transactionType').value = type;
    document.getElementById('incomeBtn').classList.toggle('active', type === 'income');
    document.getElementById('expenseBtn').classList.toggle('active', type === 'expense');
    document.getElementById('income-source-container').style.display = (type === 'income') ? 'block' : 'none';
    loadCategories(type);
}

function showMessage(message, type) {
    alert(type.toUpperCase() + ': ' + message);
}

function collectInput() {
    return {
        type: document.getElementById('transactionType').value,
        amount: document.getElementById('amount').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value,
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            showMessage('Transaction saved!', 'success');
            document.getElementById('add-transaction-form').reset();
            document.getElementById('date').valueAsDate = new Date();
            setTransactionType('income');
            loadTransactions();
        } else {
            const err = await response.json();
            showMessage(err.error || 'Failed to save', 'error');
        }
    } catch (error) {
        showMessage('Network error', 'error');
    }
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transaction-tbody');
    const empty = document.getElementById('empty-message');
    const table = document.getElementById('transaction-table');
    tbody.innerHTML = '';

    if (!transactions || transactions.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'flex';
        document.getElementById('showing-count').textContent = '0';
        updateTotalNetFlow(0);
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';
    document.getElementById('showing-count').textContent = transactions.length;

    let total = 0;
    transactions.forEach(t => {
        const isIncome = t.type === 'Income' || (t.source && t.source.length > 0);
        const amount = parseFloat(t.amount) || 0;
        const sign = isIncome ? 1 : -1;
        total += amount * sign;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.date || ''}</td>
            <td>${t.description || '-'}</td>
            <td>${t.category || '-'}</td>
            <td>${t.payment_method || '-'}</td>
            <td class="${isIncome ? 'amount-income' : 'amount-expense'}">
                ${isIncome ? '+' : '-'}$${Math.abs(amount).toFixed(2)}
            </td>
            <td>
                <button class="action-btn delete" data-id="${t.id}" data-type="${isIncome ? 'income' : 'expense'}">🗑️</button>
            </td>
        `;
        row.querySelector('.delete').addEventListener('click', function () {
            deleteTransaction(this.dataset.id, this.dataset.type);
        });
        tbody.appendChild(row);
    });
    updateTotalNetFlow(total);
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
    let url = '/api/';
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'all') params.append('category_id', filters.category);
    if (filters.date_from) params.append('start_date', filters.date_from);
    if (filters.date_to) params.append('end_date', filters.date_to);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if ([...params].length) url += '?' + params.toString();

    try {
        const res = await fetch(url);
        const data = await res.json();
        displayTransactions(data.transactions || data);
    } catch (e) {
        console.error('Failed to load transactions', e);
        displayTransactions([]);
    }
}

function applyFilters() {
    const filters = {
        category: document.getElementById('filter-category').value,
        date_from: document.getElementById('filter-from').value,
        date_to: document.getElementById('filter-to').value,
        type: document.getElementById('filter-type').value
    };
    loadTransactions(filters);
}

function resetFilters() {
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-from').value = '';
    document.getElementById('filter-to').value = '';
    document.getElementById('filter-type').value = 'all';
    loadTransactions();
}

async function deleteTransaction(id, type) {
    if (!confirm('Delete this transaction?')) return;
    try {
        const res = await fetch(`/api/${type}/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showMessage('Deleted!', 'success');
            loadTransactions();
        } else {
            showMessage('Delete failed', 'error');
        }
    } catch (e) {
        showMessage('Network error', 'error');
    }
}

function loadCategories(type = 'income') {
    const categorySelect = document.getElementById('category');
    const filterSelect = document.getElementById('filter-category');

    const incomeCategories = [
        { id: 1, name: 'Salary', type: 'income' },
        { id: 2, name: 'Freelance', type: 'income' },
        { id: 3, name: 'Investments', type: 'income' },
        { id: 4, name: 'Other Income', type: 'income' }
    ];
    const expenseCategories = [
        { id: 5, name: 'Food', type: 'expense' },
        { id: 6, name: 'Transportation', type: 'expense' },
        { id: 7, name: 'Housing', type: 'expense' },
        { id: 8, name: 'Entertainment', type: 'expense' },
        { id: 9, name: 'Others', type: 'expense' }
    ];
    const allCategories = [...incomeCategories, ...expenseCategories];

    categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
    filterSelect.innerHTML = '<option value="all">All Categories</option>';

    const cats = (type === 'income') ? incomeCategories : expenseCategories;
    cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);
    });

    allCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        filterSelect.appendChild(opt);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('date').valueAsDate = new Date();
    loadCategories('income');
    loadTransactions();

    document.getElementById('add-transaction-form').addEventListener('submit', addTransaction);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
});
