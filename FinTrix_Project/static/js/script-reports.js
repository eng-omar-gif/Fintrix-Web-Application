


// Sample transactions data
const transactions = [
    {
        entity: 'AWS Cloud Services',
        category: 'Infrastructure',
        date: '2023-10-24',
        amount: -2450.00,
        status: 'cleared'
    },
    {
        entity: 'Stripe Payout',
        category: 'Sales Revenue',
        date: '2023-10-22',
        amount: 8800.00,
        status: 'cleared'
    },
    {
        entity: 'Modern Office Rental',
        category: 'Fixed Assets',
        date: '2023-10-05',
        amount: -4200.00,
        status: 'pending'
    },
    {
        entity: 'Adobe Creative Suite',
        category: 'Software',
        date: '2023-10-18',
        amount: -599.99,
        status: 'cleared'
    },
    {
        entity: 'Client Payment - Acme Corp',
        category: 'Sales Revenue',
        date: '2023-10-15',
        amount: 12500.00,
        status: 'cleared'
    }
];

// Format currency
function formatCurrency(amount) {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(Math.abs(amount));
    
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit',
        year: 'numeric'
    });
}

// Render transactions
function renderTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    
    tbody.innerHTML = transactions.map(tx => `
        <tr>
            <td>
                <div class="entity-name">${tx.entity}</div>
            </td>
            <td>
                <div class="category-badge">${tx.category}</div>
            </td>
            <td>
                <div class="transaction-date">${formatDate(tx.date)}</div>
            </td>
            <td>
                <div class="amount ${tx.amount < 0 ? 'negative' : 'positive'}">
                    ${formatCurrency(tx.amount)}
                </div>
            </td>
            <td>
                <span class="status-badge ${tx.status}">
                    ${tx.status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Draw Income vs Expenses Chart
function drawIncomeExpensesChart() {
    const canvas = document.getElementById('incomeExpensesChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    // Sample data for 4 weeks
    const weeks = ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'];
    const incomeData = [8500, 9200, 8800, 10500];
    const expenseData = [6200, 5800, 7100, 6500];
    
    const maxValue = Math.max(...incomeData, ...expenseData);
    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = chartWidth / (weeks.length * 2.5);
    const gap = barWidth * 0.5;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding / 2, y);
        ctx.stroke();
    }
    
    // Draw bars
    weeks.forEach((week, index) => {
        const x = padding + (barWidth * 2 + gap) * index;
        
        // Income bar
        const incomeHeight = (incomeData[index] / maxValue) * chartHeight;
        ctx.fillStyle = '#0047AB';
        ctx.fillRect(x, height - padding - incomeHeight, barWidth, incomeHeight);
        
        // Expense bar
        const expenseHeight = (expenseData[index] / maxValue) * chartHeight;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(x + barWidth + gap / 2, height - padding - expenseHeight, barWidth, expenseHeight);
    });
    
    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'center';
    
    weeks.forEach((week, index) => {
        const x = padding + (barWidth * 2 + gap) * index + barWidth;
        ctx.fillText(week, x, height - 10);
    });
}

// Time filter function
function setTimeFilter(filter) {
    // Remove active class from all tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.classList.add('active');
    
    // Update date range based on filter
    const dateRangeElement = document.getElementById('dateRange');
    const periodElement = document.getElementById('currentPeriod');
    
    if (filter === '20days') {
        dateRangeElement.textContent = 'Oct 12 - Oct 31, 2023';
        periodElement.textContent = 'the last 20 days';
    } else if (filter === 'quarterly') {
        dateRangeElement.textContent = 'Jul 01 - Sep 30, 2023';
        periodElement.textContent = 'Q3 2023';
    } else {
        dateRangeElement.textContent = 'Jan 01 - Dec 31, 2023';
        periodElement.textContent = '2023';
    }
    
    // In a real app, you would fetch new data here
    console.log('Filter changed to:', filter);
}

// Export report function
function exportReport() {
    alert('Exporting report as PDF...\n\nIn a real application, this would generate a downloadable PDF report with all your financial data.');
    
    // In Django, you would call:
    // window.location.href = '/api/reports/export/?format=pdf&period=' + currentPeriod;
}

// Toggle sidebar on mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Toggle dark mode
function toggleDarkMode() {
    alert('Dark mode feature coming soon!');
    // In a real app, you would toggle a dark mode class on the body
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    if (window.innerWidth <= 1024 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target) &&
        sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
    }
});

// Initialize page
renderTransactions();
drawIncomeExpensesChart();

// Redraw chart on window resize
window.addEventListener('resize', () => {
    drawIncomeExpensesChart();
});
