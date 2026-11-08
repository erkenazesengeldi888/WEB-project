# Assignment 3: what we removed from our CSS and what replaced it

In Assignment 2 we had four stylesheets (`base.css`, `Yerkenaz.css`, `dilnaz.css`, `aisha.css`, about 1,650 lines).
They are all deleted. The only stylesheet now is `css/custom.css` (colours, fonts and a few small corrections).

| Old hand-written rule (Assignment 2) | Bootstrap class that replaced it |
|---|---|
| `main { padding; max-width; margin: auto }`, `.page-main`, `.page-content` | `container py-5` |
| `.perks-grid`, `.photo-grid`, `.menu-category` grids (display: grid / flex, gaps, column counts) | `row g-3` / `g-4` with `col-12 col-md-6 col-lg-4` |
| `.float-photo` (float image inside a paragraph) | a `row` with `col-md-5` (image) and `col-md-7` (text), `img-fluid rounded` |
| `.main-navigation ul { display: flex; gap; justify-content }` and the pill link styles | `navbar navbar-expand-lg`, `navbar-toggler`, `collapse navbar-collapse`, `navbar-nav nav-pills`, `nav-link active` |
| `.content-card`, `.perk-card`, `.review-card`, `.location-card`, `.photo-card`, `.media-card` (white box, border, radius, shadow, padding) | `card`, `card-body`, `shadow-sm`, `h-100`, `rounded` |
| `header`, `footer` (background, padding, border, centred text) | `bg-dark text-light text-center py-4 border-bottom border-4 border-primary` |
| `h1 { text-transform: uppercase }`, `.page-header-title`, `.main-title` | `display-5`, `text-uppercase`, `text-center`, `text-primary` |
| Intro paragraph sizes, muted captions, small print | `lead`, `text-muted`, `small`, `figure-caption` |
| `.coffee-table`, `.drink-menu-table` (borders, striped rows, hover, padding) | `table table-striped table-hover align-middle`, `table-dark`, `table-responsive`, `caption-top` |
| `.price-cell`, `.item-price`, `.item-name` | `fw-bold`, `text-primary`, `d-flex justify-content-between` |
| `.menu-list` (list with price on the right) | `list-group list-group-flush`, `list-group-item` |
| `.new-badge` (JANA mark), `.extra-price`, `.chip-list li`, `.rating` | `badge text-bg-primary`, `badge rounded-pill text-bg-light border` |
| `.reservation-form`, `.form-panel`, `.form-field`, `.wide-field` (form grid, inputs, labels) | `row g-3`, `col-12 col-md-6`, `form-label`, `form-control` |
| `.primary-action`, `.secondary-action` (button styling) | `btn btn-primary btn-lg`, `btn btn-outline-primary btn-lg` |
| `.quick-contact` (phone button, phone only) | `btn btn-primary btn-sm d-md-none` |
| `.back-to-top` (fixed link) | `btn btn-dark btn-sm position-fixed bottom-0 end-0 m-3` |
| `.contact-list dt/dd` two-column layout | `dl.row` with `dt.col-sm-4` and `dd.col-sm-8` |
| `.review-quote`, `.manager-quote` (left border, indent) | `blockquote border-start border-4 border-primary ps-3` |
| `.responsive-img`, `img { max-width: 100% }` | `img-fluid` |
| `.section-divider` | `<hr class="my-4">` |
| Margins and paddings on almost every block | `mb-*`, `mt-*`, `py-*`, `p-4`, `gap-2`, `g-*` |
| Inline `style` attributes and `<style>` blocks on `about`, `visit`, `coffee`, `reviews` (the cascade demos) | removed completely; `fw-bold` replaces the inline bold on the official-site link |

## What is left in `css/custom.css` and why

- Brand colours written into Bootstrap's CSS variables (`--bs-primary`, `--bs-dark`, `--bs-body-bg`...), so utilities such as `bg-dark`, `text-primary` and `border-primary` use our palette.
- The Georgia heading font (Bootstrap has no serif heading font).
- White background for `.card` and `.table` (they would otherwise be beige on the beige page).
- The `.btn-primary` / `.btn-outline-primary` colour variables (Bootstrap hard-codes blue in each button class).
- The active-pill colour, the navigation hover colour and letter-spacing, burgundy `h3`, footer link colour.
