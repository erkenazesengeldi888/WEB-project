'use strict';

/* Data and pure helper functions (Assignment 4). No DOM here, so every function can be tested in the console. */

// Opening hours of the Syganak 24 branch: weekdays 07:30-23:00, weekends 08:00-23:00
const HOURS = {
    weekday: { open: '07:30', close: '23:00' },
    weekend: { open: '08:00', close: '23:00' }
};

// Coffee drinks from the Menu page: prices are for the size shown in "size"
const DRINKS = [
    { name: 'Espresso', category: 'coffee', size: '250 ml', price: 690, milk: false },
    { name: 'Americano', category: 'coffee', size: '250 ml', price: 890, milk: false, freeMilk: true },
    { name: 'Cappuccino', category: 'coffee', size: '250 ml', price: 1090, milk: true },
    { name: 'Latte', category: 'coffee', size: '350 ml', price: 1190, milk: true },
    { name: 'Flat white', category: 'coffee', size: '250 ml', price: 1190, milk: true },
    { name: 'Raf', category: 'coffee', size: '350 ml', price: 1290, milk: true }
];

const pad = (n) => String(n).padStart(2, '0');

// 1290 -> "1 290 ₸" (with non-breaking spaces so the price never wraps)
function formatPrice(amount) {
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
}

// "07:30" -> 450 (minutes since midnight)
function toMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// A Date -> "14:05"
function toTimeString(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

// "2026-10-24" -> a local Date (new Date('2026-10-24') would be UTC and can shift the day)
function parseDateInput(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function toDateInputValue(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

// Opening hours for a given day
function getHours(date) {
    const day = date.getDay();
    return day === 0 || day === 6 ? HOURS.weekend : HOURS.weekday;
}

// Is the shop open at this moment? Returns { open, text }
function getOpenStatus(now) {
    const hours = getHours(now);
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes >= toMinutes(hours.open) && minutes < toMinutes(hours.close)) {
        return { open: true, text: 'Open now · until ' + hours.close };
    }
    if (minutes < toMinutes(hours.open)) {
        return { open: false, text: 'Closed · opens today at ' + hours.open };
    }
    const next = getHours(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    return { open: false, text: 'Closed · opens tomorrow at ' + next.open };
}

// Is a time inside the opening hours of that day? lastBeforeClose keeps a margin before closing time.
function isTimeWithinHours(time, date, lastBeforeClose) {
    const hours = getHours(date);
    const minutes = toMinutes(time);
    return minutes >= toMinutes(hours.open) && minutes <= toMinutes(hours.close) - lastBeforeClose;
}

// Time slots for a booking: every "step" minutes, skipping the past when the date is today
function buildTimeSlots(date, now, step, lastBeforeClose) {
    const hours = getHours(date);
    const slots = [];
    const isToday = toDateInputValue(date) === toDateInputValue(now);
    const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;
    for (let m = toMinutes(hours.open); m <= toMinutes(hours.close) - lastBeforeClose; m += step) {
        if (m >= earliest) {
            slots.push(pad(Math.floor(m / 60)) + ':' + pad(m % 60));
        }
    }
    return slots;
}

// A temporary order number such as ED-4821. It is only a reference for this page, not an id from a server.
function generateOrderNumber() {
    return 'ED-' + (1000 + Math.floor(Math.random() * 9000));
}

function calcTotal(items) {
    let total = 0;
    for (const item of items) {
        total += item.qty * item.price;
    }
    return total;
}

// Random element of a list (used by "Surprise me")
function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// Drinks whose name contains the term; category "all" means every category
function searchDrinks(list, term, category) {
    const query = term.trim().toLowerCase();
    return list.filter((d) => (category === 'all' || d.category === category) && (query === '' || d.name.toLowerCase().includes(query)));
}

function isValidName(value) {
    return value.trim().length >= 2;
}

// Kazakhstan numbers: 10 digits, or 11 starting with 7 or 8 (+7 771 419 84 57)
function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && (digits[0] === '7' || digits[0] === '8'));
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

// Average rating of a list of reviews, one decimal; 0 for an empty list
function averageRating(ratings) {
    if (ratings.length === 0) {
        return 0;
    }
    return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
}

// Extras from the Coffee page: price in tenge
const EXTRAS = { milk: 450, decaf: 290, syrup: 190, shot: 290 };
const MILK_TYPES = ['Coconut', 'Oat', 'Banana', 'Lactose-free', 'Almond'];
const SYRUPS = ['Caramel', 'Salted Caramel', 'Vanilla', 'Coconut', 'Chocolate', 'Macadamia', 'Hazelnut', 'Irish Cream', 'Popcorn'];
// Free additions, 0 tenge
const FREE_EXTRAS = ['Cinnamon', 'Sugar', 'Sweetener'];

// Cost of the extras alone. The alternative milk only counts for a drink that has milk.
function calcExtras(options, hasMilk) {
    let price = options.syrups.length * EXTRAS.syrup;
    if (options.milk && hasMilk) {
        price += EXTRAS.milk;
    }
    if (options.decaf) {
        price += EXTRAS.decaf;
    }
    if (options.shot) {
        price += EXTRAS.shot;
    }
    return price;
}

// Price of one cup with the chosen extras
function calcDrinkPrice(drink, options) {
    return drink.price + calcExtras(options, drink.milk);
}

// Name for the cart: "Latte (oat milk, extra shot)". The cart keeps one line per name + size.
function extrasName(baseName, options) {
    const parts = [];
    if (options.milk) {
        parts.push(options.milkType.toLowerCase() + ' milk');
    }
    if (options.shot) {
        parts.push('extra shot');
    }
    if (options.decaf) {
        parts.push('decaf');
    }
    options.syrups.forEach((name) => parts.push(name.toLowerCase() + ' syrup'));
    if (options.freeMilk) {
        parts.push('milk');
    }
    options.free.forEach((name) => parts.push(name.toLowerCase()));
    return parts.length ? baseName + ' (' + parts.join(', ') + ')' : baseName;
}

// Drinks that fit the visitor's wish: milk is 'any', 'yes' or 'no'; maxPrice 0 means no limit
function pickDrinks(list, milk, maxPrice) {
    return list.filter((d) => (milk === 'any' || d.milk === (milk === 'yes')) && (maxPrice === 0 || d.price <= maxPrice));
}
