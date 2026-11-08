'use strict';

const REVIEWS_KEY = 'espressoday-reviews';
const TITLES = ['', 'A poor experience', 'Could be better', 'A good visit', 'A very good visit', 'An excellent visit'];

$(function () {
    const $form = $('#review-form');
    const $list = $('#review-list');
    let savedReviews = readStorage(REVIEWS_KEY, []);

    const stars = (n) => '★'.repeat(n);

    // ---------- one review card ----------
    // Function 3 of 3. $('<tag>', {props}) replaces createElement + className + textContent + dataset, and .append()
    // takes several children at once: clearly shorter, and the nesting of the card is visible.
    function reviewCard(review) {
        const date = new Date(review.time);
        const $meta = $('<p>', { 'class': 'small text-muted' }).append(
            $('<strong>', { text: review.name }),
            ' — ',
            $('<time>', {
                text: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                datetime: toDateInputValue(date)
            })
        );
        const $quote = $('<blockquote>', {
            'class': 'blockquote fs-6 border-start border-4 border-primary ps-3',
            text: '“' + review.text + '”'
        });
        const $footer = $('<p>', { 'class': 'mb-0 d-flex justify-content-between align-items-center' }).append(
            $('<span>', { 'class': 'badge text-bg-primary', text: 'Rating: ' + review.rating + ' / 5 ' + stars(review.rating) }),
            $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary btn-sm review-delete', text: 'Delete my review' })
        );
        const $body = $('<div>', { 'class': 'card-body' }).append(
            $('<h3>', { 'class': 'h5', text: TITLES[review.rating] }),
            $meta,
            $quote,
            $footer
        );
        return $('<div>', {
            'class': 'card shadow-sm review-item',
            'data-rating': review.rating,
            'data-time': review.time,
            'data-id': review.id
        }).append($body);
    }

    // Delegated: the Delete buttons do not exist yet when this line runs, so a handler bound directly to them would attach
    // to nothing. #review-list exists now and catches the click that bubbles up from any button made later.
    $list.on('click', '.review-delete', function () {
        const $button = $(this).prop('disabled', true);
        const $card = $button.closest('.review-item');
        const id = String($card.attr('data-id'));
        // the card is removed from the data only when the fade has ended (callback)
        $card.fadeOut(300, function () {
            savedReviews = savedReviews.filter((r) => r.id !== id);
            writeStorage(REVIEWS_KEY, savedReviews);
            renderReviews();
        });
    });

    const $staticCard = $('#review-aruzhan');
    $staticCard.attr({
        'data-rating': $staticCard.find('.badge').text().match(/(\d) \/ 5/)[1],
        'data-time': new Date($staticCard.find('time').attr('datetime')).getTime()
    });

    // ---------- filter and sort ----------
    const $controls = $('<div>', { id: 'review-controls', 'class': 'row g-2 mb-3' });

    function labelledSelect(id, label, options) {
        const $select = $('<select>', { id: id, 'class': 'form-select form-select-sm' });
        $.each(options, function (index, pair) {
            $('<option>', { value: pair[0], text: pair[1] }).appendTo($select);
        });
        $('<div>', { 'class': 'col-12 col-sm-6' })
            .append($('<label>', { 'class': 'form-label small mb-1', 'for': id, text: label }), $select)
            .appendTo($controls);
        return $select;
    }

    const $filter = labelledSelect('review-filter', 'Show', [['all', 'All ratings'], ['5', '5 stars only'], ['4', '4 stars and more'], ['3', '3 stars and less']]);
    const $sort = labelledSelect('review-sort', 'Order', [['new', 'Newest first'], ['high', 'Highest rating first'], ['low', 'Lowest rating first']]);

    const $reset = $('<button>', { type: 'button', id: 'review-filter-reset', 'class': 'btn btn-outline-primary btn-sm mb-3 me-2', text: 'Reset filters' });
    const $toggle = $('<button>', {
        type: 'button',
        id: 'review-filter-toggle',
        'class': 'btn btn-outline-secondary btn-sm mb-3',
        'aria-expanded': 'true',
        'aria-controls': 'review-controls',
        text: 'Hide filters'
    });
    const $stats = $('<p>', { id: 'review-stats', 'class': 'small mb-3', 'aria-live': 'polite' });
    $('#rating-summary').after($reset, $toggle, $controls, $stats);

    // the button text changes in the callback, when the panel has finished moving
    $toggle.on('click', function () {
        $controls.slideToggle(250, function () {
            const open = $controls.is(':visible');
            $toggle.text(open ? 'Hide filters' : 'Show filters').attr('aria-expanded', String(open));
        });
    });

    $reset.on('click', function () {
        $filter.val('all');
        $sort.val('new');
        renderReviews();
    });

    function matchesFilter(rating, filter) {
        switch (filter) {
            case 'all':
                return true;
            case '5':
                return rating === 5;
            case '4':
                return rating >= 4;
            default:
                return rating <= 3;
        }
    }

    function sortCards(cards, order) {
        const rating = ($c) => Number($c.attr('data-rating'));
        const time = ($c) => Number($c.attr('data-time'));
        return [...cards].sort((a, b) => {
            if (order === 'high') {
                return rating(b) - rating(a) || time(b) - time(a);
            }
            if (order === 'low') {
                return rating(a) - rating(b) || time(b) - time(a);
            }
            return time(b) - time(a);
        });
    }

    function renderReviews() {
        const all = [$staticCard, ...savedReviews.map(reviewCard)];
        const shown = sortCards(all.filter(($c) => matchesFilter(Number($c.attr('data-rating')), $filter.val())), $sort.val());
        $list.children().detach();
        $list.append(...shown);

        if (shown.length === 0) {
            $stats.text('No reviews with this rating yet. Press Reset filters to see all of them.');
        } else {
            const average = averageRating(shown.map(($c) => Number($c.attr('data-rating'))));
            $stats.text('Showing ' + shown.length + ' of ' + all.length + ' review' + (all.length === 1 ? '' : 's') + ' on this page. Average rating: ' + average + ' / 5.');
        }
    }

    $filter.on('change', renderReviews);
    $sort.on('change', renderReviews);

    // ---------- the form ----------
    function checkField($field) {
        const value = String($field.val()).trim();
        switch ($field.attr('id')) {
            case 'review-name':
                return jqFieldState($field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
            case 'review-text':
                return jqFieldState($field, value.length >= 10 ? '' : 'Please write at least 10 characters.');
            default:
                return true;
        }
    }

    function checkRating() {
        const missing = $form.find('input[name="rating"]:checked').length === 0;
        $('#review-rating-error').toggleClass('d-block', missing);
        $form.find('input[name="rating"]').toggleClass('is-invalid', missing);
        return !missing;
    }

    jqDemoNote($('#review-success'), 'This is a demo: your review is not sent anywhere. It is kept only in this browser.');

    const $ratingRow = $('#review-rating-5').closest('.form-check').parent();
    $ratingRow.children('.form-check')
        .sort((x, y) => Number($(x).find('input').val()) - Number($(y).find('input').val()))
        .appendTo($ratingRow);

    // required stays in the HTML as the first line of defence; novalidate only hides the browser's bubbles.
    // A browser check never replaces the server: the visitor can bypass it, so the server must check again.
    $form.attr('novalidate', '');
    jqLiveValidate($form, checkField);
    $form.on('change', 'input[name="rating"]', checkRating);

    $form.on('submit', function (event) {
        event.preventDefault(); // without it the page reloads and the new card is lost
        const results = [checkField($('#review-name')), checkRating(), checkField($('#review-text'))];
        const ok = results.every(Boolean);
        jqReport($form, $('#review-error'), ok);
        if (!ok) {
            return;
        }
        savedReviews.push({
            id: String(Date.now()),
            name: $('#review-name').val().trim(),
            rating: Number($form.find('input[name="rating"]:checked').val()),
            text: $('#review-text').val().trim(),
            time: Date.now()
        });
        writeStorage(REVIEWS_KEY, savedReviews);
        $filter.val('all');
        $sort.val('new');
        renderReviews();
        $('#review-result-text').addClass('hidden');
        jqReveal($('#review-success'), 400);
        const $first = $list.find('.review-item:first');
        $first.hide().fadeIn(500);
        jqScrollTo($first);
        $form[0].reset();
    });

    $form.on('reset', function () {
        jqResetStates($form);
        $('#review-rating-error').removeClass('d-block');
        jqConceal($('#review-error'));
    });

    renderReviews();
});
