'use strict';

function markToday() {
    const now = new Date();
    const rows = document.querySelectorAll('#opening-hours-table tbody tr');
    const weekend = now.getDay() === 0 || now.getDay() === 6;
    const row = rows[weekend ? 1 : 0];
    const hours = getHours(now);
    const status = getOpenStatus(now);

    rows.forEach((r) => r.classList.remove('active'));
    row.classList.add('active');

    const today = makeEl('p', 'mt-2 mb-0');
    today.id = 'opening-hours-today';
    today.append(
        makeEl('strong', '', 'Today: '),
        document.createTextNode(hours.open + '–' + hours.close + '. ' + status.text + '.')
    );
    byId('opening-hours-table').closest('.table-responsive').after(today);
}

const contactForm = byId('contact-form');
const messageInput = byId('contact-message');
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 500;

messageInput.maxLength = MESSAGE_MAX;
const counter = makeEl('div', 'form-text');
counter.id = 'contact-message-count';
messageInput.after(counter);

function updateCounter() {
    const length = messageInput.value.length;
    counter.textContent = length < MESSAGE_MIN
        ? length + ' / ' + MESSAGE_MAX + ' characters (at least ' + MESSAGE_MIN + ')'
        : length + ' / ' + MESSAGE_MAX + ' characters';
}

function checkField(field) {
    const value = field.value;
    switch (field.id) {
        case 'contact-name':
            return setFieldState(field, isValidName(value) ? '' : 'Please enter your name using letters only (at least 2 letters).');
        case 'contact-email':
            return setFieldState(field, isValidEmail(value) ? '' : 'Please enter a valid e-mail address, for example name@mail.com.');
        case 'contact-email-confirm':
            if (!isValidEmail(value)) {
                return setFieldState(field, 'Please repeat your e-mail address.');
            }
            return setFieldState(field, value.trim().toLowerCase() === byId('contact-email').value.trim().toLowerCase() ? '' : 'The e-mail addresses are not the same.');
        case 'contact-phone':
                return setFieldState(field, isPhoneKz(value) ? '' : 'Enter +7 followed by 10 digits (11 digits in total).');
        case 'contact-topic':
            return setFieldState(field, value !== '' ? '' : 'Please choose a topic.');
        case 'contact-message':
            return setFieldState(field, value.trim().length >= MESSAGE_MIN ? '' : 'Please write at least ' + MESSAGE_MIN + ' characters.');
        default:
            return true;
    }
}

addDemoNote(byId('contact-success'), 'This is a demo: your question is not sent anywhere.');

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

function makePhoneField() {
    const col = makeEl('div', 'col-12 col-md-6');
    const label = makeEl('label', 'form-label', 'Phone number');
    label.htmlFor = 'contact-phone';
    const input = makeEl('input', 'form-control');
    input.type = 'tel';
    input.id = 'contact-phone';
    input.name = 'phone';
    input.autocomplete = 'tel';
    input.inputMode = 'tel';
    input.value = PHONE_PREFIX;
    input.required = true;
    setUpPhoneField(input);
    const error = makeEl('div', 'invalid-feedback', 'Please enter a phone number.');
    error.id = 'contact-phone-error';
    col.append(label, input, error);
    return col;
}

confirmCol.after(makePhoneField());

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
    const fields = ['contact-name', 'contact-email', 'contact-email-confirm', 'contact-phone', 'contact-topic', 'contact-message'].map(byId);
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
    setTimeout(() => {
        updateCounter();
        byId('contact-phone').value = PHONE_PREFIX;
    }, 0);
});

markToday();
updateCounter();
