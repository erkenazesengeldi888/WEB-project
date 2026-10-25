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
    $('opening-hours-table').closest('.table-responsive').after(today);
}

const contactForm = $('contact-form');
const messageInput = $('contact-message');
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
            return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
        case 'contact-email':
            return setFieldState(field, isValidEmail(value) ? '' : 'Please enter a valid e-mail address, for example name@mail.com.');
        case 'contact-email-confirm':
            if (!isValidEmail(value)) {
                return setFieldState(field, 'Please repeat your e-mail address.');
            }
            return setFieldState(field, value.trim().toLowerCase() === $('contact-email').value.trim().toLowerCase() ? '' : 'The e-mail addresses are not the same.');
        case 'contact-topic':
            return setFieldState(field, value !== '' ? '' : 'Please choose a topic.');
        case 'contact-message':
            return setFieldState(field, value.trim().length >= MESSAGE_MIN ? '' : 'Please write at least ' + MESSAGE_MIN + ' characters.');
        default:
            return true;
    }
}

addDemoNote($('contact-success'), 'This is a demo: your question is not sent anywhere.');

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
$('contact-email').closest('.col-12').after(confirmCol);

contactForm.setAttribute('novalidate', '');
liveValidate(contactForm, checkField);
messageInput.addEventListener('input', updateCounter);
$('contact-email').addEventListener('input', () => {
    if (confirmInput.value !== '') {
        checkField(confirmInput);
    }
});

contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = ['contact-name', 'contact-email', 'contact-email-confirm', 'contact-topic', 'contact-message'].map($);
    const ok = fields.map(checkField).every(Boolean);
    reportErrors(contactForm, $('contact-error'), ok);
    if (!ok) {
        return;
    }
    const topic = $('contact-topic');
    $('contact-success-name').textContent = $('contact-name').value.trim();
    $('contact-success-topic').textContent = topic.options[topic.selectedIndex].text;
    $('contact-success-email').textContent = $('contact-email').value.trim();
    showSuccess($('contact-result-text'), $('contact-success'));
    $('contact-result').scrollIntoView({ block: 'center' });
    contactForm.reset();
});

contactForm.addEventListener('reset', () => {
    resetFieldStates(contactForm);
    $('contact-error').classList.add('hidden');
    setTimeout(updateCounter, 0);
});

markToday();
updateCounter();
