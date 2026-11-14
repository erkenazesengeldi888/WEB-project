'use strict';

const REVIEWS_KEY = 'espressoday-reviews';
const TITLES = ['', 'A poor experience', 'Could be better', 'A good visit', 'A very good visit', 'An excellent visit'];
const MAX_PHOTO_SIDE = 700;
const MAX_PHOTO_FILE = 10 * 1024 * 1024;
const MIN_CHARS = 10;
const MAX_CHARS = 1000;
const MAX_PHOTOS = 5;
const PAGE_SIZE = 3;

const SEED_REVIEWS = [
    {
        id: 'seed-ekaterina',
        seed: true,
        source: '2GIS',
        name: 'Екатерина',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 9, 29).getTime(),
        text: 'Моя любимая кофейня) каждое утро захожу за кофе, прекрасно готовят, учитывают все рекомендации))) а еще у них очень вкусные сырники и блинчики)))'
    },
    {
        id: 'seed-nqz',
        seed: true,
        source: '2GIS',
        name: 'NQZ 01',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 9, 14).getTime(),
        text: 'Очень вежливый персонал!'
    },
    {
        id: 'seed-symbat',
        seed: true,
        source: '2GIS',
        name: 'Symbat Serik',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 9, 4).getTime(),
        text: 'Очень уютная кофейня ☕️🤎 Приятная атмосфера, вкусный кофе и вежливый персонал. Обслуживание быстрое, всё очень понравилось. Обязательно приду ещё! ✨'
    },
    {
        id: 'seed-amir',
        seed: true,
        source: '2GIS',
        name: 'Амир Астана',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 8, 2, 12).getTime(),
        text: 'Одна из лучших кофеен в городе, есть чем сравнить, а самое главное очень вкусный кофе и хороший сервис!'
    },
    {
        id: 'seed-gk',
        seed: true,
        source: '2GIS',
        name: 'GK',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 8, 2, 10).getTime(),
        text: 'Вчера был в этой новой точке, был приятно удивлен! Отличный ремонт, идеальный интерьер, очень уютно! Персонал очень вежливый, готовят отличный кофе! Будем приходить👍'
    },
    {
        id: 'seed-mv',
        seed: true,
        source: '2GIS',
        name: 'Mv',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 7, 27).getTime(),
        text: 'Очень уютная кофейня Espresso Day! Здесь очень вкусный кофе и внимательный персонал! Это место, куда хочется возвращаться снова и снова за чашечкой бодрящего и ароматного кофе!'
    },
    {
        id: 'seed-bs',
        seed: true,
        source: '2GIS',
        name: 'B. S.',
        rating: 5,
        lang: 'kk',
        time: new Date(2026, 7, 29).getTime(),
        text: 'осы жк да ашылғанына қуаныштымын,енді кофе үшін коляскамен алысқа бармаймын😂🤪🥰'
    },
    {
        id: 'seed-aigerim',
        seed: true,
        source: '2GIS',
        name: 'Aigerim Mukazhanova',
        rating: 5,
        lang: 'ru',
        time: new Date(2026, 9, 29, 12).getTime(),
        text: 'Люблю эту кофейню, в любом филиале нравится обстановка. Всегда тепло уютно. Но здесь еще и на баре приятные милые ребята 😌🫶'
    },
    {
        id: 'seed-mk',
        seed: true,
        source: '2GIS',
        name: 'М К',
        rating: 1,
        lang: 'ru',
        time: new Date(2026, 9, 18).getTime(),
        text: 'Кофе очень слабый и пресный, при том что мне делали покрепче'
    }
];

$(function () {
    const $form = $('#review-form');
    const $list = $('#review-list');
    let savedReviews = readStorage(REVIEWS_KEY, []);
    let visibleCount = PAGE_SIZE;
    let editingId = null;
    let deleteId = null;

    const STAR_ON = 'text-warning';
    const STAR_OFF = 'text-body-tertiary';

    function ratingStars(rating) {
        const $row = $('<span>', { 'class': 'd-inline-flex align-items-center', role: 'img', 'aria-label': 'Rating: ' + rating + ' out of 5' });
        for (let i = 1; i <= 5; i++) {
            $('<span>', { 'class': 'fs-5 lh-1 ' + (i <= rating ? STAR_ON : STAR_OFF), 'aria-hidden': 'true', text: '★' }).appendTo($row);
        }
        return $row.append($('<span>', { 'class': 'small text-muted ms-2', text: rating + ' / 5' }));
    }

    function starPicker(initial, onPick) {
        let value = initial;
        const $row = $('<div>', { 'class': 'd-flex align-items-center gap-1', role: 'radiogroup', 'aria-label': 'Your rating' });
        const $buttons = [1, 2, 3, 4, 5].map(function (n) {
            return $('<button>', {
                type: 'button',
                'class': 'btn btn-link p-0 fs-2 lh-1 text-decoration-none star-button',
                'data-value': n,
                role: 'radio',
                'aria-label': n + (n === 1 ? ' star' : ' stars'),
                text: '★'
            }).appendTo($row);
        });
        const $label = $('<span>', { 'class': 'small text-muted ms-2' }).appendTo($row);

        function paint(upTo) {
            $buttons.forEach(function ($button, index) {
                $button.toggleClass(STAR_ON, index < upTo).toggleClass(STAR_OFF, index >= upTo).attr('aria-checked', String(value === index + 1));
            });
            $label.text(upTo === 0 ? 'Choose a rating' : upTo + ' / 5');
        }

        $row.on('mouseover', '.star-button', function () {
            paint(Number($(this).attr('data-value')));
        }).on('mouseleave', function () {
            paint(value);
        }).on('click', '.star-button', function () {
            value = Number($(this).attr('data-value'));
            paint(value);
            if (onPick) {
                onPick(value);
            }
        });

        paint(value);
        return { $el: $row, get: () => value, set: function (n) { value = n; paint(value); } };
    }

    function saveReviews() {
        try {
            localStorage.setItem(REVIEWS_KEY, JSON.stringify(savedReviews));
            return true;
        } catch (error) {
            return false;
        }
    }

    function readPhoto(file) {
        return new Promise(function (resolve, reject) {
            if (!file.type.startsWith('image/')) {
                reject(new Error('Please choose an image file (JPG, PNG or WebP).'));
                return;
            }
            if (file.size > MAX_PHOTO_FILE) {
                reject(new Error('The file is too big (10 MB at most).'));
                return;
            }
            const reader = new FileReader();
            reader.onerror = () => reject(new Error('The file could not be read.'));
            reader.onload = function () {
                const image = new Image();
                image.onerror = () => reject(new Error('This image could not be opened.'));
                image.onload = function () {
                    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(image.width, image.height));
                    const canvas = $('<canvas>')[0];
                    canvas.width = Math.round(image.width * scale);
                    canvas.height = Math.round(image.height * scale);
                    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                image.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    function photoPicker(id, initial) {
        const photos = initial ? [...initial] : [];
        const $input = $('<input>', { type: 'file', id: id, 'class': 'form-control', accept: 'image/*', multiple: true });
        const $error = $('<div>', { 'class': 'invalid-feedback', id: id + '-error' });
        const $thumbs = $('<div>', { 'class': 'd-flex flex-wrap gap-3 mt-2' });
        const $el = $('<div>', { 'class': 'mb-3' }).append(
            $('<label>', { 'class': 'form-label', 'for': id, text: 'Photos (optional, up to ' + MAX_PHOTOS + ')' }),
            $input, $error,
            $('<div>', { 'class': 'form-text', text: 'JPG, PNG or WebP. You can choose several files at once, up to ' + MAX_PHOTOS + ' photos in total.' }),
            $thumbs
        );

        function show() {
            $thumbs.empty();
            photos.forEach(function (src, index) {
                $('<div>', { 'class': 'text-center' }).append(
                    $('<img>', { 'class': 'img-thumbnail d-block mb-1', src: src, alt: 'Chosen photo ' + (index + 1), width: 100 }),
                    $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary btn-sm photo-remove', 'data-index': index, text: 'Remove' })
                ).appendTo($thumbs);
            });
            $('<p>', { 'class': 'small text-muted w-100 mb-0', text: photos.length + ' of ' + MAX_PHOTOS + ' photos' }).toggleClass('hidden', photos.length === 0).appendTo($thumbs);
        }

        function note(message) {
            if (message) {
                jqFieldState($input, message);
            } else {
                $input.removeClass('is-invalid is-valid').removeAttr('aria-invalid');
            }
        }

        $input.on('change', function () {
            const files = Array.from(this.files);
            const room = MAX_PHOTOS - photos.length;
            $input.val('');
            if (files.length === 0) {
                return;
            }
            if (room === 0) {
                note('You already have ' + MAX_PHOTOS + ' photos. Remove one to add another.');
                return;
            }

            Promise.all(files.slice(0, room).map((file) => readPhoto(file).then((data) => ({ data: data }), (error) => ({ error: error })))).then(function (results) {
                let message = files.length > room ? 'Only ' + MAX_PHOTOS + ' photos are allowed. The extra files were skipped.' : '';
                results.forEach(function (result) {
                    if (result.data) {
                        photos.push(result.data);
                    } else if (!message) {
                        message = result.error.message;
                    }
                });
                note(message);
                show();
            });
        });

        $thumbs.on('click', '.photo-remove', function () {
            photos.splice(Number($(this).attr('data-index')), 1);
            note('');
            show();
        });

        show();
        return {
            $el: $el,
            $input: $input,
            get: () => [...photos],
            reset: function () {
                photos.length = 0;
                $input.val('').removeClass('is-invalid is-valid');
                show();
            }
        };
    }

    const photosOf = (review) => review.photos || (review.photo ? [review.photo] : []);

    function cardShell(review, $body) {
        return $('<div>', {
            'class': 'card shadow-sm review-item',
            'data-rating': review.rating,
            'data-time': review.time,
            'data-id': review.id
        }).append($body);
    }

    function cardFooter(review) {
        const $badge = ratingStars(review.rating);
        const $footer = $('<div>', { 'class': 'd-flex justify-content-between align-items-center flex-wrap gap-2' }).append($badge);
        if (review.seed) {
            return $footer.append($('<span>', { 'class': 'small text-muted', text: 'Source: ' + review.source }));
        }
        return $('<div>').append($footer.append($('<div>', { 'class': 'd-flex gap-2' }).append(
            $('<button>', { type: 'button', 'class': 'btn btn-outline-primary btn-sm review-edit', text: 'Edit' }),
            $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary btn-sm review-delete', text: 'Delete' })
        )), $('<p>', { 'class': 'small text-muted mb-0 mt-2', text: 'Source: review from this site' }));
    }

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
        if (review.lang) {
            $quote.attr('lang', review.lang);
        }
        const $body = $('<div>', { 'class': 'card-body' }).append($('<h3>', { 'class': 'h5', text: TITLES[review.rating] }), $meta, $quote);
        const photos = photosOf(review);
        if (photos.length > 0) {
            const $gallery = $('<div>', { 'class': 'row g-2 mb-3' });
            photos.forEach(function (src, index) {
                $('<div>', { 'class': photos.length === 1 ? 'col-12' : 'col-6 col-md-4' })
                    .append($('<img>', { 'class': 'img-fluid rounded review-photo', src: src, alt: 'Photo ' + (index + 1) + ' added by ' + review.name }))
                    .appendTo($gallery);
            });
            $body.append($gallery);
        }
        $body.append(cardFooter(review));
        return cardShell(review, $body);
    }

    function editCard(review) {
        const $name = $('<input>', { type: 'text', id: 'edit-name', 'class': 'form-control', autocomplete: 'name' }).val(review.name);
        $name.on('input', function () {
            $(this).val($(this).val().replace(/[^\p{L} ]/gu, ''));
        });
        const rating = starPicker(review.rating);
        const $text = $('<textarea>', { id: 'edit-text', 'class': 'form-control', rows: 4, maxlength: MAX_CHARS }).val(review.text);
        const picker = photoPicker('edit-photo', photosOf(review));

        function group(label, id, $control) {
            return $('<div>', { 'class': 'mb-3' }).append(
                $('<label>', { 'class': 'form-label', 'for': id, text: label }),
                $control,
                $('<div>', { 'class': 'invalid-feedback', id: id + '-error' })
            );
        }

        const $editForm = $('<form>', { 'class': 'review-edit-form', novalidate: '' }).append(
            group('Your name', 'edit-name', $name),
            $('<div>', { 'class': 'mb-3' }).append($('<div>', { 'class': 'form-label', text: 'Your rating' }), rating.$el),
            group('Your review', 'edit-text', $text),
            picker.$el,
            $('<div>', { 'class': 'd-flex gap-2' }).append(
                $('<button>', { type: 'submit', 'class': 'btn btn-primary btn-sm', text: 'Save changes' }),
                $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary btn-sm review-edit-cancel', text: 'Cancel' })
            )
        );
        $editForm.data('picker', picker).data('rating', rating);
        jqLiveValidate($editForm, checkField);
        return cardShell(review, $('<div>', { 'class': 'card-body' }).append($('<h3>', { 'class': 'h5', text: 'Edit your review' }), $editForm));
    }

    const idOf = (element) => String($(element).closest('.review-item').attr('data-id'));
    const findSaved = (id) => savedReviews.find((r) => r.id === id);

    $list.on('click', '.review-edit', function () {
        editingId = idOf(this);
        renderReviews();
        $('#edit-name').trigger('focus');
    });

    $list.on('click', '.review-edit-cancel', function () {
        editingId = null;
        renderReviews();
    });

    const $modal = $('<div>', { 'class': 'modal fade', id: 'review-delete-modal', tabindex: '-1', 'aria-labelledby': 'review-delete-title', 'aria-hidden': 'true' }).append(
        $('<div>', { 'class': 'modal-dialog modal-dialog-centered' }).append(
            $('<div>', { 'class': 'modal-content' }).append(
                $('<div>', { 'class': 'modal-header' }).append(
                    $('<h2>', { 'class': 'modal-title h5', id: 'review-delete-title', text: 'Delete review?' }),
                    $('<button>', { type: 'button', 'class': 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
                ),
                $('<div>', { 'class': 'modal-body', text: 'Are you sure you want to delete your review? This cannot be undone.' }),
                $('<div>', { 'class': 'modal-footer' }).append(
                    $('<button>', { type: 'button', 'class': 'btn btn-outline-secondary', 'data-bs-dismiss': 'modal', text: 'No' }),
                    $('<button>', { type: 'button', 'class': 'btn btn-danger', id: 'review-delete-confirm', text: 'Yes, delete' })
                )
            )
        )
    ).appendTo('body');
    const deleteModal = bootstrap.Modal.getOrCreateInstance($modal[0]);

    $list.on('click', '.review-delete', function () {
        deleteId = idOf(this);
        editingId = null;
        renderReviews();
        deleteModal.show();
    });

    $('#review-delete-confirm').on('click', function () {
        const id = deleteId;
        deleteModal.hide();
        deleteId = null;

        $list.find('[data-id="' + id + '"]').fadeOut(300, function () {
            savedReviews = savedReviews.filter((r) => r.id !== id);
            saveReviews();
            renderReviews();
        });
    });

    $list.on('submit', '.review-edit-form', function (event) {
        event.preventDefault();
        const $editForm = $(this);
        const review = findSaved(idOf(this));
        const ok = [checkField($('#edit-name')), checkField($('#edit-text'))].every(Boolean);
        if (!ok) {
            $editForm.find('.is-invalid:first').trigger('focus');
            return;
        }
        const before = Object.assign({}, review);
        review.name = $('#edit-name').val().trim();
        review.rating = $editForm.data('rating').get();
        review.text = $('#edit-text').val().trim();
        const photos = $editForm.data('picker').get();
        delete review.photo;
        if (photos.length > 0) {
            review.photos = photos;
        } else {
            delete review.photos;
        }
        if (!saveReviews()) {
            Object.assign(review, before);
            jqFieldState($('#edit-photo'), 'Not enough space in the browser to keep these photos. Remove some or choose smaller ones.');
            return;
        }
        editingId = null;
        renderReviews();
        $list.find('[data-id="' + review.id + '"]').hide().fadeIn(400);
    });

    $('#manager-quote').closest('section')
        .addClass('align-self-start sticky-lg-top')
        .css('top', '1rem')
        .find('.card').removeClass('flex-grow-1');

    const $staticCard = $('#review-aruzhan');
    const staticRating = Number($staticCard.find('.badge').text().match(/(\d) \/ 5/)[1]);
    $staticCard.attr({
        'data-rating': staticRating,
        'data-time': new Date($staticCard.find('time').attr('datetime')).getTime()
    });
    $staticCard.find('.badge').replaceWith(ratingStars(staticRating));

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

    const $reset = $('<button>', { type: 'button', id: 'review-filter-reset', 'class': 'btn btn-outline-primary btn-sm', text: 'Reset filters' });
    const $toggle = $('<button>', {
        type: 'button',
        id: 'review-filter-toggle',
        'class': 'btn btn-outline-secondary btn-sm',
        'aria-expanded': 'true',
        'aria-controls': 'review-controls',
        text: 'Hide filters'
    });
    const $stats = $('<p>', { id: 'review-stats', 'class': 'small mb-3', 'aria-live': 'polite' });
    const $buttons = $('<div>', { 'class': 'd-flex flex-wrap gap-2 mb-3' }).append($reset, $toggle);

    const $summary = $('<div>', { id: 'review-summary', 'class': 'card shadow-sm mb-3' });
    function renderSummary(all) {
        const ratings = all.map(($c) => Number($c.attr('data-rating')));
        const average = averageRating(ratings);
        const $left = $('<div>', { 'class': 'text-center' }).append(
            $('<div>', { 'class': 'display-5 fw-bold text-primary lh-1', text: String(average) }),
            ratingStars(Math.round(average)).addClass('justify-content-center d-flex'),
            $('<div>', { 'class': 'small text-muted', text: ratings.length + ' review' + (ratings.length === 1 ? '' : 's') })
        );
        const $right = $('<div>', { 'class': 'flex-grow-1' });
        [5, 4, 3, 2, 1].forEach(function (star) {
            const count = ratings.filter((r) => r === star).length;
            const share = ratings.length === 0 ? 0 : Math.round((count / ratings.length) * 100);
            $('<div>', { 'class': 'd-flex align-items-center gap-2 small' }).append(
                $('<span>', { 'class': 'text-nowrap', text: star + ' \u2605' }),
                $('<div>', { 'class': 'progress flex-grow-1', role: 'progressbar', 'aria-label': star + ' stars: ' + count, 'aria-valuenow': share, 'aria-valuemin': 0, 'aria-valuemax': 100 })
                    .css('height', '8px')
                    .append($('<div>', { 'class': 'progress-bar bg-warning' }).css('width', share + '%')),
                $('<span>', { 'class': 'text-muted text-end', text: String(count) }).css('min-width', '1.5rem')
            ).appendTo($right);
        });
        $summary.empty().append($('<div>', { 'class': 'card-body d-flex align-items-center gap-4' }).append($left, $right));
    }

    $('#rating-summary').after($summary, $buttons, $controls, $stats);

    $toggle.on('click', function () {
        $controls.slideToggle(250, function () {
            const open = $controls.is(':visible');
            $toggle.text(open ? 'Hide filters' : 'Show filters').attr('aria-expanded', String(open));
        });
    });

    $reset.on('click', function () {
        $filter.val('all');
        $sort.val('new');
        resetPage();
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

    const $more = $('<button>', { type: 'button', id: 'review-more', 'class': 'btn btn-outline-primary align-self-center mt-3 hidden' });
    $list.after($more);

    $more.on('click', function () {
        const allOpen = $more.data('allOpen');
        visibleCount = allOpen ? PAGE_SIZE : visibleCount + PAGE_SIZE;
        renderReviews();
        if (allOpen) {
            jqScrollTo($list);
        }
    });

    function renderReviews() {
        const cards = [...SEED_REVIEWS, ...savedReviews].map((review) => (review.id === editingId ? editCard(review) : reviewCard(review)));
        const all = [$staticCard, ...cards];
        renderSummary(all);
        const matching = sortCards(all.filter(($c) => matchesFilter(Number($c.attr('data-rating')), $filter.val())), $sort.val());
        const shown = matching.slice(0, visibleCount);
        $list.children().detach();
        $list.append(...shown);

        const left = matching.length - shown.length;
        const allOpen = left === 0 && matching.length > PAGE_SIZE;
        $more.data('allOpen', allOpen)
            .toggleClass('hidden', left === 0 && !allOpen)
            .text(allOpen ? 'Show fewer reviews' : 'Show more reviews (' + Math.min(left, PAGE_SIZE) + ' of ' + left + ' more)');

        if (matching.length === 0) {
            $stats.text('No reviews with this rating yet. Press Reset filters to see all of them.');
        } else {
            const average = averageRating(matching.map(($c) => Number($c.attr('data-rating'))));
            $stats.text('Showing ' + shown.length + ' of ' + matching.length + ' review' + (matching.length === 1 ? '' : 's') +
                (matching.length === all.length ? '' : ' (' + all.length + ' in total)') + '. Average rating: ' + average + ' / 5.');
        }
    }

    function resetPage() {
        visibleCount = PAGE_SIZE;
        renderReviews();
    }

    $filter.on('change', resetPage);
    $sort.on('change', resetPage);

    function checkField($field) {
        const value = String($field.val()).trim();
        switch ($field.attr('id')) {
            case 'review-name':
            case 'edit-name':
                return jqFieldState($field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
            case 'review-text':
            case 'edit-text':
                return jqFieldState($field, value.length >= MIN_CHARS && value.length <= MAX_CHARS ? '' : 'Please write between ' + MIN_CHARS + ' and ' + MAX_CHARS + ' characters.');
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

    const formStars = starPicker(0, function (value) {
        $('#review-rating-' + value).prop('checked', true).trigger('change');
    });
    $ratingRow.addClass('hidden').before(formStars.$el);

    const $text = $('#review-text');
    $text.attr('maxlength', MAX_CHARS);
    const $counter = $('<div>', { id: 'review-text-counter', 'class': 'form-text', 'aria-live': 'off' });
    $text.after($counter);

    const photo = photoPicker('review-photo');
    $counter.after(photo.$el.addClass('mt-3'));

    function updateCounter() {
        const length = $text.val().length;
        $counter.text(length + ' / ' + MAX_CHARS + ' characters' + (length < MIN_CHARS ? ' (minimum ' + MIN_CHARS + ')' : ''));
    }

    $text.on('input', updateCounter);
    updateCounter();

    $form.attr('novalidate', '');
    jqLiveValidate($form, checkField);
    $form.on('change', 'input[name="rating"]', checkRating);

    $form.on('submit', function (event) {
        event.preventDefault();
        const results = [checkField($('#review-name')), checkRating(), checkField($('#review-text'))];
        const ok = results.every(Boolean);
        jqReport($form, $('#review-error'), ok);
        if (!ok) {
            return;
        }
        const review = {
            id: String(Date.now()),
            name: $('#review-name').val().trim(),
            rating: Number($form.find('input[name="rating"]:checked').val()),
            text: $('#review-text').val().trim(),
            time: Date.now()
        };
        if (photo.get().length > 0) {
            review.photos = photo.get();
        }
        savedReviews.push(review);
        if (!saveReviews()) {
            savedReviews.pop();
            jqFieldState(photo.$input, 'Not enough space in the browser to keep these photos. Remove some or choose smaller ones.');
            return;
        }
        editingId = null;
        $filter.val('all');
        $sort.val('new');
        resetPage();
        $('#review-result-text').addClass('hidden');
        jqReveal($('#review-success'), 400);
        const $first = $list.find('.review-item:first');
        $first.hide().fadeIn(500);
        jqScrollTo($first);
        $form[0].reset();
    });

    $form.on('reset', function () {
        setTimeout(updateCounter, 0);
        photo.reset();
        formStars.set(0);
        jqResetStates($form);
        $('#review-rating-error').removeClass('d-block');
        jqConceal($('#review-error'));
    });

    renderReviews();
});
