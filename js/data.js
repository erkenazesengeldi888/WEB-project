'use strict';

const HOURS = {
    weekday: { open: '07:30', close: '23:00' },
    weekend: { open: '08:00', close: '23:00' }
};

const DRINKS = [
    { name: 'Espresso', category: 'coffee', size: '250 ml', price: 690, milk: false },
    { name: 'Americano', category: 'coffee', size: '250 ml', price: 890, milk: false, freeMilk: true },
    { name: 'Cappuccino', category: 'coffee', size: '250 ml', price: 1090, milk: true },
    { name: 'Latte', category: 'coffee', size: '350 ml', price: 1190, milk: true },
    { name: 'Flat white', category: 'coffee', size: '250 ml', price: 1190, milk: true },
    { name: 'Raf', category: 'coffee', size: '350 ml', price: 1290, milk: true }
];

const pad = (n) => String(n).padStart(2, '0');

function formatPrice(amount) {
    return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸';
}

function toMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function toTimeString(date) {
    return pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function parseDateInput(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function toDateInputValue(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
}

function getHours(date) {
    const day = date.getDay();
    return day === 0 || day === 6 ? HOURS.weekend : HOURS.weekday;
}

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

function isTimeWithinHours(time, date, lastBeforeClose) {
    const hours = getHours(date);
    const minutes = toMinutes(time);
    return minutes >= toMinutes(hours.open) && minutes <= toMinutes(hours.close) - lastBeforeClose;
}

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

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function searchDrinks(list, term, category) {
    const query = term.trim().toLowerCase();
    return list.filter((d) => (category === 'all' || d.category === category) && (query === '' || d.name.toLowerCase().includes(query)));
}

function isValidName(value) {
    return value.trim().length >= 2;
}

function isValidPhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 11 && (digits[0] === '7' || digits[0] === '8'));
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function averageRating(ratings) {
    if (ratings.length === 0) {
        return 0;
    }
    return Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
}

const EXTRAS = { milk: 450, decaf: 290, syrup: 190, shot: 290 };
const MILK_TYPES = ['Coconut', 'Oat', 'Banana', 'Lactose-free', 'Almond'];
const SYRUPS = ['Caramel', 'Salted Caramel', 'Vanilla', 'Coconut', 'Chocolate', 'Macadamia', 'Hazelnut', 'Irish Cream', 'Popcorn'];
const FREE_EXTRAS = ['Cinnamon', 'Sugar', 'Sweetener'];

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

function calcDrinkPrice(drink, options) {
    return drink.price + calcExtras(options, drink.milk);
}

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

function pickDrinks(list, milk, maxPrice) {
    return list.filter((d) => (milk === 'any' || d.milk === (milk === 'yes')) && (maxPrice === 0 || d.price <= maxPrice));
}
