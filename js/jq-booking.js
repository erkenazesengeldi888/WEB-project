'use strict';

$(function () {
    const LAST_BOOKING = 60;
    const SLOT_STEP = 30;
    const $form = $('#booking-form');
    const $date = $('#booking-date');
    const $time = $('#booking-time');

    $date.attr('min', toDateInputValue(new Date()));

    const $slots = $('<div>', {
        id: 'booking-slots',
        'class': 'd-flex flex-wrap gap-1 mt-2',
        role: 'group',
        'aria-label': 'Available times'
    }).insertAfter('#booking-time-hint');

    function slotMessage(text) {
        $slots.empty().append($('<span>', { 'class': 'small text-muted', text: text }));
    }

    function renderSlots() {
        if ($date.val() === '') {
            slotMessage('Choose a date to see the times.');
            return;
        }
        const slots = buildTimeSlots(parseDateInput($date.val()), new Date(), SLOT_STEP, LAST_BOOKING);
        if (slots.length === 0) {
            slotMessage('No more times on this day. Please choose another date.');
            return;
        }
        $slots.empty();
        $.each(slots, function (index, slot) {
            $('<button>', {
                type: 'button',
                'class': 'btn btn-outline-primary btn-sm',
                text: slot,
                'data-time': slot,
                'aria-pressed': String(slot === $time.val())
            }).toggleClass('active', slot === $time.val()).appendTo($slots);
        });
    }

    $slots.on('click', 'button[data-time]', function () {
        const $button = $(this);
        $time.val($button.attr('data-time'));
        checkField($time);

        $button.addClass('active').attr('aria-pressed', 'true')
            .siblings().removeClass('active').attr('aria-pressed', 'false');
    });

    $date.on('change', renderSlots);
    $time.on('input', renderSlots);

    function checkField($field) {
        const value = String($field.val()).trim();
        switch ($field.attr('id')) {
            case 'booking-name':
                return jqFieldState($field, isValidName(value) ? '' : 'Please enter your name (at least 2 letters).');
            case 'booking-email':
                return jqFieldState($field, isValidEmail(value) ? '' : 'Please enter a valid e-mail address, for example name@mail.com.');
            case 'booking-phone':
                return jqFieldState($field, phoneError(value));
            case 'booking-guests': {
                const guests = Number(value);
                if (value === '' || !Number.isInteger(guests) || guests < 1 || guests > 10) {
                    return jqFieldState($field, 'Please enter a whole number from 1 to 10. For more guests, please call us.');
                }
                return jqFieldState($field, '');
            }
            case 'booking-date': {
                if (value === '') {
                    return jqFieldState($field, 'Please choose a date of visit.');
                }
                if (value < toDateInputValue(new Date())) {
                    return jqFieldState($field, 'This date has already passed. Please choose today or a later day.');
                }
                return jqFieldState($field, '');
            }
            case 'booking-time': {
                if (value === '') {
                    return jqFieldState($field, 'Please choose a time of visit.');
                }
                if ($date.val() === '') {
                    return jqFieldState($field, '');
                }
                const date = parseDateInput($date.val());
                const hours = getHours(date);
                const latestMinutes = toMinutes(hours.close) - LAST_BOOKING;
                if (!isTimeWithinHours(value, date, LAST_BOOKING)) {
                    return jqFieldState($field, 'On this day tables are booked between ' + hours.open + ' and ' + pad(Math.floor(latestMinutes / 60)) + ':' + pad(latestMinutes % 60) + '.');
                }
                const now = new Date();
                if (toDateInputValue(date) === toDateInputValue(now) && toMinutes(value) < toMinutes(toTimeString(now)) + 30) {
                    return jqFieldState($field, 'Please choose a time at least 30 minutes from now.');
                }
                return jqFieldState($field, '');
            }
            case 'booking-consent':

                return jqFieldState($field, $field.prop('checked') ? '' : 'Please agree so that we can call you to confirm.');
            default:
                return true;
        }
    }

    function validateBooking() {
        let ok = true;
        $('#booking-name, #booking-email, #booking-phone, #booking-guests, #booking-date, #booking-time, #booking-consent').each(function () {
            if (!checkField($(this))) {
                ok = false;
            }
        });
        return ok;
    }

    function formatDate(value) {
        return parseDateInput(value).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    jqDemoNote($('#booking-success'), 'This is a demo: your data is not sent anywhere and no table is really reserved.');

    $form.attr('novalidate', '');
    jqLiveValidate($form, checkField);
    $date.on('change', function () {
        if ($time.val() !== '') {
            checkField($time);
        }
    });

    $form.on('submit', function (event) {

        event.preventDefault();
        const ok = validateBooking();
        jqReport($form, $('#booking-error'), ok);
        if (!ok) {
            return;
        }
        const guests = Number($('#booking-guests').val());
        $('#summary-name').text($('#booking-name').val().trim());
        $('#summary-guests').text(guests + (guests === 1 ? ' guest' : ' guests'));
        $('#summary-date').text(formatDate($date.val()));
        $('#summary-time').text($time.val());
        $('#summary-phone').text($('#booking-phone').val().trim());
        $('#booking-result-text').addClass('hidden');
        jqReveal($('#booking-success'), 400);
        jqScrollTo($('#booking-result'));
        $form[0].reset();
    });

    $form.on('reset', function () {
        jqResetStates($form);
        jqConceal($('#booking-error'));
        setTimeout(function () {
            $('#booking-guests').val('');
            renderSlots();
        }, 0);
    });

    $('#booking-phone').attr('inputmode', 'tel').val('');
    $('#booking-guests').val('');

    renderSlots();
});

