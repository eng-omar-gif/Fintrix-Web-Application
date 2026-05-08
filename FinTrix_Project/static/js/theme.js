/**
 * FinTrix Theme Manager — theme.js
 * Handles: light/dark toggle, persistence, system preference, SSR flash prevention.
 * Works with: theme-global.css  +  fintrix_theme_toggle.html
 */
(function () {
  'use strict';

  var KEY  = 'fintrix-theme';
  var root = document.documentElement;

  /* ── Storage helpers ─────────────────────────────────────── */
  function getStored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function setStored(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  /* ── Resolve preferred theme ─────────────────────────────── */
  function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch (e) {}
    return 'light';
  }

  /* ── Apply theme to DOM ──────────────────────────────────── */
  function apply(theme) {
    var t = resolveTheme(theme);
    root.setAttribute('data-theme', t);
    setStored(t);

    /* Toggle component: new pill style */
    /* (CSS handles icon swap via [data-theme] attribute — no JS needed) */

    /* Legacy icon spans — backwards compat */
    root.querySelectorAll && root.querySelectorAll('.theme-icon-moon').forEach(function (el) {
      el.hidden = (t === 'dark');
    });
    root.querySelectorAll && root.querySelectorAll('.theme-icon-sun').forEach(function (el) {
      el.hidden = (t === 'light');
    });

    /* Update aria-pressed on all toggle buttons */
    var btns = document.querySelectorAll ? document.querySelectorAll('#theme-toggle') : [];
    btns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    });

    /* Notify charts / other components */
    try {
      document.dispatchEvent(new CustomEvent('FinTrixThemeChanged', { detail: { theme: t } }));
    } catch (e) {}
  }

  /* ── Toggle ──────────────────────────────────────────────── */
  function toggle() {
    var cur = root.getAttribute('data-theme') || 'light';
    apply(cur === 'dark' ? 'light' : 'dark');
  }

  /* ── Flash prevention: run immediately (before paint) ────── */
  apply(getStored());

  /* ── Wire up after DOM ready ─────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    /* Re-apply in case inline script ran before body rendered */
    apply(getStored() || root.getAttribute('data-theme') || 'light');

    /* Bind all toggle buttons (handles multiple includes on page) */
    document.querySelectorAll('#theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });

    /* System preference change listener */
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        /* Only follow system if user hasn't set a manual preference */
        if (!getStored()) apply(e.matches ? 'dark' : 'light');
      });
    } catch (e) {}
  });

  /* ── Public API ──────────────────────────────────────────── */
  window.FinTrixTheme = { apply: apply, toggle: toggle, getStored: getStored };

})();