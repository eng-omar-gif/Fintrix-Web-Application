document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("budgetForm");
  const newBtn = document.getElementById("newBtn");
  const exportBtn = document.getElementById("exportBtn");

  document.querySelectorAll(".progress-bar").forEach(el => {
    const width = el.getAttribute("data-width") || 0;
    el.style.width = width + "%";
  });

  // ✅ Smooth scroll to form
  if (newBtn) {
    newBtn.onclick = (e) => {
      e.preventDefault();
      const formSection = document.querySelector(".form");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth" });
      }
    };
  }

  // ✅ Export (basic placeholder)
  if (exportBtn) {
    exportBtn.onclick = () => {
      alert("Export feature can be implemented from backend.");
    };
  }

  // ✅ Simple validation (DO NOT block Django)
  if (form) {
    form.addEventListener("submit", (e) => {

      const name = document.getElementById("name")?.value;
      const limit = document.getElementById("limit")?.value;

      if (!name || !limit) {
        e.preventDefault(); // stop only if invalid
        alert("Please fill all fields");
      }

    });
  }

});