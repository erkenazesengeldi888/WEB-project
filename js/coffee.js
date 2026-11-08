'use strict';

/* Data of this page: how each coffee variety is built. The table in "Coffee Varieties" is made from this array. */
const VARIETIES = [
    { name: 'Espresso', recipe: '2 espresso shots, 60 ml' },
    { name: 'Americano', recipe: 'Espresso shot + hot water' },
    { name: 'Latte', recipe: 'Espresso shot + steamed milk, thin layer of foam' },
    { name: 'Cappuccino', recipe: 'Espresso shot + steamed milk + thick milk foam, in equal parts' },
    { name: 'Flat White', recipe: 'Espresso shot + steamed milk with fine microfoam, no thick foam layer' },
    { name: 'Raf', recipe: 'Espresso shot + fresh cream, flavoured with syrup' },
    { name: 'Spanish Latte', recipe: 'Espresso shot + milk + condensed milk' },
    { name: 'Mokkacino', recipe: 'Espresso shot + milk + cocoa' },
    { name: '\u015eie Bumble', recipe: 'Espresso shot + cherry juice + ice' },
    { name: 'Bumble Coffee', recipe: 'Espresso shot + fresh orange juice + ice' }
];

/* Coffee page: "Build your coffee" - choose a drink, extras and the number of cups, see the price at once,
   then add the cup to the cart. The extras prices are the ones printed in "Customise Your Coffee". */

function buildCalculator() {
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
        const option = makeEl('option', '', d.name + ' (' + d.size + ') \u2013 ' + formatPrice(d.price));
        option.value = String(index);
        drinkSelect.append(option);
    });
    field('col-12 col-md-6', 'Coffee', drinkSelect, 'calc-drink');

    const qty = makeEl('input', 'form-control');
    qty.type = 'number';
    qty.min = '1';
    qty.max = String(EDCart.MAX);
    qty.value = '1';
    const qtyWrap = field('col-12 col-md-6', 'Number of cups (1\u2013' + EDCart.MAX + ')', qty, 'calc-qty');
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
    byId('work-info').before(section);

    function render() {
        const drink = DRINKS[Number(drinkSelect.value)];
        picker.setTraits({ milk: drink.milk, freeMilk: Boolean(drink.freeMilk) });

        const count = Number(qty.value);
        const valid = Number.isInteger(count) && count >= 1 && count <= EDCart.MAX;
        setFieldState(qty, valid ? '' : 'Please enter a whole number from 1 to ' + EDCart.MAX + '.');
        done.classList.add('hidden');
        if (!valid) {
            line.textContent = 'One cup: \u2014';
            total.textContent = 'Total: \u2014';
            return null;
        }
        const one = calcDrinkPrice(drink, picker.options());
        line.textContent = 'One cup: ' + formatPrice(one);
        total.textContent = 'Total for ' + count + ' cup' + (count === 1 ? '' : 's') + ': ' + formatPrice(one * count);
        return { drink, count, one };
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const state = render();
        if (state === null) {
            qty.focus();
            return;
        }
        // the cart keeps one line per name + size, so the name carries the extras
        const name = extrasName(state.drink.name, picker.options());
        EDCart.setQty(name, state.drink.size, state.one, EDCart.qty(name, state.drink.size) + state.count);
        done.classList.remove('hidden');
    });
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();
}

/* Coffee Varieties: the rows come from VARIETIES (the HTML table body is empty). A search field filters them, and a press on a
   name chooses that drink in "Build your coffee" below. */

// Put text into parent; the part that equals the search words goes into <mark> (the text is never parsed as HTML)
function appendMarked(parent, text, query) {
    const at = query === '' ? -1 : text.toLowerCase().indexOf(query);
    if (at === -1) {
        parent.append(text);
        return;
    }
    parent.append(text.slice(0, at), makeEl('mark', 'highlight', text.slice(at, at + query.length)), text.slice(at + query.length));
}

function buildVarieties() {
    const section = byId('menu-table');
    const tbody = section.querySelector('tbody');
    let selected = '';

    const form = makeEl('form', 'row g-2 align-items-end mb-2');
    form.id = 'variety-form';
    form.setAttribute('novalidate', '');
    const searchCol = makeEl('div', 'col-12 col-md-8');
    const label = makeEl('label', 'form-label', 'Find a variety by name or by what it contains (for example: milk, juice)');
    label.htmlFor = 'variety-search';
    const input = makeEl('input', 'form-control');
    input.type = 'search';
    input.id = 'variety-search';
    input.autocomplete = 'off';
    searchCol.append(label, input);
    const clearCol = makeEl('div', 'col-12 col-md-4');
    const clear = makeEl('button', 'btn btn-outline-primary', 'Clear');
    clear.type = 'reset';
    clearCol.append(clear);
    form.append(searchCol, clearCol);
    const status = makeEl('p', 'small mb-2');
    status.id = 'variety-status';
    status.setAttribute('aria-live', 'polite');
    section.querySelector('.table-responsive').before(form, status);

    function varietyRow(variety, query) {
        const row = makeEl('tr', variety.name === selected ? 'table-active' : '');
        const head = makeEl('th');
        head.scope = 'row';
        const pick = makeEl('button', 'btn p-0 fw-bold text-start text-primary text-decoration-underline variety-pick');
        pick.type = 'button';
        pick.dataset.name = variety.name;
        appendMarked(pick, variety.name, query);
        head.append(pick);
        const cell = makeEl('td');
        appendMarked(cell, variety.recipe, query);
        row.append(head, cell);
        return row;
    }

    function render() {
        const query = input.value.trim().toLowerCase();
        const found = VARIETIES.filter((v) => (v.name + ' ' + v.recipe).toLowerCase().includes(query));
        tbody.replaceChildren(...found.map((v) => varietyRow(v, query)));
        if (found.length === 0) {
            const row = makeEl('tr');
            const cell = makeEl('td', 'text-center text-muted py-4', 'No variety matches \u201c' + input.value.trim() + '\u201d. Press Clear to see all of them.');
            cell.colSpan = 2;
            row.append(cell);
            tbody.append(row);
        }
        status.textContent = query === ''
            ? VARIETIES.length + ' varieties. Press a name to build that coffee below.'
            : found.length + ' of ' + VARIETIES.length + ' varieties match \u201c' + input.value.trim() + '\u201d.';
    }

    // delegated: the rows are made again at every render, so the handler sits on the table body, which stays
    tbody.addEventListener('click', (event) => {
        const pick = event.target.closest('.variety-pick');
        if (pick === null) {
            return;
        }
        selected = pick.dataset.name;
        render();
        Array.from(tbody.querySelectorAll('.variety-pick')).find((b) => b.dataset.name === selected).focus();

        const index = DRINKS.findIndex((d) => d.name.toLowerCase() === selected.toLowerCase());
        if (index === -1) {
            status.textContent = selected + ' is not in the online order list yet. Ask for it at the bar.';
            return;
        }
        const select = byId('calc-drink');
        select.value = String(index);
        select.dispatchEvent(new Event('change', { bubbles: true }));
        status.textContent = selected + ' is chosen in \u201cBuild your coffee\u201d below.';
        byId('coffee-calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    input.addEventListener('input', render);
    form.addEventListener('submit', (event) => event.preventDefault());
    form.addEventListener('reset', () => setTimeout(render, 0));
    render();
}

buildCalculator();
buildVarieties();
