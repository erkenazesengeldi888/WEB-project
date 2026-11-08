'use strict';

<<<<<<< HEAD
/* OLD PLAIN JAVASCRIPT VERSIONS (Assignment 4-5), kept for comparison with the jQuery versions
   This file is NOT linked to any page. The three functions below were rewritten with jQuery:
     1. FAQ search            about.js    (old buildFaqSearch)
     2. Booking validation    booking.js  (old checkField, validateBooking and the submit handler)
     3. Review cards and list reviews.js  (old reviewCard, deleteReview, renderReviews)
   They use the helpers of main.js (byId, makeEl, setFieldState, reportErrors, ...) */

// ======================= 1. FAQ search (old about.js) =======================
=======
>>>>>>> 800ed67c0c9cad746f2be930d95b5ff51f75fe43
const faqItems = [...document.querySelectorAll('#faq-list .accordion-item')];

function buildFaqSearch() {
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

    byId('faq-list').before(form, status, empty);

    // Which questions contain every word typed (question and answer are both searched)
    function matches(item, words) {
        const text = item.textContent.toLowerCase();
        return words.every((word) => text.includes(word));
    }

    function update() {
        const words = input.value.toLowerCase().split(/\s+/).filter((w) => w !== '');
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

// ======================= 2. Booking validation (old booking.js) =======================
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
    const fields = ['booking-name', 'booking-email', 'booking-phone', 'booking-guests', 'booking-date', 'booking-time', 'booking-consent'].map(byId);
    return fields.map(checkField).every(Boolean);
}

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = validateBooking();
    reportErrors(bookingForm, byId('booking-error'), ok);
    if (!ok) {
        return;
    }
    const guests = Number(byId('booking-guests').value);
    byId('summary-name').textContent = byId('booking-name').value.trim();
    byId('summary-guests').textContent = guests + (guests === 1 ? ' guest' : ' guests');
    byId('summary-date').textContent = formatDate(dateInput.value);
    byId('summary-time').textContent = timeInput.value;
    byId('summary-phone').textContent = byId('booking-phone').value.trim();
    showSuccess(byId('booking-result-text'), byId('booking-success'));
    byId('booking-result').scrollIntoView({ block: 'center' });
    bookingForm.reset();
});

// ======================= 3. Review cards and list (old reviews.js) =======================
// ---------- one review card (same markup as the review already on the page) ----------
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
    const remove = makeEl('button', 'btn btn-outline-secondary btn-sm', 'Delete my review');
    remove.type = 'button';
    remove.addEventListener('click', () => deleteReview(review.id));
    footer.append(makeEl('span', 'badge text-bg-primary', 'Rating: ' + review.rating + ' / 5 ' + stars(review.rating)), remove);

    body.append(makeEl('h3', 'h5', TITLES[review.rating]), meta, quote, footer);
    card.append(body);
    return card;
}

function deleteReview(id) {
    savedReviews = savedReviews.filter((r) => r.id !== id);
    writeStorage(REVIEWS_KEY, savedReviews);
    renderReviews();
}

function renderReviews() {
    const all = [staticCard, ...savedReviews.map(reviewCard)];
    const shown = sortCards(all.filter((card) => matchesFilter(Number(card.dataset.rating), filterSelect.value)), sortSelect.value);
    reviewList.replaceChildren(...shown);

    if (shown.length === 0) {
        stats.textContent = 'No reviews with this rating yet.';
    } else {
        const average = averageRating(shown.map((card) => Number(card.dataset.rating)));
        stats.textContent = 'Showing ' + shown.length + ' of ' + all.length + ' review' + (all.length === 1 ? '' : 's') + ' on this page. Average rating: ' + average + ' / 5.';
    }
}
