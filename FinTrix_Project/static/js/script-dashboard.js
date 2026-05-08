/**
 * @fileoverview Dashboard page controller for FinTrix.
 * Renders the monthly income/expense line chart and the category donut chart
 * using the Canvas and SVG APIs. Also wires the sidebar toggle and chart-range buttons.
 * @module script-dashboard
 */

(function () {

  /**
   * Reads the serialised chart data injected by Django into the
   * `#dashboard-chart-data` script tag.
   *
   * @returns {{
   *   monthlyOverview: Array<{label: string, income: number, expense: number}>,
   *   categoryExpenses: Array<{name: string, amount: number}>,
   *   categoryTotal: number
   * }} Parsed chart data, or default empty structure on failure.
   */
  function readChartData() {
    var el = document.getElementById("dashboard-chart-data");
    if (!el || !el.textContent) return { monthlyOverview: [], categoryExpenses: [], categoryTotal: 0 };
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return { monthlyOverview: [], categoryExpenses: [], categoryTotal: 0 };
    }
  }

  /**
   * Returns a palette of chart colours adapted for the current theme.
   *
   * @returns {{
   *   grid: string,
   *   income: string,
   *   expense: string,
   *   text: string,
   *   donut: string[]
   * }} Colour map for use in canvas and SVG drawing operations.
   */
  function getColors() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    return {
      grid:    dark ? "#334155" : "#f3f4f6",
      income:  "#0047AB",
      expense: "#f59e0b",
      text:    dark ? "#94a3b8" : "#9ca3af",
      donut:   ["#1e40af", "#0ea5e9", "#14b8a6", "#f59e0b", "#a855f7", "#64748b"],
    };
  }

  /**
   * Draws (or redraws) the monthly income vs. expense line chart
   * on the `#monthlyChart` canvas element.
   *
   * @param {number|null} monthsSlice - How many of the most-recent months to show.
   *   Pass `null` to show all available months.
   * @returns {void}
   */
  function drawMonthlyChart(monthsSlice) {
    var canvas = document.getElementById("monthlyChart");
    if (!canvas) return;
    var ctx    = canvas.getContext("2d");
    var dataAll = readChartData().monthlyOverview || [];
    var data   = monthsSlice ? dataAll.slice(-monthsSlice) : dataAll;
    var colors = getColors();

    var dpr  = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var width  = rect.width;
    var height = rect.height;

    var labels = data.map(function (x) { return x.label; });
    var inc    = data.map(function (x) { return x.income; });
    var exp    = data.map(function (x) { return x.expense; });

    var maxVal     = Math.max.apply(null, inc.concat(exp).concat([1])) * 1.15;
    var padding    = 40;
    var chartHeight = height - padding * 2;
    var chartWidth  = width  - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth   = 1;
    for (var i = 0; i <= 5; i++) {
      var y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding / 2, y);
      ctx.stroke();
    }

    /**
     * Draws a single polyline series on the chart canvas.
     * @param {number[]} series - Array of numeric values.
     * @param {string}   stroke - CSS colour string for the line.
     * @returns {void}
     */
    function drawLine(series, stroke) {
      if (!series.length) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth   = 2.5;
      ctx.lineJoin    = "round";
      series.forEach(function (v, idx) {
        var x = padding + (chartWidth / Math.max(1, series.length - 1)) * idx;
        var y = height - padding - (v / maxVal) * chartHeight;
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    drawLine(inc, colors.income);
    drawLine(exp, colors.expense);

    // X-axis labels
    ctx.fillStyle  = colors.text;
    ctx.font       = "11px Manrope, Work Sans, system-ui, sans-serif";
    ctx.textAlign  = "center";
    labels.forEach(function (lbl, idx) {
      var x = padding + (chartWidth / Math.max(1, labels.length - 1)) * idx;
      ctx.fillText(lbl, x, height - 12);
    });
  }

  /**
   * Renders the category expense donut chart inside the `#category-donut` SVG element.
   * Each category gets a proportional arc coloured from the donut palette.
   * Also calls {@link updateCategoryDots} to sync legend dot colours.
   * @returns {void}
   */
  function drawDonut() {
    var svg = document.getElementById("category-donut");
    if (!svg) return;
    var raw    = readChartData();
    var items  = raw.categoryExpenses || [];
    var total  = items.reduce(function (s, x) { return s + x.amount; }, 0);
    var colors = getColors().donut;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (!items.length || total <= 0) return;

    var cx = 100, cy = 100, r = 70, stroke = 28;
    var circum = 2 * Math.PI * r;
    var offset = 0;
    items.slice(0, 6).forEach(function (it, i) {
      var frac   = it.amount / total;
      var dash   = frac * circum;
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

    updateCategoryDots(colors, items);
  }

  /**
   * Updates the background colour of `.category-dot` elements in the legend
   * to match the corresponding donut arc colours.
   *
   * @param {string[]} colors - Array of CSS colour strings (donut palette).
   * @param {Array<{name: string, amount: number}>} items - Category data array.
   * @returns {void}
   */
  function updateCategoryDots(colors, items) {
    var categoryItems = document.querySelectorAll(".category-item");
    if (!categoryItems.length) return;
    categoryItems.forEach(function (item, index) {
      var dot = item.querySelector(".category-dot");
      if (dot && index < items.length) {
        dot.style.backgroundColor = colors[index % colors.length];
      }
    });
  }

  /**
   * Wires interactive UI controls:
   * - `#menuToggle` → toggles the `.open` class on `#sidebar`.
   * - `#chart-range-6` / `#chart-range-12` → redraws the monthly chart
   *   for the last 6 or 12 months respectively.
   * @returns {void}
   */
  function wireChrome() {
    var btn     = document.getElementById("menuToggle");
    var sidebar = document.getElementById("sidebar");
    if (btn && sidebar) {
      btn.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }

    var m6  = document.getElementById("chart-range-6");
    var m12 = document.getElementById("chart-range-12");

    /**
     * Activates a range-selector button and redraws the monthly chart.
     * @param {HTMLElement} active - The button to mark active.
     * @param {number}      months - Number of months to display.
     * @returns {void}
     */
    function activate(active, months) {
      [m6, m12].forEach(function (b) {
        if (b) b.classList.toggle("active", b === active);
      });
      drawMonthlyChart(months);
    }

    if (m6)  m6.addEventListener("click",  function () { activate(m6,   6); });
    if (m12) m12.addEventListener("click", function () { activate(m12, 12); });
  }

  /**
   * Redraws both charts (monthly line + donut).
   * Called on initial load, window resize, and theme change.
   * @returns {void}
   */
  function redraw() {
    drawMonthlyChart(12);
    drawDonut();
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireChrome();
    redraw();
  });

  /** Redraws charts when the viewport is resized. */
  window.addEventListener("resize", redraw);

  /** Redraws charts when the FinTrix theme changes (light ↔ dark). */
  document.addEventListener("FinTrixThemeChanged", redraw);

})();
