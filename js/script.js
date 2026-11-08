(function () {
    'use strict';

    /* ---------- DATA ---------- */

    const HOURS = {
        weekday: { open: '07:30', close: '23:00' },
        weekend: { open: '08:00', close: '23:00' }
    };

    const DRINKS = [
        { name: 'Espresso', category: 'coffee', size: '250 ml', price: 690, milk: false, img: 'images/menu/espresso.jpg', desc: 'A short, intense shot with a thick golden crema.' },
        { name: 'Americano', category: 'coffee', size: '250 ml', price: 890, milk: false, freeMilk: true, img: 'images/menu/americano.jpg', desc: 'Espresso topped up with hot water: long and clean.' },
        { name: 'Cappuccino', category: 'coffee', size: '250 ml', price: 1090, milk: true, img: 'images/menu/cappuccino.jpg', desc: 'Espresso with silky milk and a thick foam cap.' },
        { name: 'Latte', category: 'coffee', size: '350 ml', price: 1190, milk: true, img: 'images/menu/latte.jpg', desc: 'A mild coffee with lots of steamed milk.' },
        { name: 'Flat white', category: 'coffee', size: '250 ml', price: 1190, milk: true, img: 'images/menu/flat-white.jpg', desc: 'A double shot with a thin layer of velvety milk.' },
        { name: 'Raf', category: 'coffee', size: '350 ml', price: 1590, milk: true, img: 'images/menu/raf.jpg', desc: 'Espresso whipped with cream and vanilla sugar.' }
    ];

    const EXTRAS = { milk: 450, decaf: 290, syrup: 190, shot: 290 };
    const MILK_TYPES = ['Coconut', 'Oat', 'Banana', 'Lactose-free', 'Almond'];
    const SYRUPS = ['Caramel', 'Salted Caramel', 'Vanilla', 'Coconut', 'Chocolate', 'Macadamia', 'Hazelnut', 'Irish Cream', 'Popcorn'];
    const FREE_EXTRAS = ['Cinnamon', 'Sugar', 'Sweetener'];

    const APP_CASHBACK = 0.10;

    const REVIEW_TITLES = ['', 'A poor experience', 'Could be better', 'A good visit', 'A very good visit', 'An excellent visit'];

    const STORAGE = {
        cart: 'espressoday-cart',
        lastOrder: 'espressoday-last-order',
        reviews: 'espressoday-reviews'
    };

    /* ---------- PURE FUNCTIONS ---------- */

    const pad = (n) => String(n).padStart(2, '0');

    function formatPrice(amount) {
        return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
    }

    function plural(count, word) {
        return count + ' ' + word + (count === 1 ? '' : 's');
    }

    function toMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function minutesToTime(minutes) {
        return pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
    }

    function toTimeString(date) {
        return pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    function parseDateInput(value) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function toDateInputValue(date) {
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    function getHours(date) {
        const day = date.getDay();
        return day === 0 || day === 6 ? HOURS.weekend : HOURS.weekday;
    }

    function getOpenStatus(now) {
        const hours = getHours(now);
        const minutes = now.getHours() * 60 + now.getMinutes();
        if (minutes >= toMinutes(hours.open) && minutes < toMinutes(hours.close)) {
            return { open: true, text: 'Open now · until ' + hours.close };
        }
        if (minutes < toMinutes(hours.open)) {
            return { open: false, text: 'Closed · opens today at ' + hours.open };
        }
        const next = getHours(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
        return { open: false, text: 'Closed · opens tomorrow at ' + next.open };
    }

    function isTimeWithinHours(time, date, lastBeforeClose) {
        const hours = getHours(date);
        const minutes = toMinutes(time);
        return minutes >= toMinutes(hours.open) && minutes <= toMinutes(hours.close) - lastBeforeClose;
    }

    function buildTimeSlots(date, now, step, lastBeforeClose) {
        const hours = getHours(date);
        const slots = [];
        const isToday = toDateInputValue(date) === toDateInputValue(now);
        const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;
        for (let m = toMinutes(hours.open); m <= toMinutes(hours.close) - lastBeforeClose; m += step) {
            if (m >= earliest) {
                slots.push(minutesToTime(m));
            }
        }
        return slots;
    }

    function generateOrderNumber() {
        return 'ED-' + (1000 + Math.floor(Math.random() * 9000));
    }

    function calcTotal(items) {
        let total = 0;
        for (const item of items) {
            total += item.qty * item.price;
        }
        return total;
    }

    function calcCount(items) {
        return items.reduce((sum, item) => sum + item.qty, 0);
    }

    function calcCashback(total) {
        return Math.floor(total * APP_CASHBACK);
    }

    function pickRandom(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function searchDrinks(list, term, category) {
        const query = term.trim().toLowerCase();
        return list.filter((d) => (category === 'all' || d.category === category) && (query === '' || d.name.toLowerCase().includes(query)));
    }

    function pickDrinks(list, milk, maxPrice) {
        return list.filter((d) => (milk === 'any' || d.milk === (milk === 'yes')) && (maxPrice === 0 || d.price <= maxPrice));
    }

    function isValidName(value) {
        return value.trim().length >= 2;
    }

    function isValidPhone(value) {
        const trimmed = value.trim();
        if (!/^\+?[\d\s()-]+$/.test(trimmed)) {
            return false;
        }
        const digits = trimmed.replace(/\D/g, '');
        return digits.length === 10 || (digits.length === 11 && (digits[0] === '7' || digits[0] === '8'));
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    }

    function averageRating(ratings) {
        if (ratings.length === 0) {
            return 0;
        }
        return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
    }

    function calcExtras(options, hasMilk) {
        let price = options.syrups.length * EXTRAS.syrup;
        if (options.milk && hasMilk) {
            price += EXTRAS.milk;
        }
        if (options.decaf) {
            price += EXTRAS.decaf;
        }
        if (options.shot) {
            price += EXTRAS.shot;
        }
        return price;
    }

    function calcDrinkPrice(drink, options) {
        return drink.price + calcExtras(options, drink.milk);
    }

    function extrasName(baseName, options) {
        const parts = [];
        if (options.milk) {
            parts.push(options.milkType.toLowerCase() + ' milk');
        }
        if (options.shot) {
            parts.push('extra shot');
        }
        if (options.decaf) {
            parts.push('decaf');
        }
        options.syrups.forEach((name) => parts.push(name.toLowerCase() + ' syrup'));
        if (options.freeMilk) {
            parts.push('milk');
        }
        options.free.forEach((name) => parts.push(name.toLowerCase()));
        return parts.length ? baseName + ' (' + parts.join(', ') + ')' : baseName;
    }

    /* ---------- DOM HELPERS ---------- */

    const byId = (id) => document.getElementById(id);

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

    function makeButton(className, text, attrs) {
        const button = makeEl('button', className, text);
        button.type = 'button';
        Object.entries(attrs || {}).forEach(([key, value]) => button.setAttribute(key, value));
        return button;
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

    function addDemoNote(successEl, text) {
        successEl.append(makeEl('p', 'small mb-0 mt-2 fst-italic', text));
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

    /* ---------- SHARED CART ---------- */

    const EDCart = (() => {
        const MAX = 10;
        const listeners = [];

        const read = () => {
            const data = readStorage(STORAGE.cart, []);
            return Array.isArray(data) ? data : [];
        };

        let items = read();

        const changed = () => listeners.forEach((fn) => fn());
        const write = () => {
            writeStorage(STORAGE.cart, items);
            changed();
        };
        const find = (name, size) => items.find((c) => c.name === name && c.size === size);

        const announce = (name) => {
            document.dispatchEvent(new CustomEvent('edcart:added', { detail: { name, count: calcCount(items) } }));
        };

        window.addEventListener('storage', (event) => {
            if (event.key === STORAGE.cart) {
                items = read();
                changed();
            }
        });

        return {
            MAX,
            items: () => items,
            count: () => calcCount(items),
            total: () => calcTotal(items),
            qty(name, size) {
                const found = find(name, size);
                return found ? found.qty : 0;
            },
            add(name, size, price) {
                const found = find(name, size);
                if (found) {
                    found.qty = Math.min(MAX, found.qty + 1);
                } else {
                    items.push({ name, size, price, qty: 1 });
                }
                write();
                announce(name);
            },
            setQty(name, size, price, qty) {
                const found = find(name, size);
                const safeQty = Math.max(0, Math.min(MAX, qty || 0));
                if (found && safeQty === 0) {
                    items.splice(items.indexOf(found), 1);
                } else if (found) {
                    found.qty = safeQty;
                } else if (safeQty > 0) {
                    items.push({ name, size, price, qty: safeQty });
                }
                write();
            },
            replaceAll(newItems) {
                items = newItems.map((c) => ({ ...c }));
                write();
            },
            clear() {
                items = [];
                write();
            },
            onChange: (fn) => listeners.push(fn),
            label: (c) => c.name + (c.size ? ' · ' + c.size : ''),
            announce
        };
    })();

    function cartLine(item, index) {
        const li = makeEl('li', 'list-group-item px-0');
        li.dataset.index = index;

        const top = makeEl('div', 'd-flex justify-content-between');
        top.append(
            makeEl('span', 'fw-semibold', EDCart.label(item)),
            makeButton('btn-close btn-sm', undefined, { 'data-action': 'remove', 'aria-label': 'Remove ' + item.name })
        );

        const stepper = makeEl('div', 'd-flex align-items-center gap-2');
        stepper.append(
            makeButton('btn btn-outline-primary btn-sm cart-step', '−', { 'data-action': 'minus', 'aria-label': 'Less ' + item.name }),
            makeEl('span', 'cart-qty', String(item.qty)),
            makeButton('btn btn-outline-primary btn-sm cart-step', '+', { 'data-action': 'plus', 'aria-label': 'More ' + item.name })
        );

        const row = makeEl('div', 'd-flex justify-content-between align-items-center mt-1');
        row.append(stepper, makeEl('strong', 'text-primary', formatPrice(item.qty * item.price)));

        li.append(top, row);
        return li;
    }

    // event delegation
    function bindCartActions(list) {
        list.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button || !list.contains(button)) {
                return;
            }
            const item = EDCart.items()[Number(button.closest('li').dataset.index)];
            if (!item) {
                return;
            }
            const steps = { remove: -item.qty, minus: -1, plus: 1 };
            EDCart.setQty(item.name, item.size, item.price, item.qty + steps[button.dataset.action]);
        });
    }

    /* ---------- ON EVERY PAGE ---------- */

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
            badge.setAttribute('aria-label', plural(count, 'drink') + ' in your order');
        };
        EDCart.onChange(update);
        update();
    }

    /* ---------- Extras picker ---------- */

    function createExtrasPicker(prefix) {
        const element = makeEl('div', 'extras-picker');
        const listeners = [];

        function check(parent, id, text, value) {
            const wrap = makeEl('div', 'form-check');
            const input = makeEl('input', 'form-check-input');
            input.type = 'checkbox';
            input.id = prefix + id;
            input.value = value || '';
            const label = makeEl('label', 'form-check-label', text);
            label.htmlFor = input.id;
            wrap.append(input, label);
            parent.append(wrap);
            return input;
        }

        const syrupBox = makeEl('fieldset', 'mb-3');
        syrupBox.append(makeEl('legend', 'form-label fs-6', 'Syrups (+' + formatPrice(EXTRAS.syrup) + ' each, choose as many as you like)'));
        const grid = makeEl('div', 'row row-cols-2 row-cols-md-3 g-1');
        const syrupBoxes = SYRUPS.map((name) => {
            const col = makeEl('div', 'col');
            const box = check(col, 'syrup-' + name.toLowerCase().replace(/\s+/g, '-'), name, name);
            grid.append(col);
            return box;
        });
        syrupBox.append(grid);

        const checks = makeEl('div', '');
        const milk = check(checks, 'milk', 'Plant-based or lactose-free milk (+' + formatPrice(EXTRAS.milk) + ')');
        const milkType = makeEl('select', 'form-select form-select-sm mt-1 mb-1 hidden');
        milkType.id = prefix + 'milk-type';
        milkType.setAttribute('aria-label', 'Kind of milk');
        MILK_TYPES.forEach((name) => {
            const option = makeEl('option', '', name);
            option.value = name;
            milkType.append(option);
        });
        checks.append(milkType);
        const milkHint = makeEl('div', 'form-text hidden', 'This drink has no milk, so this option is off.');
        checks.append(milkHint);
        const shot = check(checks, 'shot', 'Extra shot of espresso (+' + formatPrice(EXTRAS.shot) + ')');
        const decaf = check(checks, 'decaf', 'Decaf (+' + formatPrice(EXTRAS.decaf) + ')');
        const freeMilk = check(checks, 'free-milk', 'Add milk (free, 0 ₸)');
        const freeMilkRow = freeMilk.closest('.form-check');
        const freeBoxes = FREE_EXTRAS.map((name) => check(checks, 'free-' + name.toLowerCase(), name + ' (free, 0 ₸)', name));

        element.append(syrupBox, checks);

        const all = [...syrupBoxes, milk, shot, decaf, freeMilk, ...freeBoxes];
        element.addEventListener('change', () => {
            milkType.classList.toggle('hidden', !milk.checked);
            listeners.forEach((fn) => fn());
        });

        return {
            element,
            options: () => ({
                milk: milk.checked,
                milkType: milkType.value,
                shot: shot.checked,
                decaf: decaf.checked,
                syrups: syrupBoxes.filter((b) => b.checked).map((b) => b.value),
                freeMilk: freeMilk.checked,
                free: freeBoxes.filter((b) => b.checked).map((b) => b.value)
            }),
            setTraits(traits) {
                milk.disabled = !traits.milk;
                if (!traits.milk) {
                    milk.checked = false;
                }
                milkHint.classList.toggle('hidden', traits.milk);
                milkType.classList.toggle('hidden', !milk.checked);
                freeMilkRow.classList.toggle('hidden', !traits.freeMilk);
                if (!traits.freeMilk) {
                    freeMilk.checked = false;
                }
            },
            reset() {
                all.forEach((b) => { b.checked = false; });
                milkType.selectedIndex = 0;
                milkType.classList.add('hidden');
            },
            onChange: (fn) => listeners.push(fn)
        };
    }

    /* ---------- HOME ---------- */

    function drinkCard(drink, index) {
        const col = makeEl('div', 'col');
        const card = makeEl('article', 'card drink-card h-100 shadow-sm');
        card.dataset.index = index;

        const img = makeEl('img', 'drink-photo');
        img.src = drink.img;
        img.alt = drink.name;
        img.width = 520;
        img.height = 520;
        img.loading = 'lazy';

        const body = makeEl('div', 'card-body d-flex flex-column pb-2');
        const bottom = makeEl('div', 'mt-auto d-flex justify-content-between align-items-center gap-2');
        bottom.append(
            makeEl('span', 'drink-price fw-bold text-primary', formatPrice(drink.price)),
            makeButton('btn btn-primary btn-sm add-to-cart', 'Add', { 'aria-label': 'Add ' + drink.name + ' to cart' })
        );
        body.append(
            makeEl('h3', 'h6 mb-1', drink.name),
            makeEl('p', 'small text-muted mb-1', drink.size + ' · ' + (drink.milk ? 'with milk' : 'no milk')),
            makeEl('p', 'small mb-2', drink.desc),
            bottom
        );
        card.append(img, body);
        col.append(card);
        return col;
    }

    function renderDrinkCards(container, list) {
        container.replaceChildren();
        for (let i = 0; i < list.length; i++) {
            container.append(drinkCard(list[i], DRINKS.indexOf(list[i])));
        }
        return list.length;
    }

    function initDrinkPicker() {
        const welcome = byId('welcome');
        if (!welcome) {
            return;
        }
        const section = makeEl('section', 'card shadow-sm mb-5');
        section.id = 'drink-picker';
        const body = makeEl('div', 'card-body p-4');
        body.append(makeEl('h2', 'h3', 'What should I drink?'));
        body.append(makeEl('p', 'text-muted', 'Tell us what you like and we show the coffees that fit. Prices are for the standard size.'));

        const form = makeEl('form', 'row g-3 mb-3');
        form.id = 'picker-form';
        form.setAttribute('novalidate', '');

        const milkCol = makeEl('div', 'col-12 col-md-4');
        const milkLabel = makeEl('label', 'form-label', 'Milk');
        milkLabel.htmlFor = 'picker-milk';
        const milk = makeEl('select', 'form-select');
        milk.id = 'picker-milk';
        [['any', 'Does not matter'], ['yes', 'With milk'], ['no', 'Without milk']].forEach(([value, text]) => {
            const option = makeEl('option', '', text);
            option.value = value;
            milk.append(option);
        });
        milkCol.append(milkLabel, milk);

        const priceCol = makeEl('div', 'col-12 col-md-4');
        const priceLabel = makeEl('label', 'form-label', 'Most I want to pay (₸)');
        priceLabel.htmlFor = 'picker-price';
        const price = makeEl('input', 'form-control');
        price.type = 'number';
        price.id = 'picker-price';
        price.min = '0';
        price.step = '50';
        price.placeholder = 'No limit';
        const priceError = makeEl('div', 'invalid-feedback', 'Please enter a positive number or leave the field empty.');
        priceError.id = 'picker-price-error';
        priceCol.append(priceLabel, price, priceError);

        const buttonCol = makeEl('div', 'col-12 col-md-4 d-flex align-items-end gap-2');
        const reset = makeEl('button', 'btn btn-outline-primary flex-fill', 'Reset');
        reset.type = 'reset';
        const random = makeButton('btn btn-primary flex-fill', 'Pick one for me');
        buttonCol.append(random, reset);

        form.append(milkCol, priceCol, buttonCol);

        const status = makeEl('p', 'small text-muted mb-2');
        status.id = 'picker-status';
        status.setAttribute('aria-live', 'polite');
        const empty = makeEl('div', 'alert alert-warning hidden', 'No coffee fits these wishes. Try a higher price or press Reset.');
        empty.setAttribute('role', 'status');
        const list = makeEl('div', 'row row-cols-2 row-cols-md-3 g-3');
        list.id = 'picker-list';

        body.append(form, status, empty, list);
        section.append(body);
        welcome.after(section);

        let shown = DRINKS;
        function update() {
            const raw = price.value.trim();
            const limit = raw === '' ? 0 : Number(raw);
            const valid = raw === '' || (Number.isFinite(limit) && limit > 0);
            setFieldState(price, valid ? '' : 'Please enter a positive number or leave the field empty.');
            if (raw === '') {
                price.classList.remove('is-valid');
            }
            if (!valid) {
                return;
            }
            shown = pickDrinks(DRINKS, milk.value, limit);
            renderDrinkCards(list, shown);
            empty.classList.toggle('hidden', shown.length > 0);
            status.textContent = shown.length === DRINKS.length
                ? 'Showing all ' + DRINKS.length + ' coffees.'
                : 'Found ' + shown.length + ' of ' + DRINKS.length + ' coffees.';
        }

        // event delegation
        list.addEventListener('click', (event) => {
            const button = event.target.closest('.add-to-cart');
            if (!button) {
                return;
            }
            const drink = DRINKS[Number(button.closest('.drink-card').dataset.index)];
            EDCart.add(drink.name, drink.size, drink.price);
            flashAdded(button, '✓ Added');
        });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            update();
        });
        milk.addEventListener('change', update);
        price.addEventListener('input', update);
        form.addEventListener('reset', () => {
            resetFieldStates(form);
            setTimeout(update, 0);
        });
        random.addEventListener('click', () => {
            if (shown.length === 0) {
                return;
            }
            const pick = pickRandom(shown);
            renderDrinkCards(list, [pick]);
            status.textContent = 'Today we suggest: ' + pick.name + '. Press Reset to see the list again.';
        });
        update();
    }

    /* ---------- ABOUT ---------- */

    function initFaqSearch() {
        const faqList = byId('faq-list');
        if (!faqList) {
            return;
        }
        const faqItems = [...faqList.querySelectorAll('.accordion-item')];

        const form = makeEl('form', 'row g-2 mb-3');
        form.id = 'faq-search-form';
        form.setAttribute('role', 'search');

        const inputCol = makeEl('div', 'col-12 col-sm-8');
        const label = makeEl('label', 'form-label', 'Search the questions');
        label.htmlFor = 'faq-search';
        const input = makeEl('input', 'form-control');
        input.type = 'search';
        input.id = 'faq-search';
        input.autocomplete = 'off';
        input.placeholder = 'for example: milk, work, open';
        inputCol.append(label, input);

        const buttonCol = makeEl('div', 'col-12 col-sm-4 d-flex align-items-end');
        const clear = makeEl('button', 'btn btn-outline-primary w-100', 'Clear');
        clear.type = 'reset';
        buttonCol.append(clear);
        form.append(inputCol, buttonCol);

        const status = makeEl('p', 'small text-muted');
        status.id = 'faq-status';
        status.setAttribute('aria-live', 'polite');
        const empty = makeEl('div', 'alert alert-warning hidden', 'No question matches your search. Press Clear, or use the form below to ask us.');
        empty.setAttribute('role', 'status');

        faqList.before(form, status, empty);

        const matches = (item, words) => {
            const text = item.textContent.toLowerCase();
            return words.every((word) => text.includes(word));
        };

        function update() {
            const words = input.value.trim().toLowerCase().split(/\s+/).filter((w) => w !== '');
            let found = 0;
            faqItems.forEach((item) => {
                const ok = matches(item, words);
                item.classList.toggle('hidden', !ok);
                if (ok) {
                    found++;
                }
            });
            empty.classList.toggle('hidden', found > 0);
            status.textContent = words.length === 0
                ? 'Showing all ' + faqItems.length + ' questions.'
                : 'Found ' + found + ' of ' + faqItems.length + ' questions.';
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            update();
        });
        input.addEventListener('input', update);
        form.addEventListener('reset', () => setTimeout(update, 0));
        update();
    }

    /* ---------- MENU ---------- */

    function initMenu() {
        const searchForm = byId('menu-search-form');
        if (!searchForm) {
            return;
        }
        const searchInput = byId('menu-search');
        const categorySelect = byId('menu-category-filter');
        const statusEl = byId('menu-search-status');
        const emptyEl = byId('menu-search-empty');
        const sections = [...document.querySelectorAll('.menu-category')];
        const DEFAULT_STATUS = statusEl.textContent;

        const cards = [...document.querySelectorAll('.menu-item')];
        const menuIndex = cards.map((card) => ({
            name: card.dataset.name,
            category: card.closest('.menu-category').dataset.category,
            card
        }));

        cards.filter((card) => card.dataset.name === 'Orange').forEach((card) => {
            const emptyPhoto = card.querySelector('.drink-photo-empty');
            if (!emptyPhoto) {
                return;
            }
            const photo = makeEl('img', 'drink-photo');
            photo.src = 'images/menu/orange.jpg';
            photo.alt = 'Orange';
            photo.width = 520;
            photo.height = 520;
            photo.loading = 'lazy';
            emptyPhoto.replaceWith(photo);
        });

        const selectedSize = (card) => card.querySelector('.drink-size.active');

        function currentPrice(card) {
            const active = selectedSize(card);
            if (active) {
                return Number(active.dataset.price);
            }
            // list rows (Baby drinks, Extras) have no .drink-price
            const priceEl = card.querySelector('.drink-price') || card.querySelector('.fw-bold');
            return Number(priceEl.textContent.replace(/\D/g, ''));
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

        function chooseSize(card, button) {
            card.querySelectorAll('.drink-size').forEach((b) => {
                b.classList.toggle('active', b === button);
                b.setAttribute('aria-pressed', String(b === button));
            });
            card.querySelector('.drink-price').textContent = formatPrice(Number(button.dataset.price));
        }


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
            statusEl.textContent = term === '' && category === 'all'
                ? DEFAULT_STATUS
                : 'Found ' + plural(found.length, 'drink') + '.';
        }

        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            applyFilter();
        });
        searchInput.addEventListener('input', applyFilter);
        categorySelect.addEventListener('change', applyFilter);
        searchForm.addEventListener('reset', () => setTimeout(applyFilter, 0));


        function renderCart() {
            const items = EDCart.items();
            const has = items.length > 0;
            byId('cart-items').replaceChildren(...items.map(cartLine));
            byId('cart-empty').classList.toggle('hidden', has);
            byId('cart-total-row').classList.toggle('hidden', !has);
            byId('cart-actions').classList.toggle('hidden', !has);
            byId('cart-total').textContent = formatPrice(EDCart.total());
            byId('cart-count').textContent = EDCart.count();
            byId('cart-fab-total').textContent = has ? formatPrice(EDCart.total()) : '';
        }

        bindCartActions(byId('cart-items'));
        byId('cart-clear').addEventListener('click', () => EDCart.clear());
        EDCart.onChange(renderCart);
        renderCart();


        const modal = new bootstrap.Modal(byId('drink-modal'));
        // avoids the aria-hidden focus warning in the console
        ['drink-modal', 'cart-panel'].forEach((id) => {
            byId(id).addEventListener(id === 'drink-modal' ? 'hide.bs.modal' : 'hide.bs.offcanvas', () => {
                if (byId(id).contains(document.activeElement)) {
                    document.activeElement.blur();
                }
            });
        });
        let openCard = null;

        const CUSTOM_CATEGORIES = ['coffee', 'iced-coffee'];
        const picker = createExtrasPicker('menu-');
        const customBox = makeEl('div', 'mt-3 hidden');
        customBox.id = 'drink-modal-custom';
        customBox.append(makeEl('p', 'small fw-semibold mb-2', 'Customise your drink'), picker.element);
        byId('drink-modal-add').before(customBox);

        const isCustom = (card) => CUSTOM_CATEGORIES.includes(card.closest('.menu-category').dataset.category);
        const hasMilk = (card) => /milk/i.test(card.dataset.ingredients);
        const modalPrice = () => currentPrice(openCard) + (isCustom(openCard) ? calcExtras(picker.options(), hasMilk(openCard)) : 0);

        picker.onChange(() => {
            byId('drink-modal-price').textContent = formatPrice(modalPrice());
        });

        function fillModal() {
            const sizes = [...openCard.querySelectorAll('.drink-size')];
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
            byId('drink-modal-sizes').replaceChildren(...sizes.map((source, i) => {
                const isActive = source === active;
                return makeButton('drink-size btn btn-sm' + (isActive ? ' active' : ''), source.textContent, {
                    'data-size-index': i,
                    'aria-pressed': String(isActive)
                });
            }));
        }

        // event delegation
        byId('drink-modal-sizes').addEventListener('click', (event) => {
            const button = event.target.closest('[data-size-index]');
            if (!button) {
                return;
            }
            chooseSize(openCard, openCard.querySelectorAll('.drink-size')[Number(button.dataset.sizeIndex)]);
            fillModal();
        });

        function openDrink(card) {
            openCard = card;
            const photo = card.querySelector('img.drink-photo');
            const modalPhoto = byId('drink-modal-photo');
            byId('drink-modal-title').textContent = card.dataset.name;
            if (photo) {
                modalPhoto.src = photo.src;
                modalPhoto.alt = card.dataset.name;
            }
            modalPhoto.classList.toggle('hidden', !photo);
            byId('drink-modal-desc').textContent = card.dataset.desc;
            byId('drink-modal-ingredients').replaceChildren(...card.dataset.ingredients.split('|').map((text) => makeEl('li', '', text)));
            const custom = isCustom(card);
            customBox.classList.toggle('hidden', !custom);
            if (custom) {
                picker.reset();
                picker.setTraits({ milk: hasMilk(card), freeMilk: /americano/i.test(card.dataset.name) });
            }
            fillModal();
            modal.show();
        }

        // event delegation
        byId('main-content').addEventListener('click', (event) => {
            const size = event.target.closest('.menu-item .drink-size');
            if (size) {
                chooseSize(size.closest('.menu-item'), size);
                return;
            }
            const add = event.target.closest('.menu-item .add-to-cart');
            if (add) {
                const card = add.closest('.menu-item');
                EDCart.add(card.dataset.name, currentSizeLabel(card), currentPrice(card));
                flashAdded(add, '✓ Added');
                return;
            }
            const opener = event.target.closest('.drink-open');
            if (opener) {
                openDrink(opener.closest('.drink-card'));
            }
        });

        byId('drink-modal-add').addEventListener('click', (event) => {
            if (isCustom(openCard)) {
                EDCart.add(extrasName(openCard.dataset.name, picker.options()), currentSizeLabel(openCard), modalPrice());
            } else {
                EDCart.add(openCard.dataset.name, currentSizeLabel(openCard), currentPrice(openCard));
            }
            const button = event.currentTarget;
            button.textContent = '✓ Added to cart';
            setTimeout(() => { button.textContent = 'Add to cart'; }, 1000);
        });


        const surpriseBody = document.querySelector('#menu-tools .border-primary .card-body');
        const surprise = makeButton('btn btn-outline-primary btn-lg ms-2', 'Surprise me', { id: 'menu-surprise' });
        const message = makeEl('p', 'mt-3 mb-0');
        message.id = 'menu-surprise-text';
        message.setAttribute('aria-live', 'polite');
        surpriseBody.append(surprise, message);

        let marked = null;
        let pick = null;
        surprise.addEventListener('click', () => {
            pick = pickRandom(DRINKS);
            const entry = menuIndex.find((e) => e.name === pick.name);
            if (!entry) {
                return;
            }
            searchForm.reset();
            if (marked) {
                marked.classList.remove('active');
            }
            marked = entry.card;
            marked.classList.add('active');
            marked.scrollIntoView({ behavior: 'smooth', block: 'center' });

            message.replaceChildren(
                document.createTextNode('How about a ' + pick.name + '? ' + formatPrice(pick.price) + ' for ' + pick.size + '.'),
                makeButton('btn btn-primary btn-sm ms-2', 'Add to cart', { 'data-action': 'surprise-add' })
            );
        });
        message.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action="surprise-add"]');
            if (button && pick) {
                EDCart.add(pick.name, pick.size, pick.price);
                flashAdded(button, '✓ Added');
            }
        });
    }

    /* ---------- COFFEE ---------- */

    function initCoffeeCalculator() {
        const workInfo = byId('work-info');
        if (!workInfo) {
            return;
        }
        const section = makeEl('section', 'mb-5');
        section.id = 'coffee-calculator';
        const card = makeEl('div', 'card shadow-sm');
        const body = makeEl('div', 'card-body p-4');
        body.append(makeEl('h2', 'h3', 'Build your coffee'));
        body.append(makeEl('p', 'text-muted', 'Choose a coffee and the extras from the list above. The price updates as you choose.'));

        const form = makeEl('form', 'row g-3');
        form.id = 'calc-form';
        form.setAttribute('novalidate', '');

        function field(col, labelText, control, id) {
            const wrap = makeEl('div', col);
            const label = makeEl('label', 'form-label', labelText);
            label.htmlFor = id;
            control.id = id;
            wrap.append(label, control);
            form.append(wrap);
            return wrap;
        }

        const drinkSelect = makeEl('select', 'form-select');
        DRINKS.forEach((d, index) => {
            const option = makeEl('option', '', d.name + ' (' + d.size + ') – ' + formatPrice(d.price));
            option.value = String(index);
            drinkSelect.append(option);
        });
        field('col-12 col-md-6', 'Coffee', drinkSelect, 'calc-drink');

        const qty = makeEl('input', 'form-control');
        qty.type = 'number';
        qty.min = '1';
        qty.max = String(EDCart.MAX);
        qty.value = '1';
        const qtyWrap = field('col-12 col-md-6', 'Number of cups (1–' + EDCart.MAX + ')', qty, 'calc-qty');
        const qtyError = makeEl('div', 'invalid-feedback', 'Please enter a whole number from 1 to ' + EDCart.MAX + '.');
        qtyError.id = 'calc-qty-error';
        qtyWrap.append(qtyError);

        const picker = createExtrasPicker('calc-');
        const pickerWrap = makeEl('div', 'col-12');
        pickerWrap.append(picker.element);
        form.append(pickerWrap);

        const result = makeEl('div', 'col-12');
        const line = makeEl('p', 'fs-5 mb-1');
        line.id = 'calc-summary';
        line.setAttribute('aria-live', 'polite');
        const total = makeEl('p', 'fs-4 fw-bold text-primary mb-2');
        total.id = 'calc-total';
        total.setAttribute('aria-live', 'polite');
        const add = makeEl('button', 'btn btn-primary', 'Add to cart');
        add.type = 'submit';
        const go = makeEl('a', 'btn btn-outline-primary ms-2', 'Go to order');
        go.href = 'order.html#order-form';
        const done = makeEl('p', 'small text-success mt-2 mb-0 hidden', 'Added to your cart. Nothing is ordered until you place the order.');
        done.id = 'calc-done';
        done.setAttribute('role', 'status');
        result.append(line, total, add, go, done);
        form.append(result);

        body.append(form);
        card.append(body);
        section.append(card);
        workInfo.before(section);

        function render() {
            const drink = DRINKS[Number(drinkSelect.value)];
            picker.setTraits({ milk: drink.milk, freeMilk: Boolean(drink.freeMilk) });

            const count = Number(qty.value);
            const valid = Number.isInteger(count) && count >= 1 && count <= EDCart.MAX;
            setFieldState(qty, valid ? '' : 'Please enter a whole number from 1 to ' + EDCart.MAX + '.');
            done.classList.add('hidden');
            if (!valid) {
                line.textContent = 'One cup: —';
                total.textContent = 'Total: —';
                return null;
            }
            const one = calcDrinkPrice(drink, picker.options());
            line.textContent = 'One cup: ' + formatPrice(one);
            total.textContent = 'Total for ' + plural(count, 'cup') + ': ' + formatPrice(one * count);
            return { drink, count, one };
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const state = render();
            if (state === null) {
                qty.focus();
                return;
            }
            const name = extrasName(state.drink.name, picker.options());
            EDCart.setQty(name, state.drink.size, state.one, EDCart.qty(name, state.drink.size) + state.count);
            EDCart.announce(name);
            done.classList.remove('hidden');
        });
        form.addEventListener('input', render);
        form.addEventListener('change', render);
        render();
    }

    /* ---------- ORDER ---------- */

    function initOrder() {
        const orderForm = byId('order-form');
        if (!orderForm) {
            return;
        }
        const LAST_BEFORE_CLOSE = 30; // minutes before closing
        const itemsList = byId('order-items');
        const isDelivery = () => byId('order-method-delivery').checked;

        const cashback = makeEl('p', 'small text-success mb-0');
        cashback.id = 'order-cashback';
        byId('order-total').closest('p, div').after(cashback);

        function updateMethod() {
            const delivery = isDelivery();
            byId('order-delivery-fields').classList.toggle('hidden', !delivery);
            byId('order-pickup-info').classList.toggle('hidden', delivery);
            byId('order-address').required = delivery;
            byId('order-time-label').textContent = delivery ? 'Delivery time' : 'Pick-up time';
            byId('order-method-text').textContent = delivery ? 'Delivery' : 'Pick up';
            if (!delivery) {
                byId('order-address').classList.remove('is-invalid', 'is-valid');
            }
        }

        function emptyRow() {
            const li = makeEl('li', 'list-group-item px-0 text-muted', 'Your order is empty. ');
            li.id = 'order-empty';
            const link = makeEl('a', '', 'Choose drinks on the Menu page');
            link.href = 'menu.html';
            li.append(link, document.createTextNode('.'));
            return li;
        }

        const repeatButton = makeButton('btn btn-outline-secondary hidden', 'Repeat my last order', { id: 'order-repeat' });
        byId('order-reset').before(repeatButton);

        function renderRepeat() {
            const last = readStorage(STORAGE.lastOrder, null);
            const show = last !== null && EDCart.items().length === 0;
            repeatButton.classList.toggle('hidden', !show);
            if (show) {
                repeatButton.textContent = 'Repeat my last order (' + plural(calcCount(last.items), 'drink') + ', ' + formatPrice(calcTotal(last.items)) + ')';
            }
        }

        function renderOrder() {
            const items = EDCart.items();
            itemsList.replaceChildren(...(items.length ? items.map(cartLine) : [emptyRow()]));
            const total = EDCart.total();
            byId('order-count').textContent = EDCart.count();
            byId('order-total').textContent = formatPrice(total);
            cashback.textContent = total > 0 ? 'With the Espressoday app you get ' + formatPrice(calcCashback(total)) + ' back (10%).' : '';
            renderRepeat();
        }

        repeatButton.addEventListener('click', () => {
            const last = readStorage(STORAGE.lastOrder, null);
            if (last) {
                EDCart.replaceAll(last.items);
                byId('order-error').classList.add('hidden');
            }
        });

        function checkField(field) {
            const value = field.value.trim();
            switch (field.id) {
                case 'order-name':
                    return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
                case 'order-phone':
                    return setFieldState(field, isValidPhone(value) ? '' : 'Please enter a phone number we can call, for example +7 771 419 84 57.');
                case 'order-address':
                    if (!isDelivery()) {
                        return true;
                    }
                    return setFieldState(field, value.length >= 5 ? '' : 'Please enter the delivery address: street and building.');
                case 'order-time': {
                    if (value === '') {
                        return setFieldState(field, 'Please choose a time.');
                    }
                    const hours = getHours(new Date());
                    const latest = minutesToTime(toMinutes(hours.close) - LAST_BEFORE_CLOSE);
                    if (!isTimeWithinHours(value, new Date(), LAST_BEFORE_CLOSE)) {
                        return setFieldState(field, 'Please choose a time between ' + hours.open + ' and ' + latest + ' today.');
                    }
                    if (toMinutes(value) < toMinutes(toTimeString(new Date()))) {
                        return setFieldState(field, 'This time has already passed. Please choose a later time.');
                    }
                    return setFieldState(field, '');
                }
                case 'order-consent':
                    return setFieldState(field, field.checked ? '' : 'Please confirm that you will pay for the order.');
                default:
                    return true;
            }
        }

        function validateOrder() {
            const fields = ['order-name', 'order-phone', 'order-address', 'order-time', 'order-consent'].map(byId);
            const results = fields.map(checkField);
            return results.every(Boolean) && EDCart.items().length > 0;
        }

        function suggestTime() {
            const now = new Date();
            const hours = getHours(now);
            let minutes = Math.ceil((now.getHours() * 60 + now.getMinutes() + 30) / 5) * 5;
            minutes = Math.max(toMinutes(hours.open), Math.min(minutes, toMinutes(hours.close) - LAST_BEFORE_CLOSE));
            return minutesToTime(minutes);
        }

        function showConfirmation(order) {
            byId('order-number').textContent = order.number;
            byId('order-pickup').textContent = (order.delivery ? 'delivery to ' + order.address + ' at ' : 'pick-up at ') + order.time;
            byId('order-final-total').textContent = formatPrice(calcTotal(order.items));

            let list = byId('order-success-items');
            if (!list) {
                list = makeEl('ul', 'mb-2');
                list.id = 'order-success-items';
                byId('order-success').querySelector('p').after(list);
            }
            list.replaceChildren(...order.items.map((c) => makeEl('li', '', c.qty + ' × ' + EDCart.label(c) + ' — ' + formatPrice(c.qty * c.price))));
            showSuccess(byId('order-result-text'), byId('order-success'));
            byId('order-result').scrollIntoView({ block: 'center' });
        }

        addDemoNote(byId('order-success'), 'This is a demo: your data is not sent anywhere and no real order is placed. Nothing is paid or prepared.');
        orderForm.setAttribute('novalidate', '');
        liveValidate(orderForm, checkField);
        bindCartActions(itemsList);
        orderForm.addEventListener('change', (event) => {
            if (event.target.name === 'method') {
                updateMethod();
            }
        });

        orderForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const ok = validateOrder();
            reportErrors(orderForm, byId('order-error'), ok);
            if (!ok) {
                byId('order-error').scrollIntoView({ block: 'center' });
                return;
            }
            const order = {
                number: generateOrderNumber(),
                delivery: isDelivery(),
                address: byId('order-address').value.trim(),
                time: byId('order-time').value,
                items: EDCart.items().map((c) => ({ ...c }))
            };
            writeStorage(STORAGE.lastOrder, order);
            showConfirmation(order);
            EDCart.clear();
            orderForm.reset();
        });

        orderForm.addEventListener('reset', () => {
            resetFieldStates(orderForm);
            byId('order-error').classList.add('hidden');
            setTimeout(() => {
                updateMethod();
                byId('order-time').value = suggestTime();
            }, 0);
        });

        byId('order-reset').addEventListener('click', () => {
            EDCart.clear();
            hideSuccess(byId('order-result-text'), byId('order-success'));
        });

        EDCart.onChange(renderOrder);
        renderOrder();
        updateMethod();
        byId('order-time').value = suggestTime();
    }

    /* ---------- BOOKING ---------- */

    function initBooking() {
        const bookingForm = byId('booking-form');
        if (!bookingForm) {
            return;
        }
        const LAST_BOOKING = 60; // minutes before closing
        const SLOT_STEP = 30; // minutes
        const dateInput = byId('booking-date');
        const timeInput = byId('booking-time');

        dateInput.min = toDateInputValue(new Date());

        const slotBox = makeEl('div', 'd-flex flex-wrap gap-1 mt-2');
        slotBox.id = 'booking-slots';
        slotBox.setAttribute('role', 'group');
        slotBox.setAttribute('aria-label', 'Available times');
        byId('booking-time-hint').after(slotBox);

        function renderSlots() {
            if (dateInput.value === '') {
                slotBox.replaceChildren(makeEl('span', 'small text-muted', 'Choose a date to see the times.'));
                return;
            }
            const slots = buildTimeSlots(parseDateInput(dateInput.value), new Date(), SLOT_STEP, LAST_BOOKING);
            if (slots.length === 0) {
                slotBox.replaceChildren(makeEl('span', 'small text-muted', 'No more times on this day. Please choose another date.'));
                return;
            }
            slotBox.replaceChildren(...slots.map((slot) => makeButton(
                'btn btn-outline-primary btn-sm' + (slot === timeInput.value ? ' active' : ''),
                slot,
                { 'data-time': slot, 'aria-pressed': String(slot === timeInput.value) }
            )));
        }

        // event delegation
        slotBox.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-time]');
            if (!button) {
                return;
            }
            timeInput.value = button.dataset.time;
            checkField(timeInput);
            renderSlots();
        });

        dateInput.addEventListener('change', renderSlots);
        timeInput.addEventListener('input', renderSlots);

        function checkField(field) {
            const value = field.value.trim();
            switch (field.id) {
                case 'booking-name':
                    return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
                case 'booking-email':
                    if (value === '') {
                        return setFieldState(field, 'Please enter your e-mail.');
                    }
                    return setFieldState(field, isValidEmail(value) ? '' : 'Please enter a valid e-mail address, for example name@mail.com.');
                case 'booking-phone':
                    if (value === '') {
                        return setFieldState(field, 'Please enter your phone number.');
                    }
                    return setFieldState(field, isValidPhone(value) ? '' : 'Please enter a phone number we can call, for example +7 771 419 84 57.');
                case 'booking-guests': {
                    const guests = Number(value);
                    if (value === '' || !Number.isInteger(guests) || guests < 1 || guests > 10) {
                        return setFieldState(field, 'Please enter a whole number from 1 to 10. For more guests, please call us.');
                    }
                    return setFieldState(field, '');
                }
                case 'booking-date':
                    if (value === '') {
                        return setFieldState(field, 'Please choose a date of visit.');
                    }
                    if (value < toDateInputValue(new Date())) {
                        return setFieldState(field, 'This date has already passed. Please choose today or a later day.');
                    }
                    return setFieldState(field, '');
                case 'booking-time': {
                    if (value === '') {
                        return setFieldState(field, 'Please choose a time of visit.');
                    }
                    if (dateInput.value === '') {
                        return setFieldState(field, '');
                    }
                    const date = parseDateInput(dateInput.value);
                    const hours = getHours(date);
                    if (!isTimeWithinHours(value, date, LAST_BOOKING)) {
                        return setFieldState(field, 'On this day tables are booked between ' + hours.open + ' and ' + minutesToTime(toMinutes(hours.close) - LAST_BOOKING) + '.');
                    }
                    const now = new Date();
                    if (toDateInputValue(date) === toDateInputValue(now) && toMinutes(value) < toMinutes(toTimeString(now)) + 30) {
                        return setFieldState(field, 'Please choose a time at least 30 minutes from now.');
                    }
                    return setFieldState(field, '');
                }
                case 'booking-consent':
                    return setFieldState(field, field.checked ? '' : 'Please agree so that we can call you to confirm.');
                default:
                    return true;
            }
        }

        function validateBooking() {
            const fields = ['booking-name', 'booking-email', 'booking-phone', 'booking-guests', 'booking-date', 'booking-time', 'booking-consent'].map(byId);
            return fields.map(checkField).every(Boolean);
        }

        const formatDate = (value) => parseDateInput(value).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        addDemoNote(byId('booking-success'), 'This is a demo: your data is not sent anywhere and no table is really reserved.');
        bookingForm.setAttribute('novalidate', '');
        liveValidate(bookingForm, checkField);
        dateInput.addEventListener('change', () => {
            if (timeInput.value !== '') {
                checkField(timeInput);
            }
        });

        bookingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const ok = validateBooking();
            reportErrors(bookingForm, byId('booking-error'), ok);
            if (!ok) {
                hideSuccess(byId('booking-result-text'), byId('booking-success'));
                return;
            }
            const guests = Number(byId('booking-guests').value);
            byId('summary-name').textContent = byId('booking-name').value.trim();
            byId('summary-guests').textContent = plural(guests, 'guest');
            byId('summary-date').textContent = formatDate(dateInput.value);
            byId('summary-time').textContent = timeInput.value;
            byId('summary-phone').textContent = byId('booking-phone').value.trim();
            showSuccess(byId('booking-result-text'), byId('booking-success'));
            byId('booking-result').scrollIntoView({ block: 'center' });
            bookingForm.reset();
        });

        bookingForm.addEventListener('reset', () => {
            resetFieldStates(bookingForm);
            byId('booking-error').classList.add('hidden');
            setTimeout(renderSlots, 0);
        });

        renderSlots();
    }

    /* ---------- VISIT ---------- */

    function initVisit() {
        const contactForm = byId('contact-form');
        if (!contactForm) {
            return;
        }

        const table = byId('opening-hours-table');
        if (table) {
            const now = new Date();
            const rows = table.querySelectorAll('tbody tr');
            const weekend = now.getDay() === 0 || now.getDay() === 6;
            const hours = getHours(now);
            rows.forEach((r) => r.classList.remove('active'));
            rows[weekend ? 1 : 0].classList.add('active');
            const today = makeEl('p', 'mt-2 mb-0');
            today.id = 'opening-hours-today';
            today.append(makeEl('strong', '', 'Today: '), document.createTextNode(hours.open + '–' + hours.close + '. ' + getOpenStatus(now).text + '.'));
            table.closest('.table-responsive').after(today);
        }

        const messageInput = byId('contact-message');
        const MESSAGE_MIN = 10;
        const MESSAGE_MAX = 500;

        messageInput.maxLength = MESSAGE_MAX;
        const counter = makeEl('div', 'form-text');
        counter.id = 'contact-message-count';
        messageInput.after(counter);

        function updateCounter() {
            const length = messageInput.value.trim().length;
            counter.textContent = length + ' / ' + MESSAGE_MAX + ' characters' + (length < MESSAGE_MIN ? ' (at least ' + MESSAGE_MIN + ')' : '');
        }

        const confirmCol = makeEl('div', 'col-12 col-md-6');
        const confirmLabel = makeEl('label', 'form-label', 'Repeat e-mail');
        confirmLabel.htmlFor = 'contact-email-confirm';
        const confirmInput = makeEl('input', 'form-control');
        confirmInput.type = 'email';
        confirmInput.id = 'contact-email-confirm';
        confirmInput.name = 'email_confirm';
        confirmInput.autocomplete = 'off';
        confirmInput.required = true;
        const confirmError = makeEl('div', 'invalid-feedback', 'The e-mail addresses are not the same.');
        confirmError.id = 'contact-email-confirm-error';
        confirmCol.append(confirmLabel, confirmInput, confirmError);
        byId('contact-email').closest('.col-12').after(confirmCol);

        function checkField(field) {
            const value = field.value.trim();
            switch (field.id) {
                case 'contact-name':
                    return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
                case 'contact-email':
                    return setFieldState(field, isValidEmail(value) ? '' : 'Please enter a valid e-mail address, for example name@mail.com.');
                case 'contact-email-confirm':
                    if (!isValidEmail(value)) {
                        return setFieldState(field, 'Please repeat your e-mail address.');
                    }
                    return setFieldState(field, value.toLowerCase() === byId('contact-email').value.trim().toLowerCase() ? '' : 'The e-mail addresses are not the same.');
                case 'contact-topic':
                    return setFieldState(field, value !== '' ? '' : 'Please choose a topic.');
                case 'contact-message':
                    return setFieldState(field, value.length >= MESSAGE_MIN ? '' : 'Please write at least ' + MESSAGE_MIN + ' characters.');
                default:
                    return true;
            }
        }

        addDemoNote(byId('contact-success'), 'This is a demo: your question is not sent anywhere.');
        contactForm.setAttribute('novalidate', '');
        liveValidate(contactForm, checkField);
        messageInput.addEventListener('input', updateCounter);
        byId('contact-email').addEventListener('input', () => {
            if (confirmInput.value !== '') {
                checkField(confirmInput);
            }
        });

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const fields = ['contact-name', 'contact-email', 'contact-email-confirm', 'contact-topic', 'contact-message'].map(byId);
            const ok = fields.map(checkField).every(Boolean);
            reportErrors(contactForm, byId('contact-error'), ok);
            if (!ok) {
                return;
            }
            const topic = byId('contact-topic');
            byId('contact-success-name').textContent = byId('contact-name').value.trim();
            byId('contact-success-topic').textContent = topic.options[topic.selectedIndex].text;
            byId('contact-success-email').textContent = byId('contact-email').value.trim();
            showSuccess(byId('contact-result-text'), byId('contact-success'));
            byId('contact-result').scrollIntoView({ block: 'center' });
            contactForm.reset();
        });

        contactForm.addEventListener('reset', () => {
            resetFieldStates(contactForm);
            byId('contact-error').classList.add('hidden');
            setTimeout(updateCounter, 0);
        });

        updateCounter();
    }

    /* ---------- REVIEWS ---------- */

    function initReviews() {
        const reviewForm = byId('review-form');
        const reviewList = byId('review-list');
        if (!reviewForm || !reviewList) {
            return;
        }
        let savedReviews = readStorage(STORAGE.reviews, []);
        const stars = (n) => '★'.repeat(n);

        function reviewCard(review) {
            const card = makeEl('div', 'card shadow-sm review-item');
            card.dataset.rating = review.rating;
            card.dataset.time = review.time;
            card.dataset.id = review.id;

            const body = makeEl('div', 'card-body');
            const meta = makeEl('p', 'small text-muted');
            const date = new Date(review.time);
            const time = makeEl('time', '', date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
            time.dateTime = toDateInputValue(date);
            meta.append(makeEl('strong', '', review.name), document.createTextNode(' — '), time);

            const quote = makeEl('blockquote', 'blockquote fs-6 border-start border-4 border-primary ps-3', '“' + review.text + '”');
            const footer = makeEl('p', 'mb-0 d-flex justify-content-between align-items-center');
            footer.append(
                makeEl('span', 'badge text-bg-primary', 'Rating: ' + review.rating + ' / 5 ' + stars(review.rating)),
                makeButton('btn btn-outline-secondary btn-sm review-delete', 'Delete my review')
            );

            body.append(makeEl('h3', 'h5', REVIEW_TITLES[review.rating]), meta, quote, footer);
            card.append(body);
            return card;
        }

        const staticCard = byId('review-aruzhan');
        staticCard.dataset.rating = staticCard.querySelector('.badge').textContent.match(/(\d) \/ 5/)[1];
        staticCard.dataset.time = new Date(staticCard.querySelector('time').dateTime).getTime();

        const controls = makeEl('div', 'row g-2 mb-3');
        controls.id = 'review-controls';

        function labelledSelect(id, label, options) {
            const col = makeEl('div', 'col-12 col-sm-6');
            const lab = makeEl('label', 'form-label small mb-1', label);
            lab.htmlFor = id;
            const select = makeEl('select', 'form-select form-select-sm');
            select.id = id;
            options.forEach(([value, text]) => {
                const option = makeEl('option', '', text);
                option.value = value;
                select.append(option);
            });
            col.append(lab, select);
            controls.append(col);
            return select;
        }

        const filterSelect = labelledSelect('review-filter', 'Show', [['all', 'All ratings'], ['5', '5 stars only'], ['4', '4 stars and more'], ['3', '3 stars and less']]);
        const sortSelect = labelledSelect('review-sort', 'Order', [['new', 'Newest first'], ['high', 'Highest rating first'], ['low', 'Lowest rating first']]);
        const resetFilters = makeButton('btn btn-outline-primary btn-sm mb-3', 'Reset filters', { id: 'review-filter-reset' });
        const stats = makeEl('p', 'small mb-3');
        stats.id = 'review-stats';
        stats.setAttribute('aria-live', 'polite');
        byId('rating-summary').after(controls, stats, resetFilters);

        function matchesFilter(rating, filter) {
            if (filter === 'all') {
                return true;
            }
            if (filter === '5') {
                return rating === 5;
            }
            return filter === '4' ? rating >= 4 : rating <= 3;
        }

        function sortCards(cards, order) {
            return [...cards].sort((a, b) => {
                if (order === 'high') {
                    return b.dataset.rating - a.dataset.rating || b.dataset.time - a.dataset.time;
                }
                if (order === 'low') {
                    return a.dataset.rating - b.dataset.rating || b.dataset.time - a.dataset.time;
                }
                return b.dataset.time - a.dataset.time;
            });
        }

        function renderReviews() {
            const all = [staticCard, ...savedReviews.map(reviewCard)];
            const shown = sortCards(all.filter((card) => matchesFilter(Number(card.dataset.rating), filterSelect.value)), sortSelect.value);
            reviewList.replaceChildren(...shown);

            if (shown.length === 0) {
                stats.textContent = 'No reviews with this rating yet.';
            } else {
                const average = averageRating(shown.map((card) => Number(card.dataset.rating)));
                stats.textContent = 'Showing ' + shown.length + ' of ' + plural(all.length, 'review') + ' on this page. Average rating: ' + average + ' / 5.';
            }
        }

        // event delegation
        reviewList.addEventListener('click', (event) => {
            const button = event.target.closest('.review-delete');
            if (!button) {
                return;
            }
            const id = button.closest('.review-item').dataset.id;
            savedReviews = savedReviews.filter((r) => r.id !== id);
            writeStorage(STORAGE.reviews, savedReviews);
            renderReviews();
        });

        resetFilters.addEventListener('click', () => {
            filterSelect.value = 'all';
            sortSelect.value = 'new';
            renderReviews();
        });
        filterSelect.addEventListener('change', renderReviews);
        sortSelect.addEventListener('change', renderReviews);

        function checkField(field) {
            const value = field.value.trim();
            switch (field.id) {
                case 'review-name':
                    return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
                case 'review-text':
                    return setFieldState(field, value.length >= 10 ? '' : 'Please write at least 10 characters.');
                default:
                    return true;
            }
        }

        function checkRating() {
            const chosen = reviewForm.querySelector('input[name="rating"]:checked');
            byId('review-rating-error').classList.toggle('d-block', chosen === null);
            reviewForm.querySelectorAll('input[name="rating"]').forEach((r) => r.classList.toggle('is-invalid', chosen === null));
            return chosen !== null;
        }

        addDemoNote(byId('review-success'), 'This is a demo: your review is not sent anywhere. It is kept only in this browser.');

        const ratingRow = byId('review-rating-5').closest('.form-check').parentElement;
        [...ratingRow.querySelectorAll('.form-check')]
            .sort((x, y) => Number(x.querySelector('input').value) - Number(y.querySelector('input').value))
            .forEach((option) => ratingRow.append(option));

        reviewForm.setAttribute('novalidate', '');
        liveValidate(reviewForm, checkField);
        reviewForm.addEventListener('change', (event) => {
            if (event.target.name === 'rating') {
                checkRating();
            }
        });

        reviewForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const results = [checkField(byId('review-name')), checkRating(), checkField(byId('review-text'))];
            const ok = results.every(Boolean);
            reportErrors(reviewForm, byId('review-error'), ok);
            if (!ok) {
                return;
            }
            savedReviews.push({
                id: String(Date.now()),
                name: byId('review-name').value.trim(),
                rating: Number(reviewForm.querySelector('input[name="rating"]:checked').value),
                text: byId('review-text').value.trim(),
                time: Date.now()
            });
            writeStorage(STORAGE.reviews, savedReviews);
            filterSelect.value = 'all';
            sortSelect.value = 'new';
            renderReviews();
            showSuccess(byId('review-result-text'), byId('review-success'));
            reviewList.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
            reviewForm.reset();
        });

        reviewForm.addEventListener('reset', () => {
            resetFieldStates(reviewForm);
            byId('review-rating-error').classList.remove('d-block');
            byId('review-error').classList.add('hidden');
        });

        renderReviews();
    }

    /* ---------- START ---------- */

    initOpenStatus();
    initCartBadge();
    initDrinkPicker();
    initFaqSearch();
    initMenu();
    initCoffeeCalculator();
    initOrder();
    initBooking();
    initVisit();
    initReviews();
})();
