'use strict';

const HOURS = {
    weekday: { open: '07:30', close: '23:00' },
    weekend: { open: '08:00', close: '23:00' }
};

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
    return value.trim().length >= 2 && /^[\p{L} ]+$/u.test(value.trim());
}

const PHONE_PREFIX = '+7';

const PHONE_ERROR = 'Please enter your real phone number, for example +7 771 419 84 57.';

function formatPhone(value, isPasted) {
    const digits = value.replace(/\D/g, '');
    if (digits === '' && value.includes('+')) {
        return '+';
    }
    const hasCountryCode = value.trim().startsWith('+') || digits.length > 10;
    let typed = hasCountryCode ? digits.slice(1) : digits;
    if (isPasted && digits.length > 10) {
        typed = digits.slice(-10);
    }
    const local = /^[3-9]/.test(typed) ? typed.slice(0, 10) : '';
    const groups = [local.slice(0, 3), local.slice(3, 6), local.slice(6, 8), local.slice(8, 10)].filter((group) => group !== '');
    return [PHONE_PREFIX, ...groups].join(' ');
}

function isValidPhone(value) {
    return /^\+7[3-9]\d{9}$/.test(value.trim().replace(/[\s()-]/g, ''));
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

function readStorage(key, fallback) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return data === null ? fallback : data;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        return;
    }
}
