'use strict';

/* About page: FAQ search. jQuery 3.7.1, loaded before this file, because $ must exist when this code runs.
   The plain-JavaScript original is in old-js-version.js (function 1). */

$(function () {
    // Function 1 of 3. $('<tag>', {...}).append() replaces createElement + properties + append; .each() + .toggleClass()
    // replace forEach + classList.toggle. A little shorter, the logic is the same.
    function buildFaqSearch() {
        const $items = $('#faq-list .accordion-item');

        const $input = $('<input>', {
            type: 'search',
            id: 'faq-search',
            autocomplete: 'off',
            'class': 'form-control',
            placeholder: 'for example: milk, work, open'
        });
        const $inputCol = $('<div>', { 'class': 'col-12 col-sm-8' }).append(
            $('<label>', { 'class': 'form-label', 'for': 'faq-search', text: 'Search the questions' }),
            $input
        );
        const $clear = $('<button>', { type: 'reset', 'class': 'btn btn-outline-primary w-100', text: 'Clear' });
        const $buttonCol = $('<div>', { 'class': 'col-12 col-sm-4 d-flex align-items-end' }).append($clear);
        const $form = $('<form>', { id: 'faq-search-form', 'class': 'row g-2 mb-3', role: 'search' }).append($inputCol, $buttonCol);

        const $status = $('<p>', { id: 'faq-status', 'class': 'small text-muted', 'aria-live': 'polite' });
        const $empty = $('<div>', {
            'class': 'alert alert-warning hidden',
            role: 'status',
            text: 'No question matches your search. Press Clear, or use the form below to ask us.'
        });
        $('#faq-list').before($form, $status, $empty);

        function matches($item, words) {
            const text = $item.text().toLowerCase();
            return words.every((word) => text.includes(word));
        }

        function update() {
            const words = $input.val().toLowerCase().split(/\s+/).filter((w) => w !== '');
            $items.each(function () {
                const $item = $(this);
                $item.toggleClass('hidden', !matches($item, words));
            });
            const found = $items.filter(':not(.hidden)').length;

            if (found === 0) {
                jqReveal($empty);
            } else {
                jqConceal($empty);
            }
            // .html() only for our own markup; typed text goes through .text()
            if (words.length === 0) {
                $status.text('Showing all ' + $items.length + ' questions.');
            } else {
                $status.html('Found <strong>' + found + '</strong> of ' + $items.length + ' questions.');
            }
        }

        $form.on('submit', function (event) {
            event.preventDefault(); // without it the page reloads and the search is lost
            update();
        });
        $input.on('input', update);
        $form.on('reset', function () {
            setTimeout(update, 0); // the field is emptied after the reset event
        });
        update();
    }

    buildFaqSearch();
});
