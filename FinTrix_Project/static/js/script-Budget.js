"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ══════════════════════════════════════════
  //  1. ANIMATE PROGRESS BARS
  // ══════════════════════════════════════════
  document.querySelectorAll(".prog-fill").forEach(bar => {
    const target = bar.style.width || "0%";
    bar.style.width = "0%";
    requestAnimationFrame(() => setTimeout(() => { bar.style.width = target; }, 80));
  });


  // ══════════════════════════════════════════
  //  2. AUTO-DISMISS Django messages (4s)
  // ══════════════════════════════════════════
  document.querySelectorAll(".dj-msg").forEach(msg => {
    setTimeout(() => {
      msg.style.transition = "opacity 0.4s";
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 400);
    }, 4000);
  });


  // ══════════════════════════════════════════
  //  3. ALERT BANNER — scroll to form
  // ══════════════════════════════════════════
  window.scrollToForm = function () {
    const form = document.getElementById("formSection");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  // ══════════════════════════════════════════
  //  4. EXPORT BUTTON — window.print()
  // ══════════════════════════════════════════
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => window.print());
  }


  // ══════════════════════════════════════════
  //  5. GRID / LIST TOGGLE — persisted in localStorage
  // ══════════════════════════════════════════
  const gridBtn = document.getElementById("gridBtn");
  const listBtn = document.getElementById("listBtn");
  const catGrid = document.getElementById("catGrid");

  if (gridBtn && listBtn && catGrid) {
    const setView = (mode) => {
      if (mode === "list") {
        catGrid.classList.add("list-mode");
        listBtn.classList.add("active");
        gridBtn.classList.remove("active");
      } else {
        catGrid.classList.remove("list-mode");
        gridBtn.classList.add("active");
        listBtn.classList.remove("active");
      }
      localStorage.setItem("budgetView", mode);
    };

    gridBtn.addEventListener("click", () => setView("grid"));
    listBtn.addEventListener("click", () => setView("list"));

    // Restore preference
    setView(localStorage.getItem("budgetView") || "grid");
  }


  // ══════════════════════════════════════════
  //  6. THRESHOLD TOGGLE — updates hidden input
  // ══════════════════════════════════════════
  document.querySelectorAll(".thresh-row").forEach(row => {
    const hidden = row.closest("form")?.querySelector("#thresholdVal");
    row.querySelectorAll(".thresh-opt").forEach(opt => {
      opt.addEventListener("click", () => {
        row.querySelectorAll(".thresh-opt").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
        if (hidden) hidden.value = opt.dataset.val;
      });
    });
  });


  // ══════════════════════════════════════════
  //  7. ADD CATEGORY LIMIT FORM — validation
  //     POST → add_category_limit view
  //     Fields: category_name, limit
  // ══════════════════════════════════════════
  const categoryForm = document.getElementById("categoryForm");
  if (categoryForm) {
    categoryForm.addEventListener("submit", e => {
      clearErrors(categoryForm);
      let ok = true;

      const cat   = categoryForm.querySelector("select[name='category_name']");
      const limit = categoryForm.querySelector("input[name='limit']");

      if (!cat?.value) {
        showError(cat, "Please select a category."); ok = false;
      }
      if (!limit?.value || parseFloat(limit.value) <= 0) {
        showError(limit, "Enter a limit greater than 0."); ok = false;
      }
      if (!ok) e.preventDefault();
    });
  }


  // ══════════════════════════════════════════
  //  8. ADD EXPENSE FORM — validation
  //     POST → add_expense view
  //     Fields: category_name, amount, date
  // ══════════════════════════════════════════
  const expenseForm = document.getElementById("expenseForm");
  if (expenseForm) {
    // Default date to today
    const dateInput = expenseForm.querySelector("#expenseDate");
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }

    expenseForm.addEventListener("submit", e => {
      clearErrors(expenseForm);
      let ok = true;

      const cat    = expenseForm.querySelector("select[name='category_name']");
      const amount = expenseForm.querySelector("input[name='amount']");
      const date   = expenseForm.querySelector("input[name='date']");

      if (!cat?.value)                              { showError(cat,    "Please select a category."); ok = false; }
      if (!amount?.value || parseFloat(amount.value) <= 0) { showError(amount, "Enter an amount greater than 0."); ok = false; }
      if (!date?.value)                             { showError(date,   "Please select a date."); ok = false; }

      if (!ok) e.preventDefault();
    });
  }


  // ══════════════════════════════════════════
  //  9. CREATE BUDGET FORM — validation
  //     POST → create_budget view
  //     Fields: month, category_name, limit
  // ══════════════════════════════════════════
  const createForm = document.getElementById("createForm");
  if (createForm) {
    createForm.addEventListener("submit", e => {
      clearErrors(createForm);
      let ok = true;

      const month = createForm.querySelector("input[name='month']");
      const cat   = createForm.querySelector("select[name='category_name']");
      const limit = createForm.querySelector("input[name='limit']");

      if (!month?.value)                            { showError(month, "Please select a month."); ok = false; }
      if (!cat?.value)                              { showError(cat,   "Please select a category."); ok = false; }
      if (!limit?.value || parseFloat(limit.value) <= 0) { showError(limit, "Enter a limit greater than 0."); ok = false; }

      if (!ok) e.preventDefault();
    });
  }


  // ══════════════════════════════════════════
  //  10. SEARCH — filter category & budget cards
  // ══════════════════════════════════════════
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();

      document.querySelectorAll(".cat-card[data-name]").forEach(card => {
        card.style.display = card.dataset.name.includes(q) ? "" : "none";
      });

      document.querySelectorAll(".dash-card").forEach(card => {
        const text = card.querySelector(".dash-month")?.textContent.toLowerCase() || "";
        card.style.display = text.includes(q) ? "" : "none";
      });
    });
  }


  // ══════════════════════════════════════════
  //  11. MORE BUTTON (⋯) — contextual dropdown
  // ══════════════════════════════════════════
document.querySelectorAll(".more-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      document.querySelectorAll(".ctx-menu").forEach(m => m.remove());

      const cbId     = btn.dataset.id;
      const budgetId = btn.dataset.budget;

      const menu = document.createElement("div");
      menu.className = "ctx-menu";
      menu.innerHTML = `
        <button class="ctx-item" data-action="edit">Edit Limit</button>
        <button class="ctx-item ctx-danger" data-action="delete">Remove Category</button>
      `;

      const rect = btn.getBoundingClientRect();
      Object.assign(menu.style, {
        position: "fixed",
        top:      `${rect.bottom + 4}px`,
        left:     `${rect.left - 110}px`,
        background: "#fff",
        border:   "1px solid #e2e5f0",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,.12)",
        zIndex:   "1000",
        minWidth: "140px",
        overflow: "hidden",
      });

      menu.querySelectorAll(".ctx-item").forEach(item => {
        Object.assign(item.style, {
          display: "block", width: "100%", padding: "9px 14px",
          fontSize: "12.5px", background: "none", border: "none",
          textAlign: "left", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          color: item.classList.contains("ctx-danger") ? "#c0392b" : "#1a1d2e",
        });

        item.addEventListener("mouseenter", () => item.style.background = "#f0f2f8");
        item.addEventListener("mouseleave", () => item.style.background = "none");

        item.addEventListener("click", () => {
          menu.remove();

          if (item.dataset.action === "delete") {
            if (confirm("Remove this category from the budget?")) {
              const form = document.createElement("form");
              form.method = "POST";
              form.action = `/budgets/${budgetId}/category/${cbId}/delete/`;
              form.innerHTML = `<input type="hidden" name="csrfmiddlewaretoken" value="${getCSRF()}">`;
              document.body.appendChild(form);
              form.submit();
            }

          } else if (item.dataset.action === "edit") {
            const newLimit = prompt("Enter new limit:");
            if (newLimit !== null && parseFloat(newLimit) > 0) {
              const form = document.createElement("form");
              form.method = "POST";
              form.action = `/budgets/${budgetId}/category/${cbId}/edit/`;
              form.innerHTML = `
                <input type="hidden" name="csrfmiddlewaretoken" value="${getCSRF()}">
                <input type="hidden" name="limit" value="${parseFloat(newLimit)}">
              `;
              document.body.appendChild(form);
              form.submit();
            }
          }
        });
      });

      document.body.appendChild(menu);
      setTimeout(() => document.addEventListener("click", () => menu.remove(), { once: true }), 0);
    });
  });

function getCSRF() {
  return document.cookie.split(";")
    .find(c => c.trim().startsWith("csrftoken="))
    ?.split("=")[1] || "";
}

  // ══════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════
  function showError(field, message) {
    if (!field) return;
    // Highlight the field or its wrapper
    const target = field.closest(".money-input") || field.closest(".select-wrap") || field;
    target.style.borderColor  = "#c0392b";
    target.style.boxShadow    = "0 0 0 3px rgba(192,57,43,.12)";

    const err = document.createElement("span");
    err.className   = "field-error";
    err.textContent = message;
    const parent = field.closest(".field");
    if (parent) parent.appendChild(err);
  }

  function clearErrors(form) {
    form.querySelectorAll(".field-error").forEach(e => e.remove());
    form.querySelectorAll("input, select").forEach(el => {
      const wrap = el.closest(".money-input") || el.closest(".select-wrap") || el;
      wrap.style.borderColor = "";
      wrap.style.boxShadow   = "";
    });
  }

});