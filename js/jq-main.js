'use strict';

function jqFieldState($field, message) {
    const bad = message !== '';
    $field
        .toggleClass('is-invalid error', bad)
        .toggleClass('is-valid', !bad)
        .attr('aria-invalid', bad ? 'true' : 'false');
    if (bad) {
        $('#' + $field.attr('id') + '-error').text(message);
    }
    return !bad;
}

function jqResetStates($form) {
    $form.find('.is-invalid, .is-valid, .error').removeClass('is-invalid is-valid error').removeAttr('aria-invalid');
}

function jqLiveValidate($form, check) {
    $form
        .on('focusout', 'input:not(:radio):not(:checkbox), textarea, select', function () {
            check($(this));
        })
        .on('input', '.is-invalid', function () {
            check($(this));
        })
        .on('change', 'input:checkbox, select', function () {
            check($(this));
        });
}

function jqReveal($el, duration) {
    if ($el.is(':visible') && !$el.hasClass('hidden')) {
        return $el;
    }
    return $el.stop(true, true).hide().removeClass('hidden').fadeIn(duration === undefined ? 300 : duration);
}

function jqConceal($el, duration) {
    if ($el.hasClass('hidden')) {
        return $el;
    }
    return $el.stop(true, true).fadeOut(duration === undefined ? 200 : duration, function () {
        $(this).addClass('hidden');
    });
}

function jqReport($form, $alert, ok) {
    if (ok) {
        jqConceal($alert);
        return;
    }
    jqReveal($alert);
    $form.find('.is-invalid:first').trigger('focus');
}

function jqDemoNote($success, text) {
    $('<p>', {
        'class': 'small mb-0 mt-2 fst-italic demo-note',
        text: text || 'This is a demo: your data is not sent anywhere and no real order or booking is made.'
    }).appendTo($success);
}

function jqScrollTo($el) {
    $('html, body').animate({ scrollTop: Math.max($el.offset().top - 120, 0) }, 400);
}
