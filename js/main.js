'use strict';

/* Shared by every page: helpers for forms and the two team features in the header
   (open/closed status and the cart badge on the Order link). */

const $ = (id) => document.getElementById(id);

// Mark a field as wrong (message) or right (empty message). The red text is the page's own #<id>-error block.
function setFieldState(field, message) {
    const error = $(field.id + '-error');
    const bad = message !== '';
    field.classList.toggle('is-invalid', bad);
    field.classList.toggle('is-valid', !bad);
    field.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (error && bad) {
        error.textContent = message;
    }
    return !bad;
}

function resetFieldStates(form) {
    form.querySelectorAll('.is-invalid, .is-valid').forEach((el) => el.classList.remove('is-invalid', 'is-valid'));
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
}

// Validate a field when the visitor leaves it, and again on every change once it was marked wrong
function liveValidate(form, check) {
    form.addEventListener('focusout', (event) => {
        if (event.target.matches('input:not([type="radio"]):not([type="checkbox"]), textarea, select')) {
            check(event.target);
        }
    });
    form.addEventListener('input', (event) => {
        if (event.target.classList.contains('is-invalid')) {
            check(event.target);
        }
    });
    form.addEventListener('change', (event) => {
        if (event.target.matches('input[type="checkbox"], select')) {
            check(event.target);
        }
    });
}

// Show the red alert (ok = false) or hide it, and move focus to the first wrong field
function reportErrors(form, alertEl, ok) {
    alertEl.classList.toggle('hidden', ok);
    if (!ok) {
        const first = form.querySelector('.is-invalid');
        if (first) {
            first.focus();
        }
    }
}

// Replace the "what happens next" text with the success box
function showSuccess(textEl, successEl) {
    textEl.classList.add('hidden');
    successEl.classList.remove('hidden');
}

function hideSuccess(textEl, successEl) {
    textEl.classList.remove('hidden');
    successEl.classList.add('hidden');
}

function makeEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    if (text !== undefined) {
        el.textContent = text;
    }
    return el;
}

function readStorage(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data === null ? fallback : data;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // private mode: the data lives only until the page is closed
    }
}

// Team feature 1: "Open now / Closed" badge in the title band, updated every minute
function initOpenStatus() {
    const band = document.querySelector('header .bg-primary');
    if (!band) {
        return;
    }
    const badge = makeEl('span', 'badge rounded-pill mt-2');
    badge.id = 'open-status';
    badge.setAttribute('role', 'status');
    band.appendChild(badge);
    const update = () => {
        const status = getOpenStatus(new Date());
        badge.textContent = status.text;
        badge.classList.toggle('text-bg-success', status.open);
        badge.classList.toggle('text-bg-secondary', !status.open);
    };
    update();
    setInterval(update, 60000);
}

// Team feature 2: number of drinks in the cart next to "Order" in the menu, on every page
function initCartBadge() {
    const link = document.querySelector('#mainNav a[href="order.html"]');
    if (!link) {
        return;
    }
    const badge = makeEl('span', 'badge rounded-pill text-bg-warning ms-1');
    badge.id = 'nav-cart-count';
    link.appendChild(badge);
    const update = () => {
        const count = EDCart.count();
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
        badge.setAttribute('aria-label', count + ' drinks in your order');
    };
    EDCart.onChange(update);
    update();
}

initOpenStatus();
initCartBadge();

// Every success box says clearly that this is a demo
function addDemoNote(successEl, text) {
    const note = makeEl('p', 'small mb-0 mt-2 fst-italic', text || 'This is a demo: your data is not sent anywhere and no real order or booking is made.');
    note.classList.add('demo-note');
    successEl.append(note);
}
