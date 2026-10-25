'use strict';

const REVIEWS_KEY = 'espressoday-reviews';
const TITLES = ['', 'A poor experience', 'Could be better', 'A good visit', 'A very good visit', 'An excellent visit'];
const reviewForm = $('review-form');
const reviewList = $('review-list');

let savedReviews = readStorage(REVIEWS_KEY, []);

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

const staticCard = $('review-aruzhan');
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
const resetFilters = makeEl('button', 'btn btn-outline-primary btn-sm mb-3', 'Reset filters');
resetFilters.type = 'button';
resetFilters.id = 'review-filter-reset';
resetFilters.addEventListener('click', () => {
    filterSelect.value = 'all';
    sortSelect.value = 'new';
    renderReviews();
});
const stats = makeEl('p', 'small mb-3');
stats.id = 'review-stats';
stats.setAttribute('aria-live', 'polite');
$('rating-summary').after(controls, stats, resetFilters);

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
        stats.textContent = 'Showing ' + shown.length + ' of ' + all.length + ' review' + (all.length === 1 ? '' : 's') + ' on this page. Average rating: ' + average + ' / 5.';
    }
}

filterSelect.addEventListener('change', renderReviews);
sortSelect.addEventListener('change', renderReviews);

function checkField(field) {
    const value = field.value;
    switch (field.id) {
        case 'review-name':
            return setFieldState(field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
        case 'review-text':
            return setFieldState(field, value.trim().length >= 10 ? '' : 'Please write at least 10 characters.');
        default:
            return true;
    }
}

function checkRating() {
    const chosen = reviewForm.querySelector('input[name="rating"]:checked');
    $('review-rating-error').classList.toggle('d-block', chosen === null);
    reviewForm.querySelectorAll('input[name="rating"]').forEach((r) => r.classList.toggle('is-invalid', chosen === null));
    return chosen !== null;
}

addDemoNote($('review-success'), 'This is a demo: your review is not sent anywhere. It is kept only in this browser.');
const ratingRow = $('review-rating-5').closest('.form-check').parentElement;
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
    const results = [checkField($('review-name')), checkRating(), checkField($('review-text'))];
    const ok = results.every(Boolean);
    reportErrors(reviewForm, $('review-error'), ok);
    if (!ok) {
        return;
    }
    savedReviews.push({
        id: String(Date.now()),
        name: $('review-name').value.trim(),
        rating: Number(reviewForm.querySelector('input[name="rating"]:checked').value),
        text: $('review-text').value.trim(),
        time: Date.now()
    });
    writeStorage(REVIEWS_KEY, savedReviews);
    filterSelect.value = 'all';
    sortSelect.value = 'new';
    renderReviews();
    showSuccess($('review-result-text'), $('review-success'));
    reviewList.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    reviewForm.reset();
});

reviewForm.addEventListener('reset', () => {
    resetFieldStates(reviewForm);
    $('review-rating-error').classList.remove('d-block');
    $('review-error').classList.add('hidden');
});

renderReviews();
