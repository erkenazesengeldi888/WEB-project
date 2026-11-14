'use strict';

function createExtrasPicker(prefix) {
    const element = makeEl('div', 'extras-picker');
    const listeners = [];

    function section(title, hint) {
        const box = makeEl('fieldset', 'extras-section');
        box.append(makeEl('legend', 'extras-title', title));
        if (hint) {
            box.append(makeEl('p', 'extras-hint', hint));
        }
        return box;
    }

    function chip(parent, id, text, value) {
        const wrap = makeEl('span', 'extra-chip');
        const input = makeEl('input', 'btn-check');
        input.type = 'checkbox';
        input.id = prefix + id;
        input.value = value || '';
        input.autocomplete = 'off';
        const label = makeEl('label', 'btn btn-outline-primary', text);
        label.htmlFor = input.id;
        wrap.append(input, label);
        parent.append(wrap);
        return input;
    }

    function option(parent, id, title, price, note) {
        const row = makeEl('div', 'extra-option');
        const wrap = makeEl('div', 'form-check form-switch');
        const input = makeEl('input', 'form-check-input');
        input.type = 'checkbox';
        input.role = 'switch';
        input.id = prefix + id;
        const label = makeEl('label', 'form-check-label', title);
        label.htmlFor = input.id;
        wrap.append(input, label);
        row.append(wrap, makeEl('span', 'badge text-bg-primary', '+' + formatPrice(price)));
        if (note) {
            row.append(makeEl('small', 'text-muted w-100', note));
        }
        parent.append(row);
        return { input, row };
    }

    const syrupBox = section('Syrups \u00b7 +' + formatPrice(EXTRAS.syrup) + ' each', 'Choose as many as you like.');
    const syrupChips = makeEl('div', 'extra-chips');
    const syrupBoxes = SYRUPS.map((name) => chip(syrupChips, 'syrup-' + name.toLowerCase().replace(/\s+/g, '-'), name, name));
    syrupBox.append(syrupChips);

    const optionsBox = section('Make it yours');
    const milkOption = option(optionsBox, 'milk', 'Plant-based or lactose-free milk', EXTRAS.milk);
    const milk = milkOption.input;
    const milkType = makeEl('select', 'form-select form-select-sm hidden');
    milkType.id = prefix + 'milk-type';
    milkType.setAttribute('aria-label', 'Kind of milk');
    MILK_TYPES.forEach((name) => {
        const item = makeEl('option', '', name);
        item.value = name;
        milkType.append(item);
    });
    const milkHint = makeEl('div', 'form-text hidden', 'This drink has no milk, so this option is off.');
    milkOption.row.append(milkType, milkHint);
    const shot = option(optionsBox, 'shot', 'Extra shot of espresso', EXTRAS.shot, 'Stronger and richer.').input;
    const decaf = option(optionsBox, 'decaf', 'Decaf', EXTRAS.decaf, 'Same taste, without the caffeine.').input;

    const freeBox = section('Free additions');
    const freeChips = makeEl('div', 'extra-chips');
    const freeMilk = chip(freeChips, 'free-milk', 'Add milk', '');
    const freeMilkRow = freeMilk.closest('.extra-chip');
    const freeBoxes = FREE_EXTRAS.map((name) => chip(freeChips, 'free-' + name.toLowerCase(), name, name));
    freeBox.append(freeChips);

    element.append(syrupBox, optionsBox, freeBox);

    const all = [...syrupBoxes, milk, shot, decaf, freeMilk, ...freeBoxes];
    const changed = () => listeners.forEach((fn) => fn());
    element.addEventListener('change', () => {
        milkType.classList.toggle('hidden', !milk.checked);
        changed();
    });

    return {
        element,
        options: () => ({
            milk: milk.checked,
            milkType: milkType.value,
            shot: shot.checked,
            decaf: decaf.checked,
            syrups: syrupBoxes.filter((b) => b.checked).map((b) => b.value),
            freeMilk: freeMilk.checked,
            free: freeBoxes.filter((b) => b.checked).map((b) => b.value)
        }),

        setTraits(traits) {
            milk.disabled = !traits.milk;
            if (!traits.milk) {
                milk.checked = false;
            }
            milkHint.classList.toggle('hidden', traits.milk);
            milkType.classList.toggle('hidden', !milk.checked);
            freeMilkRow.classList.toggle('hidden', !traits.freeMilk);
            if (!traits.freeMilk) {
                freeMilk.checked = false;
            }
        },
        reset() {
            all.forEach((b) => { b.checked = false; });
            milkType.selectedIndex = 0;
            milkType.classList.add('hidden');
        },
        onChange: (fn) => listeners.push(fn)
    };
}
