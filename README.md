# Espresso Day: Web Technologies Project (Midterm → Endterm)

Project: Espresso Day Coffee Shop, Syganak 24, Nura District, Astana, Kazakhstan
Group: SE-2537
Students: Yerkenaz, Aisha, Dilnaz

Espresso Day is a coffee shop chain with 112 branches across Kazakhstan. This site is for the Syganak 24 branch. A visitor can read about the shop, look at the menu and prices, pre-order drinks for pick-up, book a table, find the address and hours, ask a question and leave a review.

The midterm version was **HTML and CSS only**. Assignments 4 and 5 and the endterm add JavaScript and jQuery (folder `js/`) without changing the HTML or the CSS: new elements are created by the scripts and styles are switched with existing classes. What the endterm added, the split between plain JavaScript and jQuery and the authors are in [Endterm](#endterm-what-was-added).

## Pages

| File | Page | What the visitor does there |
|---|---|---|
| `index.html` | Home | Sees what the shop offers, opening hours and address, and starts any of the main actions |
| `about.html` | About | Reads the story, meets the team, reads the common questions (FAQ), goes to the question form |
| `menu.html` | Menu | Looks up prices, finds a drink with the search form, jumps to a category, starts a pre-order |
| `order.html` | Order | Chooses drinks and quantities, sees the total, enters pick-up details, places the order |
| `visit.html` | Visit Us | Finds the address, contacts and opening hours, sends a question |
| `booking.html` | Booking | Requests a table, reads the summary of the request |
| `coffee.html` | Coffee | Learns how each coffee is made, the extras and the shop concept |
| `reviews.html` | Reviews | Reads reviews and the manager's statement, writes a review |

All eight pages share the same header, navigation (same eight items in the same order), title band and footer. Titles follow one pattern: `Espresso Day — Page`.

## Three user journeys

### Journey 1: find the opening hours and the address
1. **Start:** `index.html`.
2. In the "Find us" section the visitor sees the opening hours table and the address.
3. The visitor presses **Visit Us page** and lands on `visit.html#address` with the address, phone, e-mail and the **View on 2GIS** button.
4. Below, the **Opening hours** section (`#opening-hours`) repeats the hours and offers **Book a table** and **Pre-order drinks**.
5. **End:** the visitor knows the hours and the address, and can open the map in 2GIS or call.

### Journey 2: choose drinks and pre-order them
1. **Start:** `menu.html`.
2. The visitor uses **Find a drink** (search by name and category) or the category buttons to jump to the drink and see its price.
3. The visitor presses **Pre-order drinks** and arrives on `order.html#order-form`.
4. The visitor opens a category, sets quantities, checks **Your order** and the total, fills in name, phone, pick-up time and the pick-up checkbox.
5. The visitor presses **Place order**.
6. **End:** the **Order confirmation** box under the form (`#order-result`) is where the order number, drinks, total and pick-up time appear. The page also says that payment is at the counter.

### Journey 3: read about the team and send a question
1. **Start:** `about.html`.
2. The visitor reads the story, then **The people behind Espresso Day** (owner, franchise owners, branch manager) and the FAQ.
3. The visitor presses **Ask us a question** and lands on `visit.html#contact-form`.
4. The visitor fills in name, e-mail, topic and message, and presses **Send question**.
5. **End:** the box next to the form (`#contact-result`) shows what happens next, and is where the confirmation with the topic and e-mail appears. The reply comes by e-mail.

Table booking works the same way: `booking.html`, press **Request table**, the summary appears in `#booking-result`, and the page says that we call to confirm.

## Prepared for JavaScript (the freeze)

- **Naming:** all ids and classes are English, lowercase, kebab-case. Ids start with the area they belong to: `booking-`, `order-`, `contact-`, `review-`, `menu-`, `faq-`, `team-`.
- **Forms:** `booking-form`, `order-form`, `contact-form`, `review-form`, `menu-search-form`. Every input has an id, a `name` and a label. Every input that can be wrong has an `invalid-feedback` block with the id `<input-id>-error`.
- **Result and error areas** (all use `aria-live`):

| Form | Error area | Result area | Success message (hidden) |
|---|---|---|---|
| Booking | `booking-error` | `booking-result` | `booking-success` with `summary-name`, `summary-guests`, `summary-date`, `summary-time`, `summary-phone` |
| Order | `order-error` | `order-result` | `order-success` with `order-number`, `order-pickup`, `order-final-total` |
| Question | `contact-error` | `contact-result` | `contact-success` with `contact-success-name`, `contact-success-topic`, `contact-success-email` |
| Review | `review-error` | `review-result` | `review-success` |
| Menu search | | `menu-search-status`, `menu-search-empty` | |

- **Containers for generated content:** `order-items` (lines of the order), `order-count`, `order-total`, `review-list` (new reviews are added here), `menu-search-status`.
- **Data attributes:** every order row has `data-name`, `data-size`, `data-price` and `data-category`; every menu category has `data-category`. Menu items carry the class `menu-item`, categories `menu-category`, order rows `order-row`, quantity boxes `order-qty`.
- **State classes** are defined in `css/custom.css` (not used at the midterm, now switched by the scripts): `.hidden`, `.active`, `.selected`, `.error`, `.success`, `.highlight`. Bootstrap's `is-invalid` and `is-valid` are used for fields.

## Technologies
- HTML5, semantic elements
- Bootstrap 5.3.3 (CSS and JS bundle from the jsDelivr CDN) for all layout, plus one small correction stylesheet, `css/custom.css`
- Git and GitHub

The old Assignment 2 stylesheets are deleted; `css/removed-css.md` lists what Bootstrap replaced.

## Checks (midterm, see `sketches/screenshots/checklist.md`)
- W3C validator (Nu HTML Checker): 0 errors on all 8 pages.
- No console errors, no broken images, no dead links, no `href="#"`, no horizontal scroll at 375 px.
- Screenshots: `sketches/screenshots/`, `before/`, `after/`.

## Other files
- `sketches/screenshots/checklist.md`: the quality-pass list
- `css/removed-css.md`: what Bootstrap replaced from Assignment 2

## Freeze
The final commit is tagged `midterm`:
```
git tag midterm
git push origin midterm
```
After the tag, new elements and styles are produced by JavaScript only.


## JavaScript (Assignments 4 and 5)

HTML/CSS freeze: the only change in the HTML files is the `<script ... defer>` tags at the end. The inline scripts that used to be in `menu.html` and `order.html` were moved to `js/menu.js` and `js/order.js`.

| File | Used on | What it holds |
|---|---|---|
| `js/data.js` | all pages | Data and pure functions (Assignment 4): `DRINKS` (6 drinks with name, category, size, price, milk), `HOURS`, `formatPrice`, `getOpenStatus`, `isTimeWithinHours`, `buildTimeSlots`, `generateOrderNumber`, `calcTotal`, `pickRandom`, `searchDrinks`, `isValidPhone`, `isValidEmail`, `averageRating`, `readStorage`/`writeStorage` (`localStorage` with a fallback) and others. No DOM, so both the plain JS and the jQuery files may call them |
| `js/cart.js` | all pages | The shared cart, kept in `localStorage` |
| `js/main.js` | all pages | Form helpers, the two team features (below), the common look (fonts, rounded cards, photo zoom) and the icons of "Why Espresso Day" on the Home page |
| `js/extras.js` | Menu, Coffee | The drink extras picker: alternative milk with its kind, extra shot, decaf, any number of syrups, free additions (cinnamon, sugar, sweetener; milk for the Americano) |
| `menu.js`, `coffee.js`, `order.js`, `visit.js` (plain JS); `jq-about.js`, `jq-booking.js`, `jq-reviews.js` (jQuery) | one page each | Page features |

Rules followed: `'use strict'` in every file, `const`/`let` only, no `var`, `==`, `document.write()`, inline handlers, and no user text through `innerHTML` (only `textContent`). `Math.random()` is used for the temporary order number (`ED-1234`, a reference for the page, not a server id) and for "Surprise me" (a random drink of the menu).

## Functionality Plan

| Page | Visitor goal | Planned feature | Expected result | Student |
|---|---|---|---|---|
| All pages | Know if the shop is open | **Team feature:** "Open now / Closed" badge in the title band from the opening hours and the current time | Badge says "Open now · until 23:00" or when the shop opens next | Team |
| All pages | See what is in the order while browsing | **Team feature:** drink counter on the Order link in the navigation | The number follows the cart on every page and tab | Team |
| Menu | Find a drink fast | Search by name plus category filter, found text highlighted, result count, empty message; coffee drinks can be customised in the drink window with the same extras as on the Coffee page | Only matching drinks stay; Clear shows the whole menu | Aisha |
| Menu | Not sure what to choose | "Surprise me": a random drink from the whole menu (every category except Extras), scrolls to it and offers **Add to cart** | A random drink with its price is suggested and can be added | Aisha |
| Order | Place a pre-order | Cart becomes an order: quantities, pick-up or delivery, field validation, time inside today's hours, order number and list of drinks in the confirmation | Wrong fields are marked with a message; a valid order shows number, drinks, total | Aisha |
| Order | Order the same again | "Repeat my last order" (last order kept in the browser) | The drinks of the previous order come back into the cart | Aisha |
| Booking | Request a table | Validation of name, e-mail, phone, guests (1-10), date not in the past, time inside the opening hours of that day; summary | Wrong fields are marked; a valid request shows the summary | Yerkenaz |
| Booking | Choose a time quickly | Time slots every 30 minutes for the chosen date (today: only future times) | One press on a slot fills the time field | Yerkenaz |
| Visit Us | Know today's hours | Today's row of the hours table is highlighted and a line "Today: ..." is added | The visitor sees today's hours and whether the shop is open | Dilnaz |
| Visit Us | Ask a question | Question form: 6 fields checked (the phone field is made by `visit.js`), the second e-mail must equal the first, live character counter (10-500), confirmation saying nothing is sent | Confirmation with name, topic and e-mail | Dilnaz |
| About | Find an answer fast | Search in the common questions (question and answer text), count, empty message, Clear | Only matching questions stay visible | Dilnaz |
| Coffee | Know the price of my exact cup | "Build your coffee": coffee, kind of milk, extra shot, decaf, several syrups, free additions and number of cups give the price at once; Add to cart | Price per cup and total are shown and the cup goes to the cart | Aisha |
| Reviews | Share an opinion | Review form with rating and text; the review is added to the list and kept in the browser; own reviews can be deleted | The new review appears first with a thank-you message | Dilnaz |
| Reviews | Read the reviews that matter | Filter by rating and sort order with a Reset button, the count and average rating of what is shown and an empty message | The list and the statistics change at once | Dilnaz |

(Please correct the names if the split was agreed differently.)

## Tags
```
git tag assignment-4
git tag assignment-5
git push origin assignment-4 assignment-5
```

## jQuery (Assignment 4, last assignment)

jQuery **3.7.1** is loaded from the `code.jquery.com` CDN (with an integrity hash) on the three pages that use it: `about.html`, `booking.html`, `reviews.html`. The only HTML change is the `<script defer>` lines (jQuery first, then `js/jq-main.js`, then the page file). No plugins, no templates, no sliders. Our code runs inside `$(function () { ... })`.

**Change in the old code:** the plain-JavaScript helper `const $ = (id) => document.getElementById(id)` was renamed to `byId`, because `$` now belongs to jQuery. (Rename only, no behaviour change; it is not a midterm HTML/CSS correction.)

| File | What it holds |
|---|---|
| `js/jq-main.js` | jQuery helpers: `jqFieldState`, `jqLiveValidate`, `jqReveal`/`jqConceal` (fade with the `.hidden` class), `jqReport`, `jqDemoNote`, `jqScrollTo` |
| `js/jq-about.js` | FAQ search (rewritten, function 1) |
| `js/jq-booking.js` | Booking slots and validation (rewritten, function 2) |
| `js/jq-reviews.js` | Review cards, list, filter/sort and the review form (rewritten, function 3) |
| `js/old-js-version.js` | The **old plain-JavaScript** versions of the three functions (`buildFaqSearch`, `checkField`/`validateBooking`, `reviewCard`/`renderReviews`), **not linked to any page**, for comparison |

### Where each requirement is
| Requirement | Where |
|---|---|
| 3 rewritten functions | `jq-about.js` `buildFaqSearch`; `jq-booking.js` `checkField` and `validateBooking`; `jq-reviews.js` `reviewCard` and `renderReviews`. Old versions: `old-js-version.js` |
| Selectors: id, class, element, attribute, `:checked`, `:not()`, `:first` | `jq-booking.js` slot handler (`button[data-time]`), `jq-reviews.js` `checkRating` (`input[name="rating"]:checked`), `jq-about.js` `update` (`:not(.hidden)`), `jq-reviews.js` submit handler (`.review-item:first`), `jq-main.js` `jqLiveValidate` (`input:not(:radio):not(:checkbox)`) |
| Traversal: `.closest()`, `.find()`, `.siblings()`, `.each()` | `jq-reviews.js` (`.closest('.review-item')`, `$list.find(...)`); `jq-booking.js` slot handler (`.siblings()`), `validateBooking` (`.each()`); `jq-main.js` `jqResetStates` (`.find()`) |
| `$(this)` | `jq-booking.js` slot handler and `validateBooking`, `jq-about.js` `update`, `jq-main.js` `jqLiveValidate`, `jq-reviews.js` delegated handlers |
| Chains of 3+ methods | `jq-booking.js` slot handler (`.addClass().attr().siblings().removeClass().attr()`); `jq-main.js` `jqFieldState`, `jqLiveValidate`, `jqReveal` |
| `.text()`, `.html()`, `.val()`, `.attr()`, `.prop()` | `jq-about.js` `update` (`.html` with numbers only, `.text` for everything typed); `jq-booking.js` `checkField` (`.prop('checked')`) |
| List made from an array with `.append()`/`.appendTo()` | `jq-booking.js` `renderSlots` (slot buttons), `jq-reviews.js` `reviewCard`, `starPicker`, `photoPicker` and `renderReviews` |
| Delegated handler | `jq-reviews.js` (`$list.on('click', '.review-edit' / '.review-delete' / '.review-edit-cancel', ...)`, `$list.on('submit', '.review-edit-form', ...)`), `jq-booking.js` (`$slots.on('click', 'button[data-time]', ...)`), `jq-main.js` `jqLiveValidate` |
| Event types | click, submit, input, change, focusout, reset, mouseenter |
| Effects | `fadeIn` (`jqReveal`, new review), `fadeOut` with callback (`jqConceal`, delete a review), `slideToggle(250, callback)` (filter panel), `animate` (`jqScrollTo`) |
| Form validation | Booking form, `jq-booking.js` `checkField` / `validateBooking` / submit handler: `preventDefault()`, trimmed text, e-mail and phone format, guests 1-10, date not in the past, time inside the hours of that day, consent; one message beside each field; first wrong field gets focus; the error clears while typing; success summary only when all is valid, then the form is reset |

Plain-language answers for the defense: `.text()` writes plain text (safe for anything the visitor typed), `.html()` parses markup (only for our own text). `.prop('checked')` is the current state of a checkbox; `.attr('checked')` is only what was written in the HTML. A delegated handler sits on a parent that already exists and checks, when a click bubbles up, whether the target matches the selector, so it also works for elements that were created later.

## Endterm: Reviews and Coffee (Aisha)

The HTML and CSS stay frozen. Everything new is made by the scripts; states are switched with Bootstrap classes and `.hidden`.

### Reviews page (jQuery, `js/jq-reviews.js`)
- **Data:** the reviews taken from 2GIS are in the array `SEED_REVIEWS` (name, rating, date, text, `source: '2GIS'`). The cards are made from the array in a loop. Reviews written by visitors are kept in `localStorage` (`savedReviews`) and are marked "Source: review from this site".
- **Show more:** 3 reviews at first (`PAGE_SIZE`), the button "Show more reviews" adds 3 more, "Show fewer reviews" folds the list back. The filter (rating) and sort (newest / highest / lowest) work together with it, with the count, the average rating and an empty message.
- **Stars as on 2GIS:** the rating is chosen with five stars (`starPicker`): the stars up to the pointer are painted yellow on hover, the click keeps the choice. The radio buttons of the frozen HTML stay hidden and hold the value. Cards show the rating with `ratingStars`.
- **Form check:** name (2 letters or more), rating, text from 10 to 1000 characters, with a live counter. One message beside each field, the first wrong field gets the focus.
- **Photos:** up to 5 photos per review (`MAX_PHOTOS`). Each file is checked (an image, 10 MB at most), shrunk on a canvas (700 px) and kept as text in `localStorage`. Preview with Remove under each photo. If the browser has no space left, the review is not saved and the field says why.
- **Own reviews:** Edit (the card becomes a small form with the same checks) and Delete (a Bootstrap window "Are you sure you want to delete your review?" with Yes / No, then `fadeOut`). Reviews from 2GIS have no such buttons.
- **Zoom:** a review photo and the two pictures of the page grow when the mouse is over them (delegated `mouseenter` / `mouseleave`).
- **jQuery features used:** selectors (id, class, attribute, `:checked`, `:first`, `:visible`), `.closest()`, `.find()`, `.siblings()`-style traversal, `$(this)`, chains of 3+ methods, delegated handlers, `fadeIn`, `fadeOut`, `slideToggle`, `animate`.

### Coffee page (plain JavaScript, `js/coffee.js`)
- **Build your coffee:** the drink list comes from `DRINKS`, the price is calculated from the drink, the extras and the number of cups (validated, 1 to the cart limit), then added to the cart.
- **Coffee Varieties:** the table body in `coffee.html` is now empty. The rows are made from the array `VARIETIES` in a loop. A search field filters them by name or by what the drink contains (found text is highlighted, there is a count and an empty message with a Clear button). A press on a name chooses that drink in "Build your coffee" and scrolls to it; a drink that is not in the order list says so.
- **Events:** `submit`, `input`, `change`, `click`, `reset`, `mouseenter`, `mouseleave`. **Delegated handler:** one `click` handler on the table body catches the buttons that are made again at every search.
- **Zoom:** the photos of the page grow when the mouse is over them.

## Endterm: what was added

### Plain JavaScript and jQuery are in separate files
Every jQuery file starts with `jq-`, so the split is visible from the file names. No file mixes the two. The plain JS files have no `$` or `jQuery`; the jQuery files have no `document.`, `querySelector` or `addEventListener` and do not call the DOM helpers of `main.js`.

| Technology | Files | Pages |
|---|---|---|
| **jQuery 3.7.1** (CDN `code.jquery.com`, code inside `$(function () { ... })`) | `jq-main.js` (helpers), `jq-about.js`, `jq-booking.js`, `jq-reviews.js` | About, Booking, Reviews |
| **Plain JavaScript** | `main.js`, `cart.js`, `extras.js`, `menu.js`, `coffee.js`, `order.js`, `visit.js` (and `old-js-version.js`, not linked) | all pages |
| **Shared data and pure functions** (no DOM, no jQuery) | `data.js`, `menu-data.js` | all pages / Menu |

`main.js` and `cart.js` are also loaded on the jQuery pages, but for a different feature (the header: open/closed badge, cart counter, fonts); they never touch the jQuery features. jQuery is not loaded on Home, Menu, Coffee, Order and Visit Us.

### Requirements and where they are
| Requirement | Where |
|---|---|
| Data in arrays and objects at the top of the file, page built with loops | `data.js` (`DRINKS`, `HOURS`), `menu-data.js` (menu cards), `coffee.js` (`VARIETIES`), `jq-reviews.js` (`SEED_REVIEWS`), `main.js` (`PERK_ICONS`, `LOOK_RULES`) |
| Own functions with parameters and `return`, `if/else` | `data.js` (`formatPrice`, `calcTotal`, `isValidEmail`, `isValidPhone`, `averageRating`, ...), `main.js` `makeIcon(paths)` |
| Calculated values | order total and count (`order.js`, `calcTotal`), price of a custom coffee (`coffee.js`), average rating and count of reviews (`jq-reviews.js`), number of found drinks / questions |
| No `onclick` in the HTML | all handlers are attached in the scripts (`addEventListener` / `.on()`) |
| 3+ event types, delegation | plain JS: `click`, `submit`, `input`, `change`, `reset`, `mouseenter`, `mouseleave`, delegated `click` on the table body in `coffee.js`; jQuery: see the table above |
| Main form validation | Booking (jQuery, `jq-booking.js`): `preventDefault()`, `trim()`, e-mail and phone checks (the phone must start with `+7 7` and have 11 digits, `isPhoneKz` in `data.js`), a message beside each field, success only when everything is valid. Also checked in plain JS: Order (phone, `order.js`) and the Visit Us question form (e-mail and the same `+7 7` phone rule, `visit.js`) |
| HTML/CSS freeze | no new HTML or CSS rules after the midterm; new content is made by the scripts, states use existing classes (Bootstrap utilities, `.active`, `.hidden`) |

### Latest changes
| Change | File | Technology | Student |
|---|---|---|---|
| Comments removed from the HTML, CSS and JS files (this README explains the code instead) | all | | Team |
| Home, "Why Espresso Day": the emoji are replaced by simple line icons. The icons are paths in the array `PERK_ICONS`; `makeIcon(paths)` builds an SVG and `initPerkIcons()` puts them into the cards in a loop. The colour is Bootstrap's `text-primary` | `js/main.js` | plain JS | Team |
| Menu, "Surprise me": the drink is picked from the whole menu (all categories except Extras: coffee, iced coffee, frappé, lemonades, matcha, teas, milkshakes, baby drinks...), not only from the 6 coffees of `DRINKS`. The suggested drink gets a red outline (`border border-danger border-3`, `border-0` taken off) and its name in the message is red and bold (`text-danger fw-bold`). The previous pick goes back to normal | `js/menu.js` | plain JS | Aisha |
| `readStorage`/`writeStorage` moved from `main.js` to `data.js`, so the jQuery file `jq-reviews.js` uses no helper of a plain-DOM file | `js/data.js` | shared | Team |
| The photo canvas in the review form is made with `$('<canvas>')` | `js/jq-reviews.js` | jQuery | Dilnaz |
| The jQuery files are renamed with the `jq-` prefix: `about.js` → `jq-about.js`, `booking.js` → `jq-booking.js`, `reviews.js` → `jq-reviews.js` (only the `src` of their `<script>` changed in the HTML) | `js/` | jQuery | Team |
| Booking and Visit Us: the phone number must start with `+7 7` and have 11 digits in all (`+7 7XX XXX XX XX`; spaces, brackets and dashes are allowed). The field already holds `+7 7`, the visitor types the rest. Any other number makes the field red with a message, and the form is not sent. The rule is one function, `isPhoneKz(value)` in `data.js`, used by both pages | `js/data.js`, `js/jq-booking.js`, `js/visit.js` | shared / jQuery / plain JS | Team |
| Visit Us: the question form gets a **Phone number** field, made by `makePhoneField()` in `visit.js` (the HTML is frozen) | `js/visit.js` | plain JS | Team |
| Booking: **Number of guests** is empty when the page opens and after **Clear form** (before, the browser put the default 2); the visitor picks the number with the arrows of the field | `js/jq-booking.js` | jQuery | Team |

(Please correct the names if the work was split differently.)

## AI use

Parts of this project were made with the help of the AI assistant Claude (Claude Code).
