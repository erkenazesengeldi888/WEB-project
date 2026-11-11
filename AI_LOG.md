# AI log

This project was made with the help of an AI assistant, **Claude** (Anthropic), used through Claude Code.
The team chose the tasks, checked the results in the browser and decided what to keep. The commits below were written together with Claude.

Before this log, these commits carried a `Co-Authored-By: Claude ... <noreply@anthropic.com>` line in their messages. The lines were taken out of the commit messages, and this file now records the same information in one place.

## What Claude helped with

- Endterm JavaScript and jQuery features (menu, order, booking, reviews, coffee builder), fonts and the shared look (commits of 6–7 November).
- Removing code comments, icons on the Home page, "Surprise me" (red outline, picks from the whole menu), splitting plain JS and jQuery into separate files with the `jq-` prefix, README updates (9 November).
- Phone check `+7 7` with 11 digits on Booking and Visit Us, the phone field on Visit Us, empty "Number of guests" (10–11 November).
- Checks: W3C validator, console errors, phone width 375 px, links and buttons.

## Commits written with Claude

| Date | Author | Commit | Model |
|---|---|---|---|
| 2026-11-06 | Aisha | Endterm: working JavaScript and jQuery on all pages | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Reviews: rating overview with bars, compact filter buttons; Coffee: variety links in site colour | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Home: remove the "What should I drink?" block (the same choice is on Menu, Coffee and Order) | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Look: one shared set of Bootstrap classes (rounded cards, pill buttons, headings, header, footer) applied by main.js | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Fonts: Poppins for text and Playfair Display for headings, loaded by main.js | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Reviews: manager card as high as its text and sticky on wide screens | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | One smooth zoom for all pictures, made by main.js (replaces the separate versions on Coffee and Reviews) | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Font: Inter for the text and the headings | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Font: Nunito by default, ?font=Name in the address to try another one | Claude Sonnet 5.5 |
| 2026-11-06 | Aisha | Font: Montserrat by default | Claude Sonnet 5.5 |
| 2026-11-07 | Aisha | Reviews: remove the four invented example reviews, only real 2GIS reviews stay | Claude Sonnet 5.5 |
| 2026-11-07 | Aisha | Order: say clearly that the payment is in cash when the order is received | Claude Sonnet 5.5 |
| 2026-11-09 | Dilnaz | Remove code comments from HTML, CSS and JS | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Home: simple line icons instead of emoji in Why Espresso Day, built by JS | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Menu: Surprise me highlights the suggested drink in red | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Reviews: make the photo canvas with jQuery, no plain DOM calls in the jQuery file | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Menu: Surprise me red outline is visible (take off border-0 from the picked card) | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Move readStorage/writeStorage to data.js, so the jQuery files use only jq-main.js and pure helpers | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | README: endterm section with the plain JS / jQuery split, requirements map and latest changes | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Menu: Surprise me picks from every drink of the menu, not only coffee | Claude Opus 5.5 |
| 2026-11-09 | Dilnaz | Rename the jQuery files with the jq- prefix so plain JS and jQuery are told apart by name | Claude Opus 5.5 |
| 2026-11-11 | Dilnaz | Booking and Visit Us: phone starts with +7 7 (11 digits), the field holds +7 7; Visit Us gets a phone field; guests start empty and Clear form empties them | Claude Opus 5.5 |
| 2026-11-11 | Dilnaz | AI log (this file) | Claude Opus 5.5 |

Total: 23 commits.
