"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ══════════════════════════════════════════════════════
  //  1. PROGRESS BARS — animate on load
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".progress-fill").forEach(bar => {
    const target = bar.style.width || "0%";
    bar.style.width = "0%";
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.width = target; }, 80);
    });
  });


  // ══════════════════════════════════════════════════════
  //  2. AUTO-DISMISS Django messages after 4 seconds
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".msg").forEach(msg => {
    setTimeout(() => {
      msg.style.transition = "opacity 0.4s ease";
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 400);
    }, 4000);
  });


  // ══════════════════════════════════════════════════════
  //  3. ALERT BANNER — dismiss on "Adjust Limit" click
  //     Scrolls to the Add Category form instead
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".alert-banner .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const formCard = document.querySelector(".form-card");
      if (formCard) {
        formCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });


  // ══════════════════════════════════════════════════════
  //  4. GRID / LIST VIEW TOGGLE for category cards
  // ══════════════════════════════════════════════════════
  const gridBtn   = document.getElementById("gridView");
  const listBtn   = document.getElementById("listView");
  const catContainer = document.getElementById("catContainer");

  if (gridBtn && listBtn && catContainer) {
    gridBtn.addEventListener("click", () => {
      catContainer.classList.remove("list-mode");
      gridBtn.classList.add("active");
      listBtn.classList.remove("active");
      localStorage.setItem("budgetView", "grid");
    });

    listBtn.addEventListener("click", () => {
      catContainer.classList.add("list-mode");
      listBtn.classList.add("active");
      gridBtn.classList.remove("active");
      localStorage.setItem("budgetView", "list");
    });

    // Restore last preference
    if (localStorage.getItem("budgetView") === "list") {
      listBtn.click();
    }
  }


  // ══════════════════════════════════════════════════════
  //  5. THRESHOLD TOGGLE (UI only — value sent via hidden input)
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".threshold-toggle").forEach(group => {
    const hiddenInput = group.closest("form")?.querySelector("input[name='threshold']");

    group.querySelectorAll(".threshold-opt").forEach(opt => {
      opt.addEventListener("click", () => {
        group.querySelectorAll(".threshold-opt").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");

        // Update hidden input if it exists
        if (hiddenInput) {
          hiddenInput.value = opt.textContent.replace("%", "").replace("(Default)", "").trim();
        }
      });
    });
  });


  // ══════════════════════════════════════════════════════
  //  6. ADD CATEGORY LIMIT FORM — client-side validation
  //     Form POSTs to Django: add_category_limit view
  //     Fields: category_name (select), limit (number)
  // ══════════════════════════════════════════════════════
  const categoryForm = document.querySelector("form[action*='add-category']");

  if (categoryForm) {
    categoryForm.addEventListener("submit", e => {
      const categoryName = categoryForm.querySelector("select[name='category_name']")?.value;
      const limit        = categoryForm.querySelector("input[name='limit']")?.value;

      clearFieldErrors(categoryForm);

      let valid = true;

      if (!categoryName) {
        showFieldError(categoryForm, "select[name='category_name']", "Please select a category.");
        valid = false;
      }

      if (!limit || parseFloat(limit) <= 0) {
        showFieldError(categoryForm, "input[name='limit']", "Limit must be greater than 0.");
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
      }
    });
  }


  // ══════════════════════════════════════════════════════
  //  7. ADD EXPENSE FORM — client-side validation
  //     Form POSTs to Django: add_expense view
  //     Fields: category_name (select), amount (number), date (date)
  // ══════════════════════════════════════════════════════
  const expenseForm = document.querySelector("form[action*='add-expense']");

  if (expenseForm) {
    expenseForm.addEventListener("submit", e => {
      const categoryName = expenseForm.querySelector("select[name='category_name']")?.value;
      const amount       = expenseForm.querySelector("input[name='amount']")?.value;
      const date         = expenseForm.querySelector("input[name='date']")?.value;

      clearFieldErrors(expenseForm);

      let valid = true;

      if (!categoryName) {
        showFieldError(expenseForm, "select[name='category_name']", "Please select a category.");
        valid = false;
      }

      if (!amount || parseFloat(amount) <= 0) {
        showFieldError(expenseForm, "input[name='amount']", "Amount must be greater than 0.");
        valid = false;
      }

      if (!date) {
        showFieldError(expenseForm, "input[name='date']", "Please select a date.");
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
      }
    });

    // Default date to today
    const dateInput = expenseForm.querySelector("input[name='date']");
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split("T")[0];
    }
  }


  // ══════════════════════════════════════════════════════
  //  8. CREATE BUDGET FORM — client-side validation
  //     Form POSTs to Django: create_budget view
  //     Fields: month (date), category_name (select), limit (number)
  // ══════════════════════════════════════════════════════
  const createForm = document.querySelector("form[action*='create']");

  if (createForm) {
    createForm.addEventListener("submit", e => {
      const month        = createForm.querySelector("input[name='month']")?.value;
      const categoryName = createForm.querySelector("select[name='category_name']")?.value;
      const limit        = createForm.querySelector("input[name='limit']")?.value;

      clearFieldErrors(createForm);

      let valid = true;

      if (!month) {
        showFieldError(createForm, "input[name='month']", "Please select a month.");
        valid = false;
      }

      if (!categoryName) {
        showFieldError(createForm, "select[name='category_name']", "Please select a category.");
        valid = false;
      }

      if (!limit || parseFloat(limit) <= 0) {
        showFieldError(createForm, "input[name='limit']", "Limit must be greater than 0.");
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
      }
    });
  }


  // ══════════════════════════════════════════════════════
  //  9. SEARCH — filter category cards by name
  // ══════════════════════════════════════════════════════
  const searchInput = document.querySelector(".search-wrap input");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();

      document.querySelectorAll(".cat-card").forEach(card => {
        const name = card.querySelector(".cat-name")?.textContent.toLowerCase() || "";
        card.style.display = name.includes(query) ? "" : "none";
      });

      // Also filter dashboard budget cards
      document.querySelectorAll(".budget-card").forEach(card => {
        const month = card.querySelector(".budget-month")?.textContent.toLowerCase() || "";
        card.style.display = month.includes(query) ? "" : "none";
      });
    });
  }


  // ══════════════════════════════════════════════════════
  //  10. EXPORT — prints the current budget view
  // ══════════════════════════════════════════════════════
  const exportBtn = document.querySelector(".btn.secondary[class*='export'], .title-actions .btn.secondary");

  if (exportBtn && exportBtn.textContent.trim().toLowerCase().includes("export")) {
    exportBtn.addEventListener("click", () => {
      window.print();
    });
  }


  // ══════════════════════════════════════════════════════
  //  11. + NEW BUDGET button — smooth scroll or navigate
  // ══════════════════════════════════════════════════════
  const newBudgetBtn = document.querySelector(".title-actions .btn.primary");

  if (newBudgetBtn && newBudgetBtn.tagName === "A") {
    // It's a link — Django url 'create_budget', let it navigate naturally
    // No override needed
  }


  // ══════════════════════════════════════════════════════
  //  12. MORE BUTTON (⋯) on category cards — placeholder menu
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".more-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();

      // Close any open menus first
      document.querySelectorAll(".more-menu").forEach(m => m.remove());

      const menu = document.createElement("div");
      menu.className = "more-menu";
      menu.innerHTML = `
        <button class="more-menu-item">Edit Limit</button>
        <button class="more-menu-item danger-item">Remove Category</button>
      `;

      // Position relative to button
      const rect = btn.getBoundingClientRect();
      menu.style.cssText = `
        position: fixed;
        top: ${rect.bottom + 4}px;
        left: ${rect.left - 100}px;
        background: white;
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        z-index: 1000;
        min-width: 140px;
        overflow: hidden;
      `;

      const items = menu.querySelectorAll(".more-menu-item");
      items.forEach(item => {
        item.style.cssText = `
          display: block; width: 100%;
          padding: 10px 14px; font-size: 13px;
          background: none; border: none; text-align: left;
          cursor: pointer; color: var(--text);
          font-family: 'DM Sans', sans-serif;
        `;
      });

      const dangerItem = menu.querySelector(".danger-item");
      if (dangerItem) dangerItem.style.color = "var(--danger)";

      document.body.appendChild(menu);

      // Close on outside click
      setTimeout(() => {
        document.addEventListener("click", () => menu.remove(), { once: true });
      }, 0);
    });
  });


  // ══════════════════════════════════════════════════════
  //  HELPERS
  // ══════════════════════════════════════════════════════

  /**
   * Show an inline error message below a field.
   * @param {HTMLElement} form - the parent form
   * @param {string} selector - CSS selector for the field
   * @param {string} message - error text to display
   */
  function showFieldError(form, selector, message) {
    const field = form.querySelector(selector);
    if (!field) return;

    field.style.borderColor = "var(--danger)";
    field.style.boxShadow   = "0 0 0 3px rgba(192,57,43,0.12)";

    const err = document.createElement("span");
    err.className = "field-error";
    err.textContent = message;
    err.style.cssText = "font-size:11px; color:var(--danger); margin-top:3px; display:block;";

    const parent = field.closest(".input-prefix") || field;
    parent.insertAdjacentElement("afterend", err);
  }

  /**
   * Remove all inline errors from a form.
   * @param {HTMLElement} form
   */
  function clearFieldErrors(form) {
    form.querySelectorAll(".field-error").forEach(e => e.remove());
    form.querySelectorAll("input, select").forEach(el => {
      el.style.borderColor = "";
      el.style.boxShadow   = "";
    });
  }

});