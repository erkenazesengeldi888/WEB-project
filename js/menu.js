'use strict';

const CUSTOM_CATEGORIES = ['coffee', 'iced-coffee'];

function makeStepper(onChange) {
    const element = makeEl('div', 'qty-stepper d-inline-flex align-items-center gap-2');
    const minus = makeEl('button', 'btn btn-outline-primary btn-sm cart-step', '−');
    minus.type = 'button';
    minus.setAttribute('aria-label', 'Remove one');
    minus.addEventListener('click', () => onChange(-1));
    const count = makeEl('span', 'cart-qty qty-count', '0');
    count.setAttribute('aria-live', 'polite');
    const plus = makeEl('button', 'btn btn-outline-primary btn-sm cart-step', '+');
    plus.type = 'button';
    plus.setAttribute('aria-label', 'Add one more');
    plus.addEventListener('click', () => onChange(1));
    element.append(minus, count, plus);
    return element;
}

function isCustomDrink(card) {
    return card.classList.contains('drink-card') && CUSTOM_CATEGORIES.includes(card.closest('.menu-category').dataset.category);
}

function customLines(card) {
    const name = card.dataset.name;
    return EDCart.items().filter((line) => line.name === name || line.name.startsWith(name + ' ('));
}

function cardStepper(card) {
    return makeStepper((delta) => {
        if (isCustomDrink(card)) {
            const lines = customLines(card);
            const line = lines[lines.length - 1];
            if (line) {
                EDCart.setQty(line.name, line.size, line.price, line.qty + delta);
            }
            return;
        }
        const size = currentSizeLabel(card);
        const price = currentPrice(card);
        EDCart.setQty(card.dataset.name, size, price, EDCart.qty(card.dataset.name, size, price) + delta);
    });
}

function drinkCard(item) {
    const col = makeEl('div', 'col');
    const card = makeEl('article', 'card drink-card h-100 shadow-sm menu-item');
    card.dataset.key = item.key;
    card.dataset.desc = item.desc;
    card.dataset.ingredients = item.ingredients.join('|');
    card.dataset.volume = item.volume;
    card.dataset.name = item.name;

    if (item.photo) {
        const photo = makeEl('img', 'drink-photo');
        photo.src = item.photo;
        photo.alt = item.name;
        photo.width = 520;
        photo.height = 520;
        photo.loading = 'lazy';
        card.append(photo);
    }

    const body = makeEl('div', 'card-body d-flex flex-column pb-2');
    const open = makeEl('button', 'drink-open stretched-link', item.name);
    open.type = 'button';
    open.setAttribute('aria-haspopup', 'dialog');
    const title = makeEl('h3', 'h6 drink-name mb-2');
    title.append(open);
    if (item.isNew) {
        title.append(' ', makeEl('span', 'badge text-bg-primary align-middle', 'JANA'));
    }
    body.append(title);

    if (item.sizes.length > 0) {
        const sizes = makeEl('div', 'drink-sizes d-flex flex-wrap gap-1 mb-2');
        sizes.setAttribute('role', 'group');
        sizes.setAttribute('aria-label', 'Size, ' + item.name);
        item.sizes.forEach(([label, price], index) => {
            const button = makeEl('button', 'drink-size btn btn-sm' + (index === 0 ? ' active' : ''), label);
            button.type = 'button';
            button.dataset.price = String(price);
            button.setAttribute('aria-pressed', String(index === 0));
            sizes.append(button);
        });
        body.append(sizes);
    }

    const add = makeEl('button', 'btn btn-primary btn-sm add-to-cart', 'Add');
    add.type = 'button';
    add.setAttribute('aria-label', 'Add ' + item.name + ' to cart');
    const row = makeEl('div', 'mt-auto d-flex flex-wrap justify-content-between align-items-center gap-2');
    const stepper = cardStepper(card);
    stepper.classList.add('hidden', 'ms-auto');
    row.append(makeEl('span', 'drink-price fw-bold text-primary', formatPrice(item.price)), add, stepper);
    body.append(row);

    card.append(body);
    col.append(card);
    return col;
}

function listRow(item) {
    const add = makeEl('button', 'btn btn-primary btn-sm add-to-cart ms-3', 'Add');
    add.type = 'button';
    add.setAttribute('aria-label', 'Add ' + item.name + ' to cart');
    const li = makeEl('li', 'list-group-item menu-item d-flex justify-content-between align-items-center');
    li.dataset.name = item.name;
    li.dataset.price = String(item.price);
    const stepper = cardStepper(li);
    stepper.classList.add('hidden', 'ms-3');
    li.append(makeEl('span', '', item.name), makeEl('span', 'fw-bold text-nowrap ms-3', item.price + ' \u20b8'), add, stepper);
    return li;
}

document.querySelectorAll('.menu-category').forEach((section) => {
    const category = section.dataset.category;
    const grid = section.querySelector('.row');
    const list = section.querySelector('ul.list-group');
    if (grid) {
        grid.replaceChildren(...MENU_DRINKS.filter((item) => item.category === category).map(drinkCard));
    }
    if (list) {
        list.replaceChildren(...MENU_LIST.filter((item) => item.category === category).map(listRow));
    }
});

const cards = [...document.querySelectorAll('.menu-item')];
const menuIndex = cards.map((card) => ({
    name: card.dataset.name,
    category: card.closest('.menu-category').dataset.category,
    card
}));

function selectedSize(card) {
    return card.querySelector('.drink-size.active');
}

function currentPrice(card) {
    const active = selectedSize(card);
    if (active) {
        return Number(active.dataset.price);
    }

    return card.dataset.price ? Number(card.dataset.price) : Number(card.querySelector('.drink-price').textContent.replace(/\D/g, ''));
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
            syncCardControls();
        });
    });
});

const searchForm = byId('menu-search-form');
const searchInput = byId('menu-search');
const categorySelect = byId('menu-category-filter');
const statusEl = byId('menu-search-status');
const emptyEl = byId('menu-search-empty');
const sections = [...document.querySelectorAll('.menu-category')];
const DEFAULT_STATUS = statusEl.textContent;

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

function renderCartButton() {
    const has = EDCart.count() > 0;
    byId('cart-count').textContent = EDCart.count();
    byId('cart-fab-total').textContent = has ? EDCart.format(EDCart.total()) : '';
}

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
    if (isCustomDrink(card)) {
        openDrinkWindow(card);
        return;
    }
    EDCart.add(card.dataset.name, currentSizeLabel(card), currentPrice(card));
});
EDCart.onChange(renderCartButton);
renderCartButton();

const modalEl = byId('drink-modal');
const modal = new bootstrap.Modal(modalEl);
let openCard = null;

const picker = createExtrasPicker('menu-');
const customBox = makeEl('div', 'mt-3 hidden');
customBox.id = 'drink-modal-custom';
customBox.append(makeEl('p', 'small fw-semibold mb-2', 'Customise your drink'), picker.element);
byId('drink-modal-add').before(customBox);

const modalAddButton = byId('drink-modal-add');
let closeTimer = null;

function resetModalAddButton() {
    clearTimeout(closeTimer);
    modalAddButton.classList.remove('added');
    modalAddButton.textContent = 'Add to cart';
}

function syncCardControls() {
    document.querySelectorAll('.menu-item').forEach((card) => {
        const addButton = card.querySelector('.add-to-cart');
        const stepper = card.querySelector('.qty-stepper');
        const quantity = isCustomDrink(card)
            ? customLines(card).reduce((sum, line) => sum + line.qty, 0)
            : EDCart.qty(card.dataset.name, currentSizeLabel(card), currentPrice(card));
        addButton.classList.toggle('hidden', quantity > 0);
        stepper.classList.toggle('hidden', quantity === 0);
        stepper.querySelector('.qty-count').textContent = String(quantity);
    });
}

const hasMilk = (card) => /milk/i.test(card.dataset.ingredients);

EDCart.onChange(syncCardControls);
syncCardControls();

function modalPrice() {
    return currentPrice(openCard) + (isCustomDrink(openCard) ? calcExtras(picker.options(), hasMilk(openCard)) : 0);
}

picker.onChange(() => {
    byId('drink-modal-price').textContent = formatPrice(modalPrice());
    resetModalAddButton();
});

function fillModal() {
    const sizes = openCard.querySelectorAll('.drink-size');
    const active = selectedSize(openCard);
    byId('drink-modal-price').textContent = formatPrice(modalPrice());

    const meta = [];
    if (sizes.length) {
        meta.push(active.textContent.trim());
    } else if (openCard.dataset.volume) {
        meta.push(openCard.dataset.volume);
    }
    meta.push(openCard.closest('.menu-category').querySelector('h2').textContent.trim());
    byId('drink-modal-meta').textContent = meta.join(' · ');

    byId('drink-modal-sizes-wrap').classList.toggle('hidden', sizes.length < 2);
    byId('drink-modal-sizes').replaceChildren(...[...sizes].map((source) => {
        const isActive = source === active;
        const button = makeEl('button', 'drink-size btn btn-sm' + (isActive ? ' active' : ''), source.textContent);
        button.type = 'button';
        button.setAttribute('aria-pressed', String(isActive));
        button.addEventListener('click', () => {
            source.click();
            resetModalAddButton();
            fillModal();
        });
        return button;
    }));
}

function openDrinkWindow(card) {
    openCard = card;
    resetModalAddButton();
    const photo = openCard.querySelector('img.drink-photo');
    const modalPhoto = byId('drink-modal-photo');
    byId('drink-modal-title').textContent = openCard.dataset.name;
    if (photo) {
        modalPhoto.src = photo.src;
        modalPhoto.alt = openCard.dataset.name;
    }
    modalPhoto.classList.toggle('hidden', !photo);
    byId('drink-modal-desc').textContent = openCard.dataset.desc;
    byId('drink-modal-ingredients').replaceChildren(...openCard.dataset.ingredients.split('|').map((text) => makeEl('li', '', text)));
    const custom = isCustomDrink(openCard);
    customBox.classList.toggle('hidden', !custom);
    if (custom) {
        picker.reset();
        picker.setTraits({ milk: hasMilk(openCard), freeMilk: /americano/i.test(openCard.dataset.name) });
    }
    fillModal();
    modal.show();
}

document.addEventListener('click', (event) => {
    const opener = event.target.closest('.drink-open');
    if (opener) {
        openDrinkWindow(opener.closest('.drink-card'));
    }
});

modalAddButton.addEventListener('click', () => {
    if (openCard === null) {
        return;
    }
    const name = isCustomDrink(openCard) ? extrasName(openCard.dataset.name, picker.options()) : openCard.dataset.name;
    EDCart.add(name, currentSizeLabel(openCard), modalPrice());
    modalAddButton.classList.add('added');
    modalAddButton.textContent = '✓ Added';
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
        modal.hide();
    }, 700);
});

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

    const pool = menuIndex.filter((e) => e.category !== 'extras');
    let marked = null;
    let hadNoBorder = false;
    button.addEventListener('click', () => {
        const entry = pickRandom(pool);
        const price = currentPrice(entry.card);
        const size = currentSizeLabel(entry.card);

        searchForm.reset();
        if (marked) {
            marked.classList.remove('active', 'border', 'border-danger', 'border-3');
            marked.classList.toggle('border-0', hadNoBorder);
        }
        marked = entry.card;
        hadNoBorder = marked.classList.contains('border-0');
        marked.classList.remove('border-0');
        marked.classList.add('active', 'border', 'border-danger', 'border-3');
        marked.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const add = makeEl('button', 'btn btn-primary btn-sm ms-2', 'Add to cart');
        add.type = 'button';
        add.addEventListener('click', () => {
            EDCart.add(entry.name, size, price);
            flashAdded(add, '✓ Added');
        });
        message.replaceChildren(
            document.createTextNode('How about a '),
            makeEl('span', 'text-danger fw-bold', entry.name),
            document.createTextNode('? ' + formatPrice(price) + (size ? ' for ' + size : '') + '.'),
            add
        );
    });
}

initSurprise();
