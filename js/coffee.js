'use strict';

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
    $('work-info').before(section);

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
        const name = extrasName(state.drink.name, picker.options());
        EDCart.setQty(name, state.drink.size, state.one, EDCart.qty(name, state.drink.size) + state.count);
        done.classList.remove('hidden');
    });
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();
}

buildCalculator();
