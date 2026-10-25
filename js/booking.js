'use strict';

/* Booking page.
   Feature 1: validation of the table request against the real opening hours of the chosen day, then a summary.
   Feature 2: time slots for the chosen date are built as buttons; one press fills the time field. */

const LAST_BOOKING = 60; // minutes: the last table starts one hour before closing
const SLOT_STEP = 30;    // minutes between slots
const bookingForm = $('booking-form');
const dateInput = $('booking-date');
const timeInput = $('booking-time');

// The date field starts today; earlier days cannot be chosen
dateInput.min = toDateInputValue(new Date());

// ---------- time slots ----------
const slotBox = makeEl('div', 'd-flex flex-wrap gap-1 mt-2');
slotBox.id = 'booking-slots';
slotBox.setAttribute('role', 'group');
slotBox.setAttribute('aria-label', 'Available times');
$('booking-time-hint').after(slotBox);

function renderSlots() {
    if (dateInput.value === '') {
        slotBox.replaceChildren(makeEl('span', 'small text-muted', 'Choose a date to see the times.'));
        return;
    }
    const date = parseDateInput(dateInput.value);
    const slots = buildTimeSlots(date, new Date(), SLOT_STEP, LAST_BOOKING);
    if (slots.length === 0) {
        slotBox.replaceChildren(makeEl('span', 'small text-muted', 'No more times on this day. Please choose another date.'));
        return;
    }
    slotBox.replaceChildren(...slots.map((slot) => {
        const button = makeEl('button', 'btn btn-outline-primary btn-sm' + (slot === timeInput.value ? ' active' : ''), slot);
        button.type = 'button';
        button.dataset.time = slot;
        button.setAttribute('aria-pressed', String(slot === timeInput.value));
        return button;
    }));
}

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

// ---------- validation ----------
function checkField(field) {
    const value = field.value;
    switch (field.id) {
        case 'booking-name':
            return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
        case 'booking-email':
            return setFieldState(field, isValidEmail(value) ? '' : 'Please enter a valid e-mail address, for example name@mail.com.');
        case 'booking-phone':
            return setFieldState(field, isValidPhone(value) ? '' : 'Please enter a phone number we can call, for example +7 771 419 84 57.');
        case 'booking-guests': {
            const guests = Number(value);
            if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
                return setFieldState(field, 'Please enter a whole number from 1 to 10. For more guests, please call us.');
            }
            return setFieldState(field, '');
        }
        case 'booking-date': {
            if (value === '') {
                return setFieldState(field, 'Please choose a date of visit.');
            }
            if (value < toDateInputValue(new Date())) {
                return setFieldState(field, 'This date has already passed. Please choose today or a later day.');
            }
            return setFieldState(field, '');
        }
        case 'booking-time': {
            if (value === '') {
                return setFieldState(field, 'Please choose a time of visit.');
            }
            if (dateInput.value === '') {
                return setFieldState(field, '');
            }
            const date = parseDateInput(dateInput.value);
            const hours = getHours(date);
            const latestMinutes = toMinutes(hours.close) - LAST_BOOKING;
            if (!isTimeWithinHours(value, date, LAST_BOOKING)) {
                return setFieldState(field, 'On this day tables are booked between ' + hours.open + ' and ' + pad(Math.floor(latestMinutes / 60)) + ':' + pad(latestMinutes % 60) + '.');
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
    // the date is checked first: the time rules depend on it
    const fields = ['booking-name', 'booking-email', 'booking-phone', 'booking-guests', 'booking-date', 'booking-time', 'booking-consent'].map($);
    return fields.map(checkField).every(Boolean);
}

function formatDate(value) {
    return parseDateInput(value).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

addDemoNote($('booking-success'), 'This is a demo: your data is not sent anywhere and no table is really reserved.');
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
    reportErrors(bookingForm, $('booking-error'), ok);
    if (!ok) {
        return;
    }
    const guests = Number($('booking-guests').value);
    $('summary-name').textContent = $('booking-name').value.trim();
    $('summary-guests').textContent = guests + (guests === 1 ? ' guest' : ' guests');
    $('summary-date').textContent = formatDate(dateInput.value);
    $('summary-time').textContent = timeInput.value;
    $('summary-phone').textContent = $('booking-phone').value.trim();
    showSuccess($('booking-result-text'), $('booking-success'));
    $('booking-result').scrollIntoView({ block: 'center' });
    bookingForm.reset();
});

bookingForm.addEventListener('reset', () => {
    resetFieldStates(bookingForm);
    $('booking-error').classList.add('hidden');
    setTimeout(renderSlots, 0);
});

renderSlots();
