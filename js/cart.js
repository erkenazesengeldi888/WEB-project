'use strict';

const EDCart = (() => {
    const KEY = 'espressoday-cart';
    const MAX = 10;
    const listeners = [];

    const read = () => {
        try {
            const data = JSON.parse(localStorage.getItem(KEY));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    };

    let items = read();

    const changed = () => listeners.forEach((fn) => fn());

    const write = () => {
        try {
            localStorage.setItem(KEY, JSON.stringify(items));
        } catch (error) {
        }
        changed();
    };

    const find = (name, size) => items.find((c) => c.name === name && c.size === size);

    window.addEventListener('storage', (event) => {
        if (event.key === KEY) {
            items = read();
            changed();
        }
    });

    return {
        MAX,
        items: () => items,
        count: () => items.reduce((sum, c) => sum + c.qty, 0),
        total: () => calcTotal(items),
        qty(name, size) {
            const found = find(name, size);
            return found ? found.qty : 0;
        },
        add(name, size, price) {
            const found = find(name, size);
            if (found) {
                found.qty = Math.min(MAX, found.qty + 1);
            } else {
                items.push({ name, size, price, qty: 1 });
            }
            write();
        },
        setQty(name, size, price, qty) {
            const found = find(name, size);
            const safeQty = Math.max(0, Math.min(MAX, qty || 0));
            if (found && safeQty === 0) {
                items.splice(items.indexOf(found), 1);
            } else if (found) {
                found.qty = safeQty;
            } else if (safeQty > 0) {
                items.push({ name, size, price, qty: safeQty });
            }
            write();
        },
        replaceAll(newItems) {
            items = newItems.map((c) => ({ ...c }));
            write();
        },
        clear() {
            items = [];
            write();
        },
        onChange: (fn) => listeners.push(fn),
        format: (n) => formatPrice(n),
        label: (c) => c.name + (c.size ? ' · ' + c.size : '')
    };
})();
