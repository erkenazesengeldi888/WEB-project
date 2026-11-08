'use strict';

/* The "extras" picker used on the Coffee page and in the drink window on the Menu page:
   alternative milk (with the kind), extra shot, decaf, several syrups, and free additions (0 tenge). */

function createExtrasPicker(prefix) {
    const element = makeEl('div', 'extras-picker');
    const listeners = [];

    function check(parent, id, text, value) {
        const wrap = makeEl('div', 'form-check');
        const input = makeEl('input', 'form-check-input');
        input.type = 'checkbox';
        input.id = prefix + id;
        input.value = value || '';
        const label = makeEl('label', 'form-check-label', text);
        label.htmlFor = input.id;
        wrap.append(input, label);
        parent.append(wrap);
        return input;
    }

    // syrups: any number, each adds its price
    const syrupBox = makeEl('fieldset', 'mb-3');
    syrupBox.append(makeEl('legend', 'form-label fs-6', 'Syrups (+' + formatPrice(EXTRAS.syrup) + ' each, choose as many as you like)'));
    const grid = makeEl('div', 'row row-cols-2 row-cols-md-3 g-1');
    const syrupBoxes = SYRUPS.map((name) => {
        const col = makeEl('div', 'col');
        const box = check(col, 'syrup-' + name.toLowerCase().replace(/\s+/g, '-'), name, name);
        grid.append(col);
        return box;
    });
    syrupBox.append(grid);

    const checks = makeEl('div', '');
    const milk = check(checks, 'milk', 'Plant-based or lactose-free milk (+' + formatPrice(EXTRAS.milk) + ')');
    const milkType = makeEl('select', 'form-select form-select-sm mt-1 mb-1 hidden');
    milkType.id = prefix + 'milk-type';
    milkType.setAttribute('aria-label', 'Kind of milk');
    MILK_TYPES.forEach((name) => {
        const option = makeEl('option', '', name);
        option.value = name;
        milkType.append(option);
    });
    checks.append(milkType);
    const milkHint = makeEl('div', 'form-text hidden', 'This drink has no milk, so this option is off.');
    checks.append(milkHint);
    const shot = check(checks, 'shot', 'Extra shot of espresso (+' + formatPrice(EXTRAS.shot) + ')');
    const decaf = check(checks, 'decaf', 'Decaf (+' + formatPrice(EXTRAS.decaf) + ')');
    const freeMilk = check(checks, 'free-milk', 'Add milk (free, 0 \u20b8)');
    const freeMilkRow = freeMilk.closest('.form-check');
    const freeBoxes = FREE_EXTRAS.map((name) => check(checks, 'free-' + name.toLowerCase(), name + ' (free, 0 \u20b8)', name));

    element.append(syrupBox, checks);

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
        // what the chosen drink allows: milk = it has milk, freeMilk = it can get a little milk for free (Americano)
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
