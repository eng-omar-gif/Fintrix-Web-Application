/**
 * @fileoverview Goals page UI enhancements for FinTrix.
 * Provides sidebar toggle, active nav-item highlighting,
 * table-row hover effects, auto-dismiss of Django messages,
 * and visual styling for completed goals.
 *
 * @note The original client-side goals logic (add, delete, contribution modal)
 * is preserved in comments above; this module contains only UI enhancements
 * that do not interfere with Django's backend goal management.
 * @module scripts-goals
 */

/**
 * Toggles the mobile sidebar by adding/removing the `"open"` class on `#sidebar`.
 * Also supports keyboard activation (Enter / Space) for accessibility.
 */
const menuToggle = document.getElementById('menuToggle');
const sidebar    = document.getElementById('sidebar');

if (menuToggle && sidebar) {
    /** @listens HTMLElement#click */
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    /**
     * Keyboard handler for the menu toggle button.
     * Activates on Enter or Space to match native button behaviour.
     * @listens HTMLElement#keydown
     * @param {KeyboardEvent} e
     */
    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === "Enter" || e.key === " ") {
            sidebar.classList.toggle('open');
        }
    });
}

/**
 * Highlights the most-recently clicked nav item as active.
 * Removes the `"active"` class from all siblings before applying it to the target.
 * @listens HTMLElement#click
 */
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
    });
});

/**
 * Enables smooth scrolling for the entire document.
 * Applied via `document.documentElement.style` for broad browser support.
 */
document.documentElement.style.scrollBehavior = "smooth";

/**
 * Adds a subtle scale-up hover effect to every row in the goals table
 * (`.goals-table tbody tr`) to improve perceived interactivity.
 * @listens HTMLElement#mouseenter
 * @listens HTMLElement#mouseleave
 */
const rows = document.querySelectorAll('.goals-table tbody tr');
rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
        row.style.transform  = "scale(1.005)";
        row.style.transition = "0.2s ease";
    });
    row.addEventListener('mouseleave', () => {
        row.style.transform = "scale(1)";
    });
});

/**
 * Auto-dismisses Django flash messages (`.messages-alerts li`) after 5 seconds
 * with a 500 ms fade-out transition before DOM removal.
 */
const messages = document.querySelectorAll('.messages-alerts li');
if (messages.length > 0) {
    setTimeout(() => {
        messages.forEach(msg => {
            msg.style.opacity    = "0";
            msg.style.transition = "0.5s ease";
            setTimeout(() => msg.remove(), 500);
        });
    }, 5000);
}

/**
 * Visually styles completed goal name elements (`.goal-name.completed`)
 * with a strikethrough and reduced opacity to indicate completion.
 */
const goalNames = document.querySelectorAll('.goal-name.completed');
goalNames.forEach(goal => {
    goal.style.textDecoration = "line-through";
    goal.style.opacity        = "0.7";
});
