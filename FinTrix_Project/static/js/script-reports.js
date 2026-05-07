// ===============================
// Reports Page JS (script-reports.js)
// ===============================


// ===============================
// Dark Mode Toggle
// ===============================
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;

  if (darkMode) {
    document.body.style.background = "#121826";
    document.body.style.color = "white";
  } else {
    document.body.style.background = "#f5f7fb";
    document.body.style.color = "#111";
  }
}


// ===============================
// Sidebar Toggle (Mobile)
// ===============================
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("open");
}


// ===============================
// Export Button
// ===============================
function exportReport() {
  alert("Export Report will be connected later!");
}


// ===============================
// Render Transactions Table
// ===============================
function renderTransactionsFromAPI(transactions) {
  const tbody = document.getElementById("transactionsTableBody");
  tbody.innerHTML = "";

  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:20px; color:#64748b;">
          No transactions found in this period
        </td>
      </tr>
    `;
    return;
  }

  transactions.forEach((tx) => {
    const isIncome = tx.amount > 0;

    tbody.innerHTML += `
      <tr>
        <td class="entity-name">${tx.entity || "N/A"}</td>
        <td class="category-badge">${tx.category || "N/A"}</td>
        <td class="transaction-date">${tx.date || "N/A"}</td>
        <td class="amount ${isIncome ? "positive" : "negative"}">
          ${isIncome ? "+" : "-"}$${Math.abs(Number(tx.amount)).toFixed(2)}
        </td>
        <td>
          <span class="status-badge ${tx.status}">
            ${tx.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `;
  });
}


// ===============================
// Draw Income vs Expenses Chart
// ===============================
function drawIncomeExpensesChartFromAPI(weeklyChart) {
  const canvas = document.getElementById("incomeExpensesChart");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;

  ctx.clearRect(0, 0, width, height);

  if (!weeklyChart || weeklyChart.length === 0) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "16px Arial";
    ctx.fillText("No chart data", width / 2 - 50, height / 2);
    return;
  }

  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;

  const maxValue = Math.max(
    ...weeklyChart.map((x) => x.income),
    ...weeklyChart.map((x) => x.expense),
    1
  );

  // Grid Lines
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  for (let i = 0; i < 5; i++) {
    const y = padding + (chartHeight / 5) * i;

    ctx.save();
    ctx.translate(x, height - padding);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(label, x, 0);
    ctx.restore();
  }

  // Bars
  const barWidth = chartWidth / (weeklyChart.length * 2.5);
  const gap = barWidth * 0.5;

  weeklyChart.forEach((item, index) => {
    const x = padding + (barWidth * 2 + gap) * index;

    // Income
    const incomeHeight = (item.income / maxValue) * chartHeight;

    ctx.fillStyle = "#0047AB";
    ctx.fillRect(
      x,
      height - padding - incomeHeight,
      barWidth,
      incomeHeight
    );

    // Expense
    const expenseHeight = (item.expense / maxValue) * chartHeight;

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(
      x + barWidth + gap / 2,
      height - padding - expenseHeight,
      barWidth,
      expenseHeight
    );

    // Label
    ctx.fillStyle = "#64748b";
    ctx.font = "11px Arial";
    ctx.fillText(item.label, x, height - padding + 15);
  });
}


// ===============================
// Expense Allocation Donut
// ===============================
function updateExpenseAllocation(expenseAllocation) {
  const donutAmount = document.querySelector(".donut-amount");
  const legendDiv = document.querySelector(".expense-legend");

  const circles = document.querySelectorAll(".donut-svg circle");

  if (!expenseAllocation || expenseAllocation.length === 0) {
    donutAmount.innerText = "$0";

    legendDiv.innerHTML = `
      <p style="color:#64748b;">
        No expense allocation
      </p>
    `;

    circles.forEach(c => {
      c.style.strokeDasharray = `0 1000`;
      c.style.strokeDashoffset = 0;
    });

    return;
  }

  const totalSpent = expenseAllocation.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  donutAmount.innerText = `$${totalSpent.toFixed(2)}`;

  legendDiv.innerHTML = "";

  const colors = [
    "#8B4513",
    "#CD853F",
    "#DEB887",
    "#A0522D",
    "#D2B48C"
  ];

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  expenseAllocation.slice(0, circles.length).forEach((item, index) => {

    const percent = totalSpent === 0
      ? 0
      : item.amount / totalSpent;

    const dash = percent * circumference;

    circles[index].setAttribute(
      "stroke",
      colors[index % colors.length]
    );

    circles[index].style.strokeDasharray =
      `${dash} ${circumference}`;

    circles[index].style.strokeDashoffset = -offset;

    offset += dash;

    legendDiv.innerHTML += `
      <div class="expense-item">
        <div class="expense-name">
          <span class="expense-dot"
            style="background:${colors[index % colors.length]};">
          </span>

          <span>${item.category}</span>
        </div>

        <span class="expense-percentage">
          ${(percent * 100).toFixed(0)}%
        </span>
      </div>
    `;
  });

  for (let i = expenseAllocation.length; i < circles.length; i++) {
    circles[i].style.strokeDasharray = `0 ${circumference}`;
    circles[i].style.strokeDashoffset = 0;
  }
}


// ===============================
// Fetch Data From Backend
// ===============================
async function loadReportData(startDate, endDate) {

  try {

    const response = await fetch(
      `/reports/api/summary/?start_date=${startDate}&end_date=${endDate}`
    );

    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    renderTransactionsFromAPI(data.largest_transactions);

    drawIncomeExpensesChartFromAPI(data.weekly_chart);

    updateExpenseAllocation(data.expense_allocation);

  } catch (error) {

    console.error("Error loading report data:", error);
  }
}


// ===============================
// Filter Tabs
// ===============================
function setTimeFilter(event, filter) {

  document
    .querySelectorAll(".filter-tab")
    .forEach(tab => tab.classList.remove("active"));

  event.target.classList.add("active");

  const today = new Date();

  let startDate = new Date();

  let endDate = today;

  if (filter === "20days") {

    startDate.setDate(today.getDate() - 20);

  } else if (filter === "quarterly") {

    startDate.setMonth(today.getMonth() - 3);

  } else if (filter === "yearly") {

    startDate.setFullYear(today.getFullYear() - 1);
  }

  const formatDate = (d) =>
    d.toISOString().split("T")[0];

  loadReportData(
    formatDate(startDate),
    formatDate(endDate)
  );
}


// ===============================
// Apply Custom Date
// ===============================
function applyCustomDate() {

  const start =
    document.getElementById("startDate").value;

  const end =
    document.getElementById("endDate").value;

  if (!start || !end) {

    alert("Please select both start and end date");

    return;
  }

  loadReportData(start, end);
}


// ===============================
// Page Load
// ===============================
window.onload = function () {

  const today = new Date();

  const startDate = new Date();

  startDate.setFullYear(today.getFullYear() - 1);

  const formatDate = (d) =>
    d.toISOString().split("T")[0];

  loadReportData(
    formatDate(startDate),
    formatDate(today)
  );
};