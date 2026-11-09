'use strict';

const byId = (id) => document.getElementById(id);

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

function reportErrors(form, alertEl, ok) {
    alertEl.classList.toggle('hidden', ok);
    if (!ok) {
        const first = form.querySelector('.is-invalid');
        if (first) {
            first.focus();
        }
    }
}

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

    }
}

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

function addDemoNote(successEl, text) {
    const note = makeEl('p', 'small mb-0 mt-2 fst-italic', text || 'This is a demo: your data is not sent anywhere and no real order or booking is made.');
    note.classList.add('demo-note');
    successEl.append(note);
}

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

const WANTED_FONT = new URLSearchParams(location.search).get('font');
const FONT_NAME = /^[A-Za-z ]{2,30}$/.test(WANTED_FONT || '') ? WANTED_FONT : 'Montserrat';
const BODY_FONT = '"' + FONT_NAME + '", "Helvetica Neue", Helvetica, Arial, "Liberation Sans", sans-serif';
const HEADING_FONT = BODY_FONT;
const HEADING_SELECTOR = 'h1, h2, h3, h4, .h3, .display-4, .display-5, .display-6';

const fontLink = makeEl('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=' + FONT_NAME.replace(/ /g, '+') + ':wght@400;500;600;700&display=swap';
document.head.append(fontLink);
document.documentElement.style.setProperty('--bs-body-font-family', BODY_FONT);

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
    [...root.querySelectorAll(HEADING_SELECTOR), ...(root.matches(HEADING_SELECTOR) ? [root] : [])].forEach((heading) => {
        heading.style.fontFamily = HEADING_FONT;
    });
}

const ZOOM_SCALE = 1.1;
const ZOOM_TRANSITION = 'transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1)';

function applyZoom(root) {
    const pictures = [...root.querySelectorAll('main img')];
    if (root.matches('main img')) {
        pictures.push(root);
    }
    pictures.filter((picture) => !picture.dataset.zoom && !picture.matches('.img-thumbnail, .drink-photo-empty')).forEach((picture) => {
        const frame = picture.parentElement;
        picture.dataset.zoom = 'on';
        frame.classList.add('overflow-hidden');
        if (picture.classList.contains('rounded-4')) {
            frame.classList.add('rounded-4');
        }
        if (picture.classList.contains('rounded-top-4')) {
            frame.classList.add('rounded-top-4');
        }
        picture.style.transition = ZOOM_TRANSITION;
        picture.style.willChange = 'transform';
        frame.addEventListener('mouseenter', () => { picture.style.transform = 'scale(' + ZOOM_SCALE + ')'; });
        frame.addEventListener('mouseleave', () => { picture.style.transform = ''; });
    });
}

function applyAll(root) {
    applyLook(root);
    applyZoom(root);
}

applyAll(document.body);
new MutationObserver((changes) => {
    changes.forEach((change) => {
        change.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                applyAll(node);
            }
        });
    });
}).observe(document.body, { childList: true, subtree: true });
