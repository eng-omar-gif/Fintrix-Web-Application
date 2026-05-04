document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("budgetForm");
  const container = document.querySelector(".category-grid");
  const alertBox = document.getElementById("alertBox");

  let budgets = [
    { name: "Housing", spent: 3200, limit: 3500 },
    { name: "Food & Dining", spent: 1116, limit: 1200 },
    { name: "Transportation", spent: 450, limit: 800 },
    { name: "Subscriptions", spent: 195, limit: 250 }
  ];

  function render() {
    container.innerHTML = "";

    let total = 0, spent = 0;

    budgets.forEach(b => {
      total += b.limit;
      spent += b.spent;

      const percent = (b.spent / b.limit) * 100;

      const el = document.createElement("div");
      el.className = "category card";

      if (percent >= 85) el.classList.add("danger");

el.innerHTML = `
  <div class="category-header">
    <div class="icon"></div>

    <div class="category-title">
      <p>${b.name}</p>
      <span>${percent >= 85 ? "CRITICAL" : "NORMAL"}</span>
    </div>

    <div class="percent">${Math.round(percent)}%</div>
  </div>

  <h4>$${b.spent} / $${b.limit}</h4>

  <div class="progress">
    <span style="width:${percent}%"></span>
  </div>

  <div class="category-footer">
    <span>Remaining</span>
    <span class="amount">$${b.limit - b.spent}</span>
  </div>
`;

      container.appendChild(el);
    });

    document.getElementById("totalBudget").textContent = `$${total}`;
    
    updateAlert();
  }

  function updateAlert() {
    const bad = budgets.find(b => b.spent / b.limit >= 0.85);

    if (!bad) {
      alertBox.style.display = "none";
      return;
    }

    alertBox.style.display = "flex";
    alertBox.querySelector("span").textContent =
      `Warning: ${bad.name} is almost over budget`;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const limit = parseFloat(document.getElementById("limit").value);

    budgets.push({ name, limit, spent: 0 });

    form.reset();
    render();
  });

  document.getElementById("newBtn").onclick = () => {
    document.querySelector(".form").scrollIntoView({ behavior: "smooth" });
  };

  document.getElementById("exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify(budgets)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "budgets.json";
    a.click();
  };

  render();
});