'use strict';

function drinkResult(drink) {
    const li = makeEl('li', 'list-group-item d-flex justify-content-between align-items-center gap-2');
    const text = makeEl('span', '');
    text.append(makeEl('strong', '', drink.name), document.createTextNode(' \u00b7 ' + drink.size + ' \u00b7 ' + (drink.milk ? 'with milk' : 'no milk')));
    const add = makeEl('button', 'btn btn-primary btn-sm', formatPrice(drink.price) + ' \u2013 Add');
    add.type = 'button';
    add.setAttribute('aria-label', 'Add ' + drink.name + ' to cart');
    add.addEventListener('click', () => {
        EDCart.add(drink.name, drink.size, drink.price);
        add.textContent = '\u2713 Added';
        add.classList.add('added');
        setTimeout(() => {
            add.textContent = formatPrice(drink.price) + ' \u2013 Add';
            add.classList.remove('added');
        }, 900);
    });
    li.append(text, add);
    return li;
}

function buildPicker() {
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
    const priceLabel = makeEl('label', 'form-label', 'Most I want to pay (\u20b8)');
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
    const random = makeEl('button', 'btn btn-primary flex-fill', 'Pick one for me');
    random.type = 'button';
    buttonCol.append(random, reset);

    form.append(milkCol, priceCol, buttonCol);

    const status = makeEl('p', 'small text-muted mb-2');
    status.id = 'picker-status';
    status.setAttribute('aria-live', 'polite');
    const empty = makeEl('div', 'alert alert-warning hidden', 'No coffee fits these wishes. Try a higher price or press Reset.');
    empty.setAttribute('role', 'status');
    const list = makeEl('ul', 'list-group');
    list.id = 'picker-list';

    body.append(form, status, empty, list);
    section.append(body);
    $('welcome').after(section);

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
        list.replaceChildren(...shown.map(drinkResult));
        empty.classList.toggle('hidden', shown.length > 0);
        status.textContent = shown.length === DRINKS.length
            ? 'Showing all ' + DRINKS.length + ' coffees.'
            : 'Found ' + shown.length + ' of ' + DRINKS.length + ' coffees.';
    }

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
        list.replaceChildren(drinkResult(pick));
        status.textContent = 'Today we suggest: ' + pick.name + '. Press Reset to see the list again.';
    });
    update();
}

buildPicker();
