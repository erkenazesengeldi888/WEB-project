'use strict';

/* Menu page.
   Feature 1: search and category filter with highlighted matches, sizes that change the price, cart panel, drink window.
   Feature 2: "Surprise me" picks a random coffee and offers to add it to the cart. */

const cards = [...document.querySelectorAll('.menu-item')];
const menuIndex = cards.map((card) => ({
    name: card.dataset.name,
    category: card.closest('.menu-category').dataset.category,
    card
}));

// The orange juice card has an emoji box in the HTML: swap it for the real photo (same markup as the other cards)
cards.filter((card) => card.dataset.name === 'Orange').forEach((card) => {
    const empty = card.querySelector('.drink-photo-empty');
    if (!empty) {
        return;
    }
    const photo = makeEl('img', 'drink-photo');
    photo.src = 'images/menu/orange.jpg';
    photo.alt = 'Orange';
    photo.width = 520;
    photo.height = 520;
    photo.loading = 'lazy';
    empty.replaceWith(photo);
});

// ---------- sizes: the price follows the chosen size ----------
function selectedSize(card) {
    return card.querySelector('.drink-size.active');
}

function currentPrice(card) {
    const active = selectedSize(card);
    return active ? Number(active.dataset.price) : Number(card.querySelector('.drink-price').textContent.replace(/\D/g, ''));
}

function currentSizeLabel(card) {
    const active = selectedSize(card);
    if (active) {
        return active.textContent.trim();
    }
    const note = card.closest('.menu-category').querySelector('.text-muted.small');
    const fromCategory = note && note.textContent.match(/^\d+ ml$/);
    return card.dataset.volume || (fromCategory ? fromCategory[0] : '');
}

document.querySelectorAll('.drink-card').forEach((card) => {
    const price = card.querySelector('.drink-price');
    card.querySelectorAll('.drink-size').forEach((button) => {
        button.addEventListener('click', () => {
            card.querySelectorAll('.drink-size').forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            price.textContent = formatPrice(Number(button.dataset.price));
        });
    });
});

// ---------- search and filter ----------
const searchForm = $('menu-search-form');
const searchInput = $('menu-search');
const categorySelect = $('menu-category-filter');
const statusEl = $('menu-search-status');
const emptyEl = $('menu-search-empty');
const sections = [...document.querySelectorAll('.menu-category')];
const DEFAULT_STATUS = statusEl.textContent;

// Show the drink name with the found part marked (textContent only, the term is user input)
function showName(card, term) {
    const button = card.querySelector('.drink-open');
    if (!button) {
        return;
    }
    const name = card.dataset.name;
    const start = term ? name.toLowerCase().indexOf(term) : -1;
    if (start === -1) {
        button.textContent = name;
        return;
    }
    const end = start + term.length;
    button.replaceChildren(
        document.createTextNode(name.slice(0, start)),
        makeEl('span', 'highlight', name.slice(start, end)),
        document.createTextNode(name.slice(end))
    );
}

function applyFilter() {
    const term = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const found = searchDrinks(menuIndex, term, category);

    menuIndex.forEach((entry) => {
        const visible = found.includes(entry);
        (entry.card.closest('.col') || entry.card).classList.toggle('hidden', !visible);
        showName(entry.card, visible ? term : '');
    });
    sections.forEach((section) => {
        section.classList.toggle('hidden', !found.some((entry) => entry.card.closest('.menu-category') === section));
    });

    emptyEl.classList.toggle('hidden', found.length > 0);
    if (term === '' && category === 'all') {
        statusEl.textContent = DEFAULT_STATUS;
    } else {
        statusEl.textContent = 'Found ' + found.length + ' drink' + (found.length === 1 ? '' : 's') + '.';
    }
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilter();
});
searchInput.addEventListener('input', applyFilter);
categorySelect.addEventListener('change', applyFilter);
searchForm.addEventListener('reset', () => setTimeout(applyFilter, 0));

// ---------- cart panel ----------
function cartRow(item) {
    const li = makeEl('li', 'list-group-item px-0');

    const top = makeEl('div', 'd-flex justify-content-between');
    const remove = makeEl('button', 'btn-close btn-sm');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove ' + item.name);
    remove.addEventListener('click', () => EDCart.setQty(item.name, item.size, item.price, 0));
    top.append(makeEl('span', 'fw-semibold', EDCart.label(item)), remove);

    const minus = makeEl('button', 'btn btn-outline-primary btn-sm cart-step', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Less ' + item.name);
    minus.addEventListener('click', () => EDCart.setQty(item.name, item.size, item.price, item.qty - 1));
    const plus = makeEl('button', 'btn btn-outline-primary btn-sm cart-step', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'More ' + item.name);
    plus.addEventListener('click', () => EDCart.setQty(item.name, item.size, item.price, item.qty + 1));
    const stepper = makeEl('div', 'd-flex align-items-center gap-2');
    stepper.append(minus, makeEl('span', 'cart-qty', String(item.qty)), plus);

    const row = makeEl('div', 'd-flex justify-content-between align-items-center mt-1');
    row.append(stepper, makeEl('strong', 'text-primary', EDCart.format(item.qty * item.price)));

    li.append(top, row);
    return li;
}

function renderCart() {
    const items = EDCart.items();
    const has = items.length > 0;
    $('cart-items').replaceChildren(...items.map(cartRow));
    $('cart-empty').classList.toggle('hidden', has);
    $('cart-total-row').classList.toggle('hidden', !has);
    $('cart-actions').classList.toggle('hidden', !has);
    $('cart-total').textContent = EDCart.format(EDCart.total());
    $('cart-count').textContent = EDCart.count();
    $('cart-fab-total').textContent = has ? EDCart.format(EDCart.total()) : '';
}

// Flash "Added" on a button for a moment
function flashAdded(button, doneText) {
    const original = button.textContent;
    button.textContent = doneText;
    button.classList.add('added');
    setTimeout(() => {
        button.textContent = original;
        button.classList.remove('added');
    }, 900);
}

document.addEventListener('click', (event) => {
    const button = event.target.closest('.add-to-cart');
    if (!button) {
        return;
    }
    const card = button.closest('.menu-item');
    EDCart.add(card.dataset.name, currentSizeLabel(card), currentPrice(card));
    flashAdded(button, '✓ Added');
});
$('cart-clear').addEventListener('click', () => EDCart.clear());
EDCart.onChange(renderCart);
renderCart();

// ---------- drink details window ----------
const modalEl = $('drink-modal');
const modal = new bootstrap.Modal(modalEl);
let openCard = null;

// Coffee drinks can be customised in the window: milk, extra shot, decaf, syrups, free additions
const CUSTOM_CATEGORIES = ['coffee', 'iced-coffee'];
const picker = createExtrasPicker('menu-');
const customBox = makeEl('div', 'mt-3 hidden');
customBox.id = 'drink-modal-custom';
customBox.append(makeEl('p', 'small fw-semibold mb-2', 'Customise your drink'), picker.element);
$('drink-modal-add').before(customBox);

const isCustom = (card) => CUSTOM_CATEGORIES.includes(card.closest('.menu-category').dataset.category);
const hasMilk = (card) => /milk/i.test(card.dataset.ingredients);

// Price in the window: the size price plus the extras
function modalPrice() {
    return currentPrice(openCard) + (isCustom(openCard) ? calcExtras(picker.options(), hasMilk(openCard)) : 0);
}

picker.onChange(() => {
    $('drink-modal-price').textContent = formatPrice(modalPrice());
});

function fillModal() {
    const sizes = openCard.querySelectorAll('.drink-size');
    const active = selectedSize(openCard);
    $('drink-modal-price').textContent = formatPrice(modalPrice());

    const meta = [];
    if (sizes.length) {
        meta.push(active.textContent.trim());
    } else if (openCard.dataset.volume) {
        meta.push(openCard.dataset.volume);
    }
    meta.push(openCard.closest('.menu-category').querySelector('h2').textContent.trim());
    $('drink-modal-meta').textContent = meta.join(' · ');

    $('drink-modal-sizes-wrap').classList.toggle('hidden', sizes.length < 2);
    $('drink-modal-sizes').replaceChildren(...[...sizes].map((source) => {
        const isActive = source === active;
        const button = makeEl('button', 'drink-size btn btn-sm' + (isActive ? ' active' : ''), source.textContent);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(isActive));
        button.addEventListener('click', () => {
            source.click();
            fillModal();
        });
        return button;
    }));
}

document.addEventListener('click', (event) => {
    const opener = event.target.closest('.drink-open');
    if (!opener) {
        return;
    }
    openCard = opener.closest('.drink-card');
    const photo = openCard.querySelector('img.drink-photo');
    const modalPhoto = $('drink-modal-photo');
    $('drink-modal-title').textContent = openCard.dataset.name;
    if (photo) {
        modalPhoto.src = photo.src;
        modalPhoto.alt = openCard.dataset.name;
    }
    modalPhoto.classList.toggle('hidden', !photo);
    $('drink-modal-desc').textContent = openCard.dataset.desc;
    $('drink-modal-ingredients').replaceChildren(...openCard.dataset.ingredients.split('|').map((text) => makeEl('li', '', text)));
    const custom = isCustom(openCard);
    customBox.classList.toggle('hidden', !custom);
    if (custom) {
        picker.reset();
        picker.setTraits({ milk: hasMilk(openCard), freeMilk: /americano/i.test(openCard.dataset.name) });
    }
    fillModal();
    modal.show();
});

$('drink-modal-add').addEventListener('click', (event) => {
    if (isCustom(openCard)) {
        const options = picker.options();
        EDCart.add(extrasName(openCard.dataset.name, options), currentSizeLabel(openCard), modalPrice());
    } else {
        openCard.querySelector('.add-to-cart').click();
    }
    const button = event.currentTarget;
    button.textContent = '✓ Added to cart';
    setTimeout(() => { button.textContent = 'Add to cart'; }, 1000);
});

// ---------- Surprise me: a random coffee ----------
function initSurprise() {
    const body = document.querySelector('#menu-tools .border-primary .card-body');
    const button = makeEl('button', 'btn btn-outline-primary btn-lg ms-2', 'Surprise me');
    button.type = 'button';
    button.id = 'menu-surprise';
    const message = makeEl('p', 'mt-3 mb-0');
    message.id = 'menu-surprise-text';
    message.setAttribute('aria-live', 'polite');
    body.append(button);
    body.append(message);

    let marked = null;
    button.addEventListener('click', () => {
        const pick = pickRandom(DRINKS);
        const entry = menuIndex.find((e) => e.name === pick.name);
        if (!entry) {
            return;
        }
        // make sure the card is not hidden by a search
        searchForm.reset();
        if (marked) {
            marked.classList.remove('active');
        }
        marked = entry.card;
        marked.classList.add('active');
        marked.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const add = makeEl('button', 'btn btn-primary btn-sm ms-2', 'Add to cart');
        add.type = 'button';
        add.addEventListener('click', () => {
            EDCart.add(pick.name, pick.size, pick.price);
            flashAdded(add, '✓ Added');
        });
        message.replaceChildren(
            document.createTextNode('How about a ' + pick.name + '? ' + formatPrice(pick.price) + ' for ' + pick.size + '.'),
            add
        );
    });
}

initSurprise();
