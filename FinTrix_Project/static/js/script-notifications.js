/**
 * @fileoverview Notifications page controller for FinTrix.
 * Handles message auto-dismiss, search filtering, mark-as-read,
 * and staggered entrance animations for notification items.
 * @module script-notifications
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /**
   * Auto-dismisses Django flash messages (`.dj-msg`) after 4 seconds
   * with a 400 ms fade-out transition before DOM removal.
   */
  document.querySelectorAll(".dj-msg").forEach(msg => {
    setTimeout(() => {
      msg.style.transition = "opacity 0.4s";
      msg.style.opacity    = "0";
      setTimeout(() => msg.remove(), 400);
    }, 4000);
  });

  /**
   * Filters `.notif-item[data-title]` elements in real-time based on
   * text typed into `#searchInput`. Matching is case-insensitive.
   * @listens HTMLInputElement#input
   */
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      document.querySelectorAll(".notif-item[data-title]").forEach(item => {
        item.style.display = item.dataset.title.includes(q) ? "" : "none";
      });
    });
  }

  /**
   * Marks a notification as read when the user clicks on its row.
   * - Immediately removes the unread visual indicators (`.notif-unread`,
   *   `.notif-dot`, `.notif-accent` highlight).
   * - Submits a silent POST to `/notifications/{id}/read/` via a
   *   dynamically created form.
   *
   * Clicks on interactive children (links, buttons, forms) are not intercepted.
   * @listens HTMLElement#click
   */
  document.querySelectorAll(".notif-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (e.target.closest("a, button, form")) return;

      item.classList.remove("notif-unread");
      const dot    = item.querySelector(".notif-dot");
      if (dot) dot.remove();
      const accent = item.querySelector(".notif-accent");
      if (accent) accent.style.background = "transparent";

      const notifId = item.dataset.id;
      if (notifId) submitMarkAsRead(notifId);
    });
  });

  /**
   * Hides the "View Earlier" button when clicked.
   * In a production build this would trigger pagination.
   * @listens HTMLElement#click
   */
  const viewEarlier = document.querySelector(".view-earlier");
  if (viewEarlier) {
    viewEarlier.addEventListener("click", () => {
      viewEarlier.style.display = "none";
    });
  }

  /**
   * Applies a staggered fade-in + slide-up entrance animation to all
   * `.notif-item` elements on page load.
   * Items animate sequentially with a 50 ms delay between each.
   */
  document.querySelectorAll(".notif-item").forEach((item, i) => {
    item.style.opacity   = "0";
    item.style.transform = "translateY(8px)";
    item.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    setTimeout(() => {
      item.style.opacity   = "1";
      item.style.transform = "translateY(0)";
    }, 60 + i * 50);
  });

  /**
   * Creates and submits a hidden form to POST a mark-as-read request
   * for the given notification ID to `/notifications/{id}/read/`.
   *
   * @param {string|number} notifId - The ID of the notification to mark as read.
   * @returns {void}
   */
  function submitMarkAsRead(notifId) {
    const form     = document.createElement("form");
    form.method    = "POST";
    form.action    = `/notifications/${notifId}/read/`;
    form.style.display = "none";
    form.innerHTML = `<input type="hidden" name="csrfmiddlewaretoken" value="${getCSRF()}">`;
    document.body.appendChild(form);
    form.submit();
  }

  /**
   * Reads the Django CSRF token from `document.cookie`.
   * @returns {string} The CSRF token, or an empty string if not found.
   */
  function getCSRF() {
    return document.cookie
      .split(";")
      .find(c => c.trim().startsWith("csrftoken="))
      ?.split("=")[1] || "";
  }

});
