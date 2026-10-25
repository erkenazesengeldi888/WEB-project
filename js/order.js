'use strict';

const LAST_ORDER_KEY = 'espressoday-last-order';
const LAST_BEFORE_CLOSE = 30; // minutes: the latest pick-up time is 30 minutes before closing
const orderForm = $('order-form');
const itemsList = $('order-items');

const isDelivery = () => $('order-method-delivery').checked;

function updateMethod() {
    const delivery = isDelivery();
    $('order-delivery-fields').classList.toggle('hidden', !delivery);
    $('order-pickup-info').classList.toggle('hidden', delivery);
    $('order-address').required = delivery;
    $('order-time-label').textContent = delivery ? 'Delivery time' : 'Pick-up time';
    $('order-method-text').textContent = delivery ? 'Delivery' : 'Pick up';
    if (!delivery) {
        $('order-address').classList.remove('is-invalid', 'is-valid');
    }
}

function stepButton(sign, label, onClick) {
    const button = makeEl('button', 'btn btn-outline-primary btn-sm cart-step', sign);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.addEventListener('click', onClick);
    return button;
}

function orderRow(item) {
    const li = makeEl('li', 'list-group-item px-0');

    const remove = makeEl('button', 'btn-close btn-sm');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove ' + item.name);
    remove.addEventListener('click', () => EDCart.setQty(item.name, item.size, item.price, 0));
    const top = makeEl('div', 'd-flex justify-content-between');
    top.append(makeEl('span', 'fw-semibold', EDCart.label(item)), remove);

    const stepper = makeEl('div', 'd-flex align-items-center gap-2');
    stepper.append(
        stepButton('−', 'Less ' + item.name, () => EDCart.setQty(item.name, item.size, item.price, item.qty - 1)),
        makeEl('span', 'cart-qty', String(item.qty)),
        stepButton('+', 'More ' + item.name, () => EDCart.setQty(item.name, item.size, item.price, item.qty + 1))
    );
    const row = makeEl('div', 'd-flex justify-content-between align-items-center mt-1');
    row.append(stepper, makeEl('strong', 'text-primary', EDCart.format(item.qty * item.price)));

    li.append(top, row);
    return li;
}

function emptyRow() {
    const li = makeEl('li', 'list-group-item px-0 text-muted', 'Your order is empty. ');
    li.id = 'order-empty';
    const link = makeEl('a', '', 'Choose drinks on the Menu page');
    link.href = 'menu.html';
    li.append(link, document.createTextNode('.'));
    return li;
}

function renderOrder() {
    const items = EDCart.items();
    itemsList.replaceChildren(...(items.length ? items.map(orderRow) : [emptyRow()]));
    $('order-count').textContent = EDCart.count();
    $('order-total').textContent = EDCart.format(EDCart.total());
    renderRepeat();
}

const repeatButton = makeEl('button', 'btn btn-outline-secondary hidden', 'Repeat my last order');
repeatButton.type = 'button';
repeatButton.id = 'order-repeat';
$('order-reset').before(repeatButton);

function renderRepeat() {
    const last = readStorage(LAST_ORDER_KEY, null);
    const show = last !== null && EDCart.items().length === 0;
    repeatButton.classList.toggle('hidden', !show);
    if (show) {
        repeatButton.textContent = 'Repeat my last order (' + last.items.reduce((sum, c) => sum + c.qty, 0) + ' drinks, ' + EDCart.format(calcTotal(last.items)) + ')';
    }
}

repeatButton.addEventListener('click', () => {
    const last = readStorage(LAST_ORDER_KEY, null);
    if (last) {
        EDCart.replaceAll(last.items);
        $('order-error').classList.add('hidden');
    }
});

function checkField(field) {
    const value = field.value;
    switch (field.id) {
        case 'order-name':
            return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
        case 'order-phone':
            return setFieldState(field, isValidPhone(value) ? '' : 'Please enter a phone number we can call, for example +7 771 419 84 57.');
        case 'order-address':
            if (!isDelivery()) {
                return true;
            }
            return setFieldState(field, value.trim().length >= 5 ? '' : 'Please enter the delivery address: street and building.');
        case 'order-time': {
            if (value === '') {
                return setFieldState(field, 'Please choose a time.');
            }
            const hours = getHours(new Date());
            const latest = pad(Math.floor((toMinutes(hours.close) - LAST_BEFORE_CLOSE) / 60)) + ':' + pad((toMinutes(hours.close) - LAST_BEFORE_CLOSE) % 60);
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
    const fields = ['order-name', 'order-phone', 'order-address', 'order-time', 'order-consent'].map($);
    const results = fields.map(checkField); // run every check so all wrong fields are marked
    return results.every(Boolean) && EDCart.items().length > 0;
}

function suggestTime() {
    const now = new Date();
    const hours = getHours(now);
    let minutes = Math.ceil((now.getHours() * 60 + now.getMinutes() + 30) / 5) * 5;
    minutes = Math.max(toMinutes(hours.open), Math.min(minutes, toMinutes(hours.close) - LAST_BEFORE_CLOSE));
    return pad(Math.floor(minutes / 60)) + ':' + pad(minutes % 60);
}

function showConfirmation(order) {
    $('order-number').textContent = order.number;
    $('order-pickup').textContent = (order.delivery ? 'delivery to ' + order.address + ' at ' : 'pick-up at ') + order.time;
    $('order-final-total').textContent = EDCart.format(calcTotal(order.items));

    let list = $('order-success-items');
    if (!list) {
        list = makeEl('ul', 'mb-2');
        list.id = 'order-success-items';
        $('order-success').querySelector('p').after(list);
    }
    list.replaceChildren(...order.items.map((c) => makeEl('li', '', c.qty + ' × ' + EDCart.label(c) + ' — ' + EDCart.format(c.qty * c.price))));
    showSuccess($('order-result-text'), $('order-success'));
    $('order-result').scrollIntoView({ block: 'center' });
}

addDemoNote($('order-success'), 'This is a demo: your data is not sent anywhere and no real order is placed. Nothing is paid or prepared.');
orderForm.setAttribute('novalidate', '');
liveValidate(orderForm, checkField);
orderForm.addEventListener('change', (event) => {
    if (event.target.name === 'method') {
        updateMethod();
    }
});

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = validateOrder();
    reportErrors(orderForm, $('order-error'), ok);
    if (!ok) {
        $('order-error').scrollIntoView({ block: 'center' });
        return;
    }
    const order = {
        number: generateOrderNumber(),
        delivery: isDelivery(),
        address: $('order-address').value.trim(),
        time: $('order-time').value,
        items: EDCart.items().map((c) => ({ ...c }))
    };
    writeStorage(LAST_ORDER_KEY, order);
    showConfirmation(order);
    EDCart.clear();
    orderForm.reset();
});

orderForm.addEventListener('reset', () => {
    resetFieldStates(orderForm);
    $('order-error').classList.add('hidden');
    setTimeout(() => {
        updateMethod();
        $('order-time').value = suggestTime();
    }, 0);
});

$('order-reset').addEventListener('click', () => {
    EDCart.clear();
    hideSuccess($('order-result-text'), $('order-success'));
});

EDCart.onChange(renderOrder);
renderOrder();
updateMethod();
$('order-time').value = suggestTime();
