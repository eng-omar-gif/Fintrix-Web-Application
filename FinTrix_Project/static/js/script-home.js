/**
 * @fileoverview Home (landing) page scripts for FinTrix.
 * Provides smooth anchor scrolling, newsletter form handling,
 * and scroll-triggered fade-in animations for key sections.
 * @module script-home
 */

/**
 * Attaches smooth-scroll behaviour to all anchor links (`<a href="#...">`)
 * on the page. Prevents default jump and scrolls the target into view.
 * @listens document#click (delegated via querySelectorAll)
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/**
 * Handles newsletter subscription form submission.
 * Prevents the default form POST, shows a confirmation alert,
 * and resets the form fields.
 *
 * @param {SubmitEvent} e - The form submit event.
 * @returns {void}
 */
function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    alert('Thank you for subscribing! We\'ll send updates to ' + email);
    e.target.reset();
}

/**
 * Configuration for the Intersection Observer used to animate
 * elements as they enter the viewport.
 *
 * @type {IntersectionObserverInit}
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

/**
 * Intersection Observer instance that fades in and slides up
 * observed elements when they become visible in the viewport.
 *
 * @type {IntersectionObserver}
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

/**
 * Applies initial hidden state (opacity 0, translateY 20px) to
 * `.features-col`, `.value-inner`, and `.cta-inner` elements,
 * then registers each with the scroll observer so they animate in on view.
 */
document.querySelectorAll('.features-col, .value-inner, .cta-inner').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
