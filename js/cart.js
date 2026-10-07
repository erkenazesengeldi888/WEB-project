/* One shared cart for the Menu and Order pages.
   Items live in the browser (localStorage), so both pages and several tabs see the same cart.
   An item is { name, size, price, qty }; name + size identify it. */
(function () {
    var KEY = 'espressoday-cart', MAX = 10, listeners = [], items = read();

    function read() {
        try {
            var data = JSON.parse(localStorage.getItem(KEY));
            return Array.isArray(data) ? data : [];
        } catch (e) { return []; }
    }
    function write() {
        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode: the cart still works on this page */ }
        changed();
    }
    function changed() { listeners.forEach(function (fn) { fn(); }); }
    function find(name, size) {
        return items.filter(function (c) { return c.name === name && c.size === size; })[0];
    }

    window.EDCart = {
        items: function () { return items; },
        count: function () { return items.reduce(function (s, c) { return s + c.qty; }, 0); },
        total: function () { return items.reduce(function (s, c) { return s + c.qty * c.price; }, 0); },
        qty: function (name, size) { var f = find(name, size); return f ? f.qty : 0; },
        add: function (name, size, price) {
            var f = find(name, size);
            if (f) { f.qty = Math.min(MAX, f.qty + 1); } else { items.push({ name: name, size: size, price: price, qty: 1 }); }
            write();
        },
        setQty: function (name, size, price, qty) {
            var f = find(name, size);
            qty = Math.max(0, Math.min(MAX, qty || 0));
            if (f && qty === 0) { items.splice(items.indexOf(f), 1); }
            else if (f) { f.qty = qty; }
            else if (qty > 0) { items.push({ name: name, size: size, price: price, qty: qty }); }
            write();
        },
        clear: function () { items = []; write(); },
        onChange: function (fn) { listeners.push(fn); },
        format: function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; },
        label: function (c) { return c.name + (c.size ? ' · ' + c.size : ''); },
        MAX: MAX
    };

    // The cart was changed on another page or tab
    window.addEventListener('storage', function (e) {
        if (e.key === KEY) { items = read(); changed(); }
    });
})();
