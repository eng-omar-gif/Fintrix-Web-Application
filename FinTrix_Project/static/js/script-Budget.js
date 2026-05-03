// Precision & Flow Dashboard Logic
document.addEventListener("DOMContentLoaded", () => {

/* 
     ELEMENT SELECTORS
*/
  const form = document.querySelector(".form");
  const categoryContainer = document.querySelector(".category-grid");
  const searchInput = document.querySelector(".header input");
  const alertBox = document.querySelector(".alert");

/*
     DATA STORE (simple state)
 */
  let budgets = [
    { name: "Housing", spent: 3200, limit: 3500 },
    { name: "Food & Dining", spent: 1116, limit: 1200 },
    { name: "Transportation", spent: 450, limit: 800 },
    { name: "Subscriptions", spent: 195, limit: 250 }
  ];

/* 
     RENDER FUNCTION
*/
  function renderBudgets() {
    categoryContainer.innerHTML = "";

    budgets.forEach(budget => {
      const percent = Math.min((budget.spent / budget.limit) * 100, 100);
      const remaining = budget.limit - budget.spent;

      const isDanger = percent >= 85;

      const card = document.createElement("div");
      card.className = `card category ${isDanger ? "danger" : ""}`;

      card.innerHTML = `
        <p>${budget.name}</p>
        <h4>$${budget.spent} / $${budget.limit}</h4>
        <div class="progress">
          <span style="width:${percent}%"></span>
        </div>
        <small>Remaining $${remaining}</small>
      `;

      categoryContainer.appendChild(card);
    });
  }

/*
     ADD NEW BUDGET
*/
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll("input");
    const name = inputs[0].value.trim();
    const limit = parseFloat(inputs[1].value);

    if (!name || isNaN(limit)) {
      showAlert("Please enter valid data");
      return;
    }

    budgets.push({
      name,
      spent: 0,
      limit
    });

    renderBudgets();
    form.reset();
    showAlert("Budget added successfully", "success");
  });

/* 
     SEARCH FILTER
*/
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const cards = document.querySelectorAll(".category");

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(value) ? "block" : "none";
    });
  });

/* 
     ALERT SYSTEM
*/
  function showAlert(message, type = "error") {
    if (!alertBox) return;

    alertBox.querySelector("span").textContent = message;

    if (type === "success") {
      alertBox.style.background = "#d1f7e3";
      alertBox.style.color = "#0a7a3f";
    } else {
      alertBox.style.background = "";
      alertBox.style.color = "";
    }

    alertBox.style.opacity = "1";

    setTimeout(() => {
      alertBox.style.opacity = "0.6";
    }, 3000);
  }

/* 
     BUTTON INTERACTIONS
*/

  // Export button
  document.querySelector(".btn.secondary")?.addEventListener("click", () => {
    console.log("Export triggered");
    showAlert("Export feature coming soon", "success");
  });

  // New Budget button
  document.querySelector(".btn.primary")?.addEventListener("click", () => {
    form.scrollIntoView({ behavior: "smooth" });
  });

/* 
     INITIAL RENDER
*/
  renderBudgets();

});