(function () {
  var state = { start: null, end: null };

  function el(id) {
    return document.getElementById(id);
  }

  function fmtMoney(n) {
    var x = Number(n) || 0;
    return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function todayISO() {
    return new Date().toISOString().split("T")[0];
  }

  function setPeriodLabel() {
    var s = el("startDate").value;
    var e = el("endDate").value;
    var cp = document.getElementById("currentPeriod");
    if (!cp || !s || !e) return;
    var d0 = new Date(s + "T12:00:00");
    var d1 = new Date(e + "T12:00:00");
    cp.textContent =
      d0.toLocaleString(undefined, { month: "long", day: "numeric", year: "numeric" }) +
      " – " +
      d1.toLocaleString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }

  function chartColors() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      grid: dark ? "#334155" : "#e5e7eb",
      income: "#1e40af",
      expense: "#f59e0b",
      label: dark ? "#94a3b8" : "#64748b",
    };
  }

  function drawIncomeExpensesChart(weeklyChart) {
    var canvas = el("incomeExpensesChart");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var width = rect.width;
    var height = rect.height;
    var padding = 36;
    ctx.clearRect(0, 0, width, height);
    var c = chartColors();

    if (!weeklyChart || !weeklyChart.length) {
      ctx.fillStyle = c.label;
      ctx.font = "14px system-ui,sans-serif";
      ctx.fillText("No data for this range", padding, height / 2);
      return;
    }

    var chartHeight = height - padding * 2;
    var chartWidth = width - padding * 2;
    var maxValue = 1;
    weeklyChart.forEach(function (x) {
      maxValue = Math.max(maxValue, x.income, x.expense);
    });

    ctx.strokeStyle = c.grid;
    for (var i = 0; i <= 4; i++) {
      var y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - 8, y);
      ctx.stroke();
    }

    var n = weeklyChart.length;
    var groupW = chartWidth / Math.max(1, n);
    var barW = Math.min(24, groupW * 0.28);
    var gap = groupW * 0.12;

    weeklyChart.forEach(function (item, index) {
      var gx = padding + index * groupW + gap;
      var incH = (item.income / maxValue) * chartHeight;
      var expH = (item.expense / maxValue) * chartHeight;
      ctx.fillStyle = c.income;
      ctx.fillRect(gx, height - padding - incH, barW, incH);
      ctx.fillStyle = c.expense;
      ctx.fillRect(gx + barW + 4, height - padding - expH, barW, expH);

      ctx.fillStyle = c.label;
      ctx.font = "10px system-ui,sans-serif";
      ctx.textAlign = "center";
      var short = item.label.split("–")[0].trim().split(" ")[0];
      ctx.fillText(short, gx + barW, height - 10);
    });
  }

  var DONUT_COLORS = ["#8B4513", "#CD853F", "#DEB887", "#A0522D", "#0ea5e9", "#6366f1"];

  function renderDonut(expenseAllocation) {
    var svg = el("allocationDonut");
    var legend = el("allocationLegend");
    var totalEl = el("donutTotal");
    if (!svg || !legend || !totalEl) return;

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    legend.innerHTML = "";

    if (!expenseAllocation || !expenseAllocation.length) {
      totalEl.textContent = "$0.00";
      legend.innerHTML = '<p class="empty-copy">No expenses in range.</p>';
      return;
    }

    var total = expenseAllocation.reduce(function (s, x) {
      return s + x.amount;
    }, 0);
    totalEl.textContent = "$" + fmtMoney(total);

    var cx = 100,
      cy = 100,
      r = 72,
      stroke = 26;
    var circum = 2 * Math.PI * r;
    var offset = 0;
    expenseAllocation.slice(0, 6).forEach(function (item, i) {
      var frac = total > 0 ? item.amount / total : 0;
      var dash = frac * circum;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", r);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", DONUT_COLORS[i % DONUT_COLORS.length]);
      circle.setAttribute("stroke-width", stroke);
      circle.setAttribute("stroke-dasharray", dash + " " + circum);
      circle.setAttribute("stroke-dashoffset", -offset);
      circle.setAttribute("transform", "rotate(-90 " + cx + " " + cy + ")");
      svg.appendChild(circle);
      offset += dash;

      var row = document.createElement("div");
      row.className = "expense-item";
      row.innerHTML =
        '<div class="expense-name"><span class="expense-dot" style="background:' +
        DONUT_COLORS[i % DONUT_COLORS.length] +
        '"></span><span>' +
        item.category +
        '</span></div><span class="expense-percentage">' +
        (total > 0 ? ((item.amount / total) * 100).toFixed(0) : "0") +
        "%</span>";
      legend.appendChild(row);
    });
  }

  function renderTable(transactions) {
    var tbody = el("transactionsTableBody");
    var empty = el("reportEmpty");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!transactions || !transactions.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    transactions.forEach(function (tx) {
      var tr = document.createElement("tr");
      var pos = tx.amount > 0;
      tr.innerHTML =
        '<td class="entity-name">' +
        (tx.entity || "—") +
        '</td><td>' +
        (tx.category || "—") +
        '</td><td class="transaction-date">' +
        (tx.date || "—") +
        '</td><td class="amount ' +
        (pos ? "positive" : "negative") +
        '">' +
        (pos ? "+" : "") +
        "$" +
        fmtMoney(Math.abs(tx.amount)) +
        '</td><td><span class="status-badge ' +
        (tx.status || "cleared") +
        '">' +
        String(tx.status || "cleared").toUpperCase() +
        "</span></td>";
      tbody.appendChild(tr);
    });
  }

  function exportQuery() {
    var params = new URLSearchParams();
    params.set("start_date", el("startDate").value);
    params.set("end_date", el("endDate").value);
    var cat = el("exportCategory").value;
    if (cat) params.set("category_id", cat);
    return params.toString();
  }

  function doExport(kind) {
    var q = exportQuery();
    if (kind === "print") {
      window.print();
      return;
    }
    var path = "/reports/export/csv/";
    if (kind === "pdf") path = "/reports/export/pdf/";
    if (kind === "excel") path = "/reports/export/excel/";
    window.location.href = path + "?" + q;
  }

  async function loadCategoriesSelect() {
    var sel = el("exportCategory");
    if (!sel) return;
    try {
      var res = await fetch("/api/categories/");
      var data = await res.json();
      var cats = data.categories || [];
      cats.forEach(function (c) {
        var o = document.createElement("option");
        o.value = c.id;
        o.textContent = c.name;
        sel.appendChild(o);
      });
    } catch (e) {}
  }

  async function loadReportData() {
    var start = el("startDate").value;
    var end = el("endDate").value;
    if (!start || !end) return;
    setPeriodLabel();
    var cat = el("exportCategory").value;
    var url =
      "/reports/api/summary/?start_date=" +
      encodeURIComponent(start) +
      "&end_date=" +
      encodeURIComponent(end) +
      (cat ? "&category_id=" + encodeURIComponent(cat) : "");
    try {
      var res = await fetch(url);
      var data = await res.json();
      if (data.error) {
        console.error(data.error);
        return;
      }
      var sl = el("summaryLine");
      if (sl)
        sl.textContent =
          "Income $" +
          fmtMoney(data.total_income) +
          " · Expenses $" +
          fmtMoney(data.total_expense) +
          " · Net $" +
          fmtMoney(data.net);
      renderTable(data.largest_transactions);
      window.__reportWeekly = data.weekly_chart;
      window.__reportAllocation = data.expense_allocation;
      drawIncomeExpensesChart(data.weekly_chart);
      renderDonut(data.expense_allocation);
    } catch (err) {
      console.error(err);
    }
  }

  function applyPreset(preset) {
    var end = new Date();
    var start = new Date();
    if (preset === "30d") start.setDate(end.getDate() - 29);
    else if (preset === "quarterly") start.setMonth(end.getMonth() - 3);
    else start.setFullYear(end.getFullYear() - 1);
    el("startDate").value = start.toISOString().split("T")[0];
    el("endDate").value = end.toISOString().split("T")[0];
    loadReportData();
  }

  function toggleSidebar() {
    var s = document.getElementById("sidebar");
    if (s) s.classList.toggle("open");
  }

  document.addEventListener("DOMContentLoaded", function () {
    el("endDate").value = todayISO();
    var s = new Date();
    s.setDate(s.getDate() - 29);
    el("startDate").value = s.toISOString().split("T")[0];
    setPeriodLabel();
    loadCategoriesSelect().then(loadReportData);

    document.querySelectorAll(".filter-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        document.querySelectorAll(".filter-tab").forEach(function (t) {
          t.classList.remove("active");
        });
        tab.classList.add("active");
        applyPreset(tab.getAttribute("data-preset"));
      });
    });

    el("applyRangeBtn").addEventListener("click", function () {
      document.querySelectorAll(".filter-tab").forEach(function (t) {
        t.classList.remove("active");
      });
      loadReportData();
    });

    el("exportCategory").addEventListener("change", loadReportData);

    var menuBtn = el("exportMenuBtn");
    var menu = el("exportMenu");
    if (menuBtn && menu) {
      menuBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        var willShow = menu.hidden;
        menu.hidden = !willShow;
        menuBtn.setAttribute("aria-expanded", willShow ? "true" : "false");
      });
      document.addEventListener("click", function (e) {
        if (!menu.contains(e.target) && e.target !== menuBtn) menu.hidden = true;
      });
      menu.querySelectorAll("[data-export]").forEach(function (b) {
        b.addEventListener("click", function () {
          doExport(b.getAttribute("data-export"));
          menu.hidden = true;
        });
      });
    }

    var mt = el("menuToggle");
    if (mt) mt.addEventListener("click", toggleSidebar);

    window.addEventListener("resize", function () {
      if (window.__reportWeekly) drawIncomeExpensesChart(window.__reportWeekly);
    });
  });

  document.addEventListener("FinTrixThemeChanged", function () {
    if (window.__reportWeekly) drawIncomeExpensesChart(window.__reportWeekly);
  });
})();
