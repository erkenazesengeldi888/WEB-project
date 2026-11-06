'use strict';

/* Shared by every page: helpers for forms and the two team features in the header
   (open/closed status and the cart badge on the Order link). */

const byId = (id) => document.getElementById(id);

// Mark a field as wrong (message) or right (empty message). The red text is the page's own #<id>-error block.
function setFieldState(field, message) {
    const error = byId(field.id + '-error');
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
    const badge = makeEl('span', 'badge rounded-pill mt-2 fs-6 fw-normal');
    badge.id = 'open-status';
    badge.setAttribute('role', 'status');
    band.appendChild(badge);
    const update = () => {
        const status = getOpenStatus(new Date());
        badge.textContent = status.text;
        badge.classList.toggle('text-bg-success', status.open);
        badge.classList.toggle('text-bg-light', !status.open);
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

/* Look of the pages (the CSS is frozen): this only adds ready-made Bootstrap classes, the same on every page.
   Each rule is [selector, classes to add, classes to remove]. A MutationObserver runs the rules again for every element the
   scripts create later (menu cards, review cards, windows), so new elements look the same as the old ones. */
const LOOK_RULES = [
    ['.card', 'rounded-4', ''],
    ['.card:not(.border-primary):not(.border-2)', 'border-0', ''],
    ['.card-img-top', 'rounded-top-4', ''],
    ['fieldset.border.rounded', 'rounded-4', ''],
    ['img.rounded, .rounded.img-fluid', 'rounded-4 shadow-sm', ''],
    ['.table-responsive', 'rounded-4', ''],
    ['.btn:not(.btn-close):not(.btn-link):not(.drink-size):not(.cart-step):not(.star-button):not(.photo-remove)', 'rounded-pill', ''],
    ['.btn-group .btn', '', 'rounded-pill'],
    ['header .bg-primary.text-white.text-center', 'py-5', 'py-4'],
    ['#site-footer', 'py-5', 'py-4'],
    ['main h2:not(.modal-title)', 'fw-semibold', ''],
    ['main .lead', 'fw-normal', ''],
    ['#menu-category-nav .nav-link', 'text-primary fw-semibold', ''],
    ['.btn-link', 'text-primary', '']
];

function applyLook(root) {
    LOOK_RULES.forEach(([selector, add, remove]) => {
        const found = [...root.querySelectorAll(selector)];
        if (root.matches(selector)) {
            found.push(root);
        }
        found.forEach((element) => {
            if (add) {
                element.classList.add(...add.split(' '));
            }
            if (remove) {
                element.classList.remove(...remove.split(' '));
            }
        });
    });
}

applyLook(document.body);
new MutationObserver((changes) => {
    changes.forEach((change) => {
        change.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                applyLook(node);
            }
        });
    });
}).observe(document.body, { childList: true, subtree: true });
