(function () {
  function readChartData() {
    var el = document.getElementById("dashboard-chart-data");
    if (!el || !el.textContent) return { monthlyOverview: [], categoryExpenses: [], categoryTotal: 0 };
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return { monthlyOverview: [], categoryExpenses: [], categoryTotal: 0 };
    }
  }

  function getColors(theme) {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      grid: dark ? "#334155" : "#f3f4f6",
      income: "#0047AB",
      expense: "#f59e0b",
      text: dark ? "#94a3b8" : "#9ca3af",
      donut: ["#1e40af", "#0ea5e9", "#14b8a6", "#f59e0b", "#a855f7", "#64748b"],
    };
  }

  function drawMonthlyChart(monthsSlice) {
    var canvas = document.getElementById("monthlyChart");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dataAll = readChartData().monthlyOverview || [];
    var data = monthsSlice ? dataAll.slice(-monthsSlice) : dataAll;
    var colors = getColors();

    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var width = rect.width;
    var height = rect.height;

    var labels = data.map(function (x) { return x.label; });
    var inc = data.map(function (x) { return x.income; });
    var exp = data.map(function (x) { return x.expense; });

    var maxVal = Math.max.apply(null, inc.concat(exp).concat([1])) * 1.15;
    var padding = 40;
    var chartHeight = height - padding * 2;
    var chartWidth = width - padding * 2;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (var i = 0; i <= 5; i++) {
      var y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding / 2, y);
      ctx.stroke();
    }

    function drawLine(series, stroke) {
      if (!series.length) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      series.forEach(function (v, idx) {
        var x = padding + (chartWidth / Math.max(1, series.length - 1)) * idx;
        var y = height - padding - (v / maxVal) * chartHeight;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    drawLine(inc, colors.income);
    drawLine(exp, colors.expense);

    ctx.fillStyle = colors.text;
    ctx.font = "11px Manrope, Work Sans, system-ui, sans-serif";
    ctx.textAlign = "center";
    labels.forEach(function (lbl, idx) {
      var x = padding + (chartWidth / Math.max(1, labels.length - 1)) * idx;
      ctx.fillText(lbl, x, height - 12);
    });
  }

  function drawDonut() {
    var svg = document.getElementById("category-donut");
    if (!svg) return;
    var raw = readChartData();
    var items = raw.categoryExpenses || [];
    var total = items.reduce(function (s, x) { return s + x.amount; }, 0);
    var colors = getColors().donut;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (!items.length || total <= 0) return;

    var cx = 100,
      cy = 100,
      r = 70,
      stroke = 28;
    var circum = 2 * Math.PI * r;
    var offset = 0;
    items.slice(0, 6).forEach(function (it, i) {
      var frac = it.amount / total;
      var dash = frac * circum;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", r);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", colors[i % colors.length]);
      circle.setAttribute("stroke-width", stroke);
      circle.setAttribute("stroke-dasharray", dash + " " + circum);
      circle.setAttribute("stroke-dashoffset", -offset);
      circle.setAttribute("transform", "rotate(-90 " + cx + " " + cy + ")");
      svg.appendChild(circle);
      offset += dash;
    });
    
    // تحديث ألوان النقاط في القائمة
    updateCategoryDots(colors, items);
  }

  // دالة جديدة لتحديث ألوان النقاط
  function updateCategoryDots(colors, items) {
    var categoryItems = document.querySelectorAll(".category-item");
    if (!categoryItems.length) return;
    
    categoryItems.forEach(function(item, index) {
      var dot = item.querySelector(".category-dot");
      if (dot && index < items.length) {
        dot.style.backgroundColor = colors[index % colors.length];
      }
    });
  }

  function wireChrome() {
    var btn = document.getElementById("menuToggle");
    var sidebar = document.getElementById("sidebar");
    if (btn && sidebar) {
      btn.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }

    var m6 = document.getElementById("chart-range-6");
    var m12 = document.getElementById("chart-range-12");
    function activate(active, months) {
      [m6, m12].forEach(function (b) {
        if (b) b.classList.toggle("active", b === active);
      });
      drawMonthlyChart(months);
    }
    if (m6)
      m6.addEventListener("click", function () {
        activate(m6, 6);
      });
    if (m12)
      m12.addEventListener("click", function () {
        activate(m12, 12);
      });
  }

  function redraw() {
    drawMonthlyChart(12);
    drawDonut();
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireChrome();
    redraw();
  });
  window.addEventListener("resize", redraw);
  document.addEventListener("FinTrixThemeChanged", redraw);
})();