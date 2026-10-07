# Espresso Day: Web Technologies Midterm

Project: Espresso Day Coffee Shop, Syganak 24, Nura District, Astana, Kazakhstan
Group: SE-2537
Students: Yerkenaz, Aisha, Dilnaz

Espresso Day is a coffee shop chain with 112 branches across Kazakhstan. This site is for the Syganak 24 branch. A visitor can read about the shop, look at the menu and prices, pre-order drinks for pick-up, book a table, find the address and hours, ask a question and leave a review.

The midterm version is **HTML and CSS only**. There is no JavaScript of our own: buttons and forms are finished and ready, and later assignments will bring them to life.

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
- **State classes** are defined in `css/custom.css` and are not used yet: `.hidden`, `.active`, `.selected`, `.error`, `.success`, `.highlight`. Bootstrap's `is-invalid` and `is-valid` are used for fields.

## Technologies
- HTML5, semantic elements
- Bootstrap 5.3.3 (CSS and JS bundle from the jsDelivr CDN) for all layout, plus one small correction stylesheet, `css/custom.css`
- Git and GitHub

The old Assignment 2 stylesheets are deleted; `removed-css.md` lists what Bootstrap replaced.

## Checks (see `quality-pass.md`)
- W3C validator (Nu HTML Checker): 0 errors on all 8 pages.
- No console errors, no broken images, no dead links, no `href="#"`, no horizontal scroll at 375 px.
- Screenshots of every page at 375 px (phone) and 1280 px (desktop) are in `screenshots/`.

## Other files
- `ai-log.md`: the AI log
- `quality-pass.md`: the quality-pass list
- `removed-css.md`: what Bootstrap replaced from Assignment 2

## Freeze
The final commit is tagged `midterm`:
```
git tag midterm
git push origin midterm
```
After the tag, new elements and styles are produced by JavaScript only.
