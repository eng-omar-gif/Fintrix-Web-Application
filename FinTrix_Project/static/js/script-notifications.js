"use strict";

document.addEventListener("DOMContentLoaded", () => {

  // ══════════════════════════════════════════
  //  1. AUTO-DISMISS Django messages after 4s
  // ══════════════════════════════════════════
  document.querySelectorAll(".dj-msg").forEach(msg => {
    setTimeout(() => {
      msg.style.transition = "opacity 0.4s";
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 400);
    }, 4000);
  });


  // ══════════════════════════════════════════
  //  2. SEARCH — filter notification items by title
  // ══════════════════════════════════════════
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      document.querySelectorAll(".notif-item[data-title]").forEach(item => {
        item.style.display = item.dataset.title.includes(q) ? "" : "none";
      });
    });
  }


  // ══════════════════════════════════════════
  //  3. MARK AS READ on item click
  //     Highlights the item visually, then
  //     the form inside submits to mark_as_read view
  // ══════════════════════════════════════════
  document.querySelectorAll(".notif-item").forEach(item => {
    item.addEventListener("click", (e) => {
      // Don't intercept button/link clicks inside the item
      if (e.target.closest("a, button, form")) return;

      // Visual: remove unread styles immediately
      item.classList.remove("notif-unread");
      const dot = item.querySelector(".notif-dot");
      if (dot) dot.remove();
      const accent = item.querySelector(".notif-accent");
      if (accent) accent.style.background = "transparent";

      // POST to mark_as_read via the hidden form
      const notifId = item.dataset.id;
      if (notifId) {
        submitMarkAsRead(notifId);
      }
    });
  });


  // ══════════════════════════════════════════
  //  4. VIEW EARLIER — toggle hidden items
  // ══════════════════════════════════════════
  const viewEarlier = document.querySelector(".view-earlier");
  if (viewEarlier) {
    viewEarlier.addEventListener("click", () => {
      // In a real app this would paginate — here we just show all
      viewEarlier.style.display = "none";
    });
  }


  // ══════════════════════════════════════════
  //  5. ANIMATE items on load (staggered)
  // ══════════════════════════════════════════
  document.querySelectorAll(".notif-item").forEach((item, i) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(8px)";
    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
    }, 60 + i * 50);
  });


  // ══════════════════════════════════════════
  //  HELPER — submit markAsRead via dynamic form
  // ══════════════════════════════════════════
  function submitMarkAsRead(notifId) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/notifications/${notifId}/read/`;
    form.style.display = "none";
    form.innerHTML = `<input type="hidden" name="csrfmiddlewaretoken" value="${getCSRF()}">`;
    document.body.appendChild(form);
    form.submit();
  }

  function getCSRF() {
    return document.cookie
      .split(";")
      .find(c => c.trim().startsWith("csrftoken="))
      ?.split("=")[1] || "";
  }

});