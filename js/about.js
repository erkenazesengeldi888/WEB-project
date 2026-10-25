'use strict';
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

    $('faq-list').before(form, status, empty);

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

buildFaqSearch();
