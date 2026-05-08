/**
 * @fileoverview FinTrix Theme Manager.
 * Handles light/dark theme toggle, `localStorage` persistence,
 * system colour-scheme preference detection, and SSR flash prevention.
 *
 * Works with: `theme-global.css` + `fintrix_theme_toggle.html`
 *
 * @module theme
 */

(function () {
  'use strict';

  /** @constant {string} */
  var KEY  = 'fintrix-theme';

  /** @type {HTMLElement} */
  var root = document.documentElement;

  // ── Storage helpers ───────────────────────────────────────

  /**
   * Retrieves the user's previously stored theme preference.
   * @returns {string|null} `"light"`, `"dark"`, or `null` if not set.
   */
  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  /**
   * Persists the current theme to `localStorage`.
   * Fails silently in private-browsing or restricted contexts.
   * @param {string} theme - The theme to persist (`"light"` or `"dark"`).
   * @returns {void}
   */
  function setStored(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  // ── Resolve preferred theme ───────────────────────────────

  /**
   * Resolves a raw preference string to a valid theme name.
   * Falls back to the OS `prefers-color-scheme` media query, then to `"light"`.
   *
   * @param {string|null} pref - Stored or requested theme (`"light"`, `"dark"`, or any).
   * @returns {"light"|"dark"} Resolved theme name.
   */
  function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  }

  // ── Apply theme to DOM ────────────────────────────────────

  /**
   * Applies a theme to the document by:
   * 1. Setting `data-theme` on `<html>`.
   * 2. Persisting the value to `localStorage`.
   * 3. Toggling legacy `.theme-icon-moon` / `.theme-icon-sun` elements.
   * 4. Updating `aria-pressed` on all `#theme-toggle` buttons.
   * 5. Dispatching the `FinTrixThemeChanged` custom event so charts can redraw.
   *
   * @param {"light"|"dark"|string} theme - The theme to apply.
   * @returns {void}
   * @fires document#FinTrixThemeChanged
   */
  function apply(theme) {
    var t = resolveTheme(theme);
    root.setAttribute('data-theme', t);
    setStored(t);

    // Legacy icon spans — backwards compat
    root.querySelectorAll && root.querySelectorAll('.theme-icon-moon').forEach(function (el) {
      el.hidden = (t === 'dark');
    });
    root.querySelectorAll && root.querySelectorAll('.theme-icon-sun').forEach(function (el) {
      el.hidden = (t === 'light');
    });

    // Update aria-pressed on all toggle buttons
    var btns = document.querySelectorAll ? document.querySelectorAll('#theme-toggle') : [];
    btns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    });

    // Notify charts / other components
    try {
      document.dispatchEvent(new CustomEvent('FinTrixThemeChanged', { detail: { theme: t } }));
    } catch (e) {}
  }

  // ── Toggle ────────────────────────────────────────────────

  /**
   * Toggles the active theme between `"light"` and `"dark"`.
   * @returns {void}
   */
  function toggle() {
    var cur = root.getAttribute('data-theme') || 'light';
    apply(cur === 'dark' ? 'light' : 'dark');
  }

  // ── Flash prevention: run immediately (before paint) ──────

  /**
   * Applies the stored (or system) theme synchronously before the first paint,
   * preventing a flash of the default light theme on dark-mode users.
   */
  apply(getStored());

  // ── Wire up after DOM ready ───────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    // Re-apply in case the inline script ran before the body rendered
    apply(getStored() || root.getAttribute('data-theme') || 'light');

    /**
     * Binds click handlers to all `#theme-toggle` buttons.
     * Multiple includes on the same page are handled gracefully.
     * @listens HTMLElement#click
     */
    document.querySelectorAll('#theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });

    /**
     * Responds to OS-level colour scheme changes.
     * Only applies the new system preference if the user has not set
     * a manual preference (i.e., `getStored()` returns null).
     * @listens MediaQueryList#change
     */
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!getStored()) apply(e.matches ? 'dark' : 'light');
      });
    } catch (e) {}
  });

  // ── Public API ────────────────────────────────────────────

  /**
   * Public API exposed on `window.FinTrixTheme`.
   * @namespace FinTrixTheme
   * @property {function} apply     - {@link apply}
   * @property {function} toggle    - {@link toggle}
   * @property {function} getStored - {@link getStored}
   */
  window.FinTrixTheme = { apply: apply, toggle: toggle, getStored: getStored };

})();
