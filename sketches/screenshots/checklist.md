# CSS Checklist — Espresso Day

Line numbers refer to the current files. `base.css` is written by the whole team.

## Yerkenaz

Pages: index.html, about.html, menu.html, colophon.html. Stylesheet: `Yerkenaz.css`.

### Selectors

| Requirement | File | Line |
| :--- | :--- | :--- |
| Type selector `header` | Yerkenaz.css | 11 |
| Class selector `.content-card` | Yerkenaz.css | 26 |
| Id selectors `#coffee-menu`, `#about-intro` | Yerkenaz.css | 63 |
| Descendant `.content-card p` | Yerkenaz.css | 51 |
| Child `.menu-page > .content-card` | Yerkenaz.css | 256 |
| Adjacent sibling `h2 + p` | Yerkenaz.css | 56 |
| Grouping `.storefront-photo, .menu-figure` | Yerkenaz.css | 145 |
| Attribute `footer a[href^="tel:"]` | Yerkenaz.css | 70 |
| Universal `.menu-page > *` | Yerkenaz.css | 251 |
| :hover / :focus (back-to-top link) | Yerkenaz.css | 402 |
| :hover (table row) | Yerkenaz.css | 308 |
| :first-child | Yerkenaz.css | 234 |
| :nth-child(even) | Yerkenaz.css | 304 |
| ::before | Yerkenaz.css | 397 |
| ::after | Yerkenaz.css | 41 |

### Colours, fonts, spacing, alignment

| Requirement | File | Line |
| :--- | :--- | :--- |
| rgba colour | Yerkenaz.css | 33 |
| Palette (hex) — team file | base.css | 16 |
| Fonts via variables (two families in base.css) | base.css | 23 |
| Monospace stack for code | Yerkenaz.css | 415 |
| padding | Yerkenaz.css | 28 |
| border | Yerkenaz.css | 30 |
| margin | Yerkenaz.css | 27 |
| Margin-collapse comment | Yerkenaz.css | 143 |
| text-align | Yerkenaz.css | 218 |

### Cascade and priority

| Requirement | File | Line |
| :--- | :--- | :--- |
| Specificity rule 1 (0,1,1) wins | Yerkenaz.css | 315 |
| Specificity rule 2 (0,1,0) loses | Yerkenaz.css | 321 |
| Specificity fix (0,2,0), no !important | Yerkenaz.css | 328 |
| Internal style block (one), about.html | about.html | 11 |
| Inline style (one), about.html | about.html | 44 |

### Flexbox

| Requirement | File | Line |
| :--- | :--- | :--- |
| Flex container with flex-wrap (about) | Yerkenaz.css | 196 |
| Items grow/shrink `flex: 2 1 300px` | Yerkenaz.css | 210 |
| flex-direction: row | Yerkenaz.css | 198 |
| flex-direction: column | Yerkenaz.css | 351 |
| Navigation flex row — team file | base.css | 103 |

### Grid

| Requirement | File | Line |
| :--- | :--- | :--- |
| grid-template-columns with repeat() and fr | Yerkenaz.css | 244 |
| minmax() | Yerkenaz.css | 111 |
| gap | Yerkenaz.css | 245 |
| Item spanning 2 columns | Yerkenaz.css | 264 |
| Comment: why grid, not flexbox | Yerkenaz.css | 240 |

### Positioning, float, centring

| Requirement | File | Line |
| :--- | :--- | :--- |
| static (comment) | Yerkenaz.css | 12 |
| relative | Yerkenaz.css | 147 |
| absolute | Yerkenaz.css | 179 |
| fixed | Yerkenaz.css | 380 |
| float | Yerkenaz.css | 89 |
| clear + comment | Yerkenaz.css | 103 |
| Centring 1: margin auto | Yerkenaz.css | 21 |
| Centring 2: absolute + transform | Yerkenaz.css | 189 |
| Centring 3: grid place-items | Yerkenaz.css | 225 |

## Dilnaz

Pages: booking.html, visit.html. Stylesheet: `dilnaz.css`.

### Selectors

| Requirement | File | Line |
| :--- | :--- | :--- |
| Type selector `button` | dilnaz.css | 254 |
| Class selector `.section-heading` | dilnaz.css | 97 |
| Id selectors `#reservation`, `#comment` | dilnaz.css | 85 |
| Descendant `.form-field label` | dilnaz.css | 200 |
| Child `.form-panel > legend` | dilnaz.css | 152 |
| Adjacent sibling `.section-heading + .intro-copy` | dilnaz.css | 106 |
| Grouping `.section-heading, legend` | dilnaz.css | 91 |
| Attribute `input[type="text"]` | dilnaz.css | 206 |
| Universal `.form-field > *` | dilnaz.css | 195 |
| :hover | dilnaz.css | 230 |
| :focus | dilnaz.css | 235 |
| :first-child | dilnaz.css | 366 |
| :nth-child(even) | dilnaz.css | 438 |
| ::before | dilnaz.css | 443 |
| ::after | dilnaz.css | 66 |

### Colours, fonts, spacing, alignment

| Requirement | File | Line |
| :--- | :--- | :--- |
| rgba colour | dilnaz.css | 48 |
| Palette (hex) — team file | base.css | 16 |
| Heading font via variable | dilnaz.css | 21 |
| padding | dilnaz.css | 43 |
| border | dilnaz.css | 45 |
| margin | dilnaz.css | 62 |
| Margin-collapse comment | dilnaz.css | 52 |
| text-align | dilnaz.css | 291 |

### Cascade and priority

| Requirement | File | Line |
| :--- | :--- | :--- |
| Specificity rule 1 (0,2,0) wins | dilnaz.css | 160 |
| Specificity rule 2 (0,1,0) loses | dilnaz.css | 166 |
| Specificity fix (0,3,0), no !important | dilnaz.css | 172 |
| !important (the only one, with justification) | dilnaz.css | 23 |
| Internal style block (one), visit.html | visit.html | 11 |
| Inline style (one), visit.html | visit.html | 25 |

### Flexbox

| Requirement | File | Line |
| :--- | :--- | :--- |
| Form: flex container with flex-wrap | dilnaz.css | 140 |
| Items grow/shrink `flex: 1 1 calc(...)` | dilnaz.css | 181 |
| Feature cards row | dilnaz.css | 418 |
| flex-direction: column | dilnaz.css | 182 |
| Navigation flex row — team file | base.css | 103 |

### Grid

| Requirement | File | Line |
| :--- | :--- | :--- |
| grid-template-columns with fr and minmax() | dilnaz.css | 328 |
| gap | dilnaz.css | 329 |
| Item spanning 2 columns | dilnaz.css | 335 |
| Comment: why grid, not flexbox | dilnaz.css | 323 |

### Positioning, float, centring

| Requirement | File | Line |
| :--- | :--- | :--- |
| static (comment) | dilnaz.css | 12 |
| relative | dilnaz.css | 56 |
| absolute | dilnaz.css | 67 |
| fixed | dilnaz.css | 458 |
| float | dilnaz.css | 116 |
| clear + comment | dilnaz.css | 130 |
| Centring 1: margin auto | dilnaz.css | 35 |
| Centring 2: flex | dilnaz.css | 250 |
| Centring 3: grid place-items | dilnaz.css | 289 |

## Aisha

Pages: coffee.html, reviews.html. Stylesheet: `aisha.css`.

### Selectors

| Requirement | File | Line |
| :--- | :--- | :--- |
| Type selector `h2` | aisha.css | 112 |
| Class selector `.media-card` | aisha.css | 253 |
| Id selectors `#menu-table`, `#work-info`, `#manager-quote` | aisha.css | 135 |
| Descendant `.nested-category-list ul` | aisha.css | 397 |
| Child `.terms-dictionary > dt` | aisha.css | 416 |
| Adjacent sibling `h2 + p` | aisha.css | 127 |
| Grouping `.contact-link, .inline-link, ...` | aisha.css | 161 |
| Attribute `a[href^="tel:"]` | aisha.css | 150 |
| Universal selector — team file | base.css | 29 |
| :hover | aisha.css | 269 |
| :first-child | aisha.css | 222 |
| :nth-child(even) | aisha.css | 363 |
| ::before | aisha.css | 293 |
| ::after | aisha.css | 117 |

### Colours, fonts, spacing, alignment

| Requirement | File | Line |
| :--- | :--- | :--- |
| rgba colour | aisha.css | 41 |
| Named colour `white` | aisha.css | 74 |
| Palette (hex) — team file | base.css | 16 |
| padding | aisha.css | 70 |
| border | aisha.css | 72 |
| margin | aisha.css | 464 |
| Margin-collapse comment | aisha.css | 459 |
| text-align | aisha.css | 288 |

### Cascade and priority

| Requirement | File | Line |
| :--- | :--- | :--- |
| Specificity rule 1 (0,1,1) wins | aisha.css | 83 |
| Specificity rule 2 (0,1,0) loses | aisha.css | 89 |
| Specificity fix (0,2,0), no !important | aisha.css | 96 |
| Internal style block (one), coffee.html | coffee.html | 15 |
| Inline style (one), coffee.html | coffee.html | 341 |
| Internal style block, reviews.html (page demo) | reviews.html | 15 |

### Flexbox

| Requirement | File | Line |
| :--- | :--- | :--- |
| Flex container with flex-wrap (reviews gallery) | aisha.css | 230 |
| Items grow/shrink `flex: 1 1 280px` | aisha.css | 238 |
| flex-direction: column (footer) | aisha.css | 496 |
| Navigation flex row — team file | base.css | 103 |

### Grid

| Requirement | File | Line |
| :--- | :--- | :--- |
| grid-template-columns with repeat() and fr (gallery mosaic) | aisha.css | 214 |
| minmax() | aisha.css | 53 |
| gap | aisha.css | 218 |
| Item spanning 2 columns and 2 rows | aisha.css | 223 |
| Comment: why grid, not flexbox | aisha.css | 212 |

### Positioning, float, centring

| Requirement | File | Line |
| :--- | :--- | :--- |
| static (comment) | aisha.css | 14 |
| relative | aisha.css | 254 |
| absolute | aisha.css | 277 |
| fixed | aisha.css | 34 |
| float | aisha.css | 307 |
| clear + comment | aisha.css | 320 |
| Centring 1: margin auto | aisha.css | 56 |
| Centring 2: absolute + transform | aisha.css | 289 |
| Centring 3: flex | aisha.css | 497 |

