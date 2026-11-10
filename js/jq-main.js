$(function () {
    'use strict';

    const SPEED = 300;

    /* ---------- 1. Cart notification ---------- */
    function notify(text) {
        $('.ed-toast').stop(true).remove();
        $('<div>', { class: 'ed-toast alert alert-success shadow position-fixed bottom-0 start-0 m-3 z-3 py-2', role: 'status' })
            .text(text)
            .hide()
            .appendTo('body')
            .fadeIn(200)
            .delay(2000)
            .fadeOut(400, function () {
                $(this).remove();
            });
    }

    $(document).on('edcart:added', function (event) {
        const detail = event.originalEvent.detail;
        notify('✓ ' + detail.name + ' is in your order (' + detail.count + ' in total)');
    });

    /* ---------- 2. Back to top ---------- */
    const $backToTop = $('a[href="#page-top"]').hide();

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 400) {
            $backToTop.stop(true, true).fadeIn(SPEED);
        } else {
            $backToTop.stop(true, true).fadeOut(SPEED);
        }
    });

    $backToTop.on('click', function (event) {
        event.preventDefault();
        $('html, body').stop().animate({ scrollTop: 0 }, 600);
    });

    /* ---------- 3. FAQ ---------- */
    const $faq = $('.accordion');

    $faq.find('.accordion-button').removeAttr('data-bs-toggle data-bs-target');
    $faq.find('.accordion-collapse').each(function () {
        const isOpen = $(this).hasClass('show');
        $(this).removeClass('collapse show').toggle(isOpen);
    });

    $faq.on('click', '.accordion-button', function () {
        const $item = $(this).closest('.accordion-item');
        const isOpen = $item.find('.accordion-collapse').is(':visible');

        $item.siblings('.accordion-item')
            .find('.accordion-collapse').stop(true, true).slideUp(SPEED)
            .end()
            .find('.accordion-button').addClass('collapsed').attr('aria-expanded', 'false');

        $(this)
            .toggleClass('collapsed', isOpen)
            .attr('aria-expanded', String(!isOpen))
            .closest('.accordion-item')
            .find('.accordion-collapse')
            .stop(true, true)
            .slideToggle(SPEED);
    });

    /* ---------- 4. Menu categories ---------- */
    const $categoryNav = $('nav[aria-label="Menu categories"]');
    const $categoryLinks = $categoryNav.find('a');

    function markCategory($link) {
        $link.addClass('active').attr('aria-current', 'true')
            .closest('li').siblings().find('a').removeClass('active').removeAttr('aria-current');
    }

    $categoryNav.on('click', 'a', function (event) {
        event.preventDefault();
        const $target = $($(this).attr('href'));

        const wasHidden = $target.is(':hidden');
        if (wasHidden) {
            $(this).closest('section').find('button[type="reset"]').trigger('click');
        }
        markCategory($(this));
        setTimeout(function () {
            $('html, body').stop().animate({ scrollTop: $target.offset().top - 16 }, 600, function () {
                $target.find('h2').first().fadeTo(150, 0.3).fadeTo(350, 1);
            });
        }, wasHidden ? 20 : 0);
    });

    if ($categoryLinks.length) {
        $(window).on('scroll', function () {
            const line = $(this).scrollTop() + 120;
            let $current = $();
            $categoryLinks.each(function () {
                const $section = $($(this).attr('href'));
                if ($section.is(':visible') && $section.offset().top <= line) {
                    $current = $(this);
                }
            });
            if ($current.length && !$current.hasClass('active')) {
                markCategory($current);
            }
        });
    }

    /* ---------- 5. Coffee varieties filter ---------- */
    const $varietyTable = $('caption:contains("coffee variety")').closest('table');

    if ($varietyTable.length) {
        const FILTERS = [
            { key: 'all', text: 'All coffees' },
            { key: 'milk', text: 'With milk or cream' },
            { key: 'black', text: 'Black coffee' },
            { key: 'iced', text: 'Served with ice' }
        ];
        const kindOf = function (text) {
            if (/\bice\b/i.test(text)) {
                return 'iced';
            }
            return /milk|cream/i.test(text) ? 'milk' : 'black';
        };

        const $bar = $('<div>', { class: 'd-flex flex-wrap gap-2 mb-3', role: 'group', 'aria-label': 'Filter coffee varieties' });
        $.each(FILTERS, function (i, filter) {
            $('<button>', { type: 'button', class: 'btn btn-sm btn-outline-primary', text: filter.text })
                .attr('data-filter', filter.key)
                .toggleClass('active', i === 0)
                .appendTo($bar);
        });
        const $count = $('<p>', { class: 'small text-muted mb-2', 'aria-live': 'polite' });
        $varietyTable.closest('.table-responsive').before($bar, $count);

        const $rows = $varietyTable.find('tbody tr');
        $rows.each(function () {
            $(this).attr('data-kind', kindOf($(this).find('td').text()));
        });

        const showCount = function (n) {
            $count.text('Showing ' + n + ' of ' + $rows.length + ' coffee varieties.');
        };
        showCount($rows.length);

        $bar.on('click', 'button', function () {
            const key = $(this).attr('data-filter');
            $(this).addClass('active').attr('aria-pressed', 'true')
                .siblings().removeClass('active').attr('aria-pressed', 'false');

            const $match = key === 'all' ? $rows : $rows.filter('[data-kind="' + key + '"]');
            $rows.not($match).stop(true, true).fadeOut(200);
            $match.stop(true, true).fadeIn(SPEED);
            showCount($match.length);
        });
    }
});
