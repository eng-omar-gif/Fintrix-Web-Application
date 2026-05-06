function setTransactionType(type)
{
    document.getElementById('transactionType').value = type;
    document.getElementById('incomeBtn').classList.toggle('active', type === 'income');
    document.getElementById('expenseBtn').classList.toggle('active', type === 'expense');
    document.getElementById('income-source-container').style.display = (type === 'income') ? 'block' : 'none';
}

function showMessage(message, type) {
    alert(type.toUpperCase() + ': ' + message);
}

function toggleEmptyState(empty) {
    document.getElementById('transaction-table').style.display = empty ? 'none' : '';
    document.getElementById('empty-message').style.display = empty ? '' : 'none';
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
        const response = await fetch('/api/transactions/add/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('Transaction added successfully!', 'success');
            document.getElementById('add-transaction-form').reset();
            document.getElementById('date').valueAsDate = new Date();
            loadTransactions();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Error adding transaction', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function displayTransactions(transactions) {
    const tbody = document.getElementById('transaction-tbody');
    tbody.innerHTML = '';

    if (!transactions || transactions.length === 0) {
        toggleEmptyState(true);
        return;
    }

    toggleEmptyState(false);

    transactions.forEach(trans => {
        const row = tbody.insertRow();
        const isIncome = trans.type === 'income' || trans.source;

        row.innerHTML = `
            <td>${trans.date}</td>
            <td class="${isIncome ? 'income-type' : 'expense-type'}">${isIncome ? 'Income' : 'Expense'}</td>
            <td>${isIncome ? '+' : '-'}$${Math.abs(trans.amount).toFixed(2)}</td>
            <td>${trans.category_name || trans.category}</td>
            <td>${trans.description || '-'}</td>
            <td>${trans.payment_method}</td>
            <td>${trans.source || '-'}</td>
            <td>
                <button class="action-btn delete" onclick="deleteTransaction(${trans.id}, '${trans.type || 'expense'}')">🗑️</button>
            </td>
        `;
    });
}

async function loadTransactions(filters = {}) {
    let url = '/api/transactions/';
    const params = new URLSearchParams();

    if (filters.category) params.append('category_id', filters.category);
    if (filters.date_from) params.append('start_date', filters.date_from);
    if (filters.date_to) params.append('end_date', filters.date_to);
    if (filters.type) params.append('type', filters.type);

    if (params.toString()) url += '?' + params.toString();

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayTransactions(data.transactions || data);
    } catch (error) {
        console.error('Error loading transactions:', error);
        toggleEmptyState(true);
    }
}

function applyFilters() {
    const filters = {
        category: document.getElementById('filter-category').value,
        date_from: document.getElementById('filter-from').value,
        date_to: document.getElementById('filter-to').value,
        type: document.getElementById('filter-type').value
    };

    if (filters.category === 'all') filters.category = '';
    if (filters.type === 'all') filters.type = '';

    loadTransactions(filters);
}

async function deleteTransaction(id, type) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
        const response = await fetch(`/api/transactions/${type}/${id}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Transaction deleted!', 'success');
            loadTransactions();
        }
    } catch (error) {
        showMessage('Error deleting transaction', 'error');
    }
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories/');
        const categories = await response.json();

        const categorySelect = document.getElementById('category');
        const filterCategory = document.getElementById('filter-category');

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);

            const filterOption = document.createElement('option');
            filterOption.value = cat.id;
            filterOption.textContent = cat.name;
            filterCategory.appendChild(filterOption);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

window.onload = function () {
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('add-transaction-form').addEventListener('submit', addTransaction);
    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    loadCategories();
    loadTransactions();
};
