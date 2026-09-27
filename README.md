Web Technologies — Assignments 1, 2 and 3

Project: Espresso Day Coffee Shop
Group: SE-2537
Students: Yerkenaz, Aisha, Dilnaz
Location: Astana, Kazakhstan

About the Project

Espresso Day is a website project for a coffee shop in Astana, Kazakhstan.

The website provides information about the coffee shop, menu, coffee, location, booking and customer reviews.

The pages are written in HTML5 (Assignment 1), were styled with plain CSS (Assignment 2) and are now rebuilt with Bootstrap 5.3.3 (Assignment 3).

Website Pages
index.html — Home page
about.html — About the coffee shop
menu.html — Menu and prices
visit.html — Location, contacts and what to expect at the branch
booking.html — Table booking
coffee.html — Coffee information
reviews.html — Customer reviews

Technologies
HTML5
Semantic HTML
Bootstrap 5.3.3 (CSS and JS bundle from the jsDelivr CDN) plus one small custom stylesheet
GitHub

No JavaScript of our own is used.

HTML Features

The project includes:

Semantic HTML elements
Navigation between pages
Tables
Lists
Images with meaningful alt text
Forms
Links
Contact information
Customer reviews
HTML comments

Team
Yerkenaz
Aisha
Dilnaz

Repository

This project is developed as part of the Web Technologies course at Astana IT University.

Bootstrap (Assignment 3)

Every page links Bootstrap 5.3.3 from the CDN first and css/custom.css second.
css/custom.css is a short correction layer (about 90 lines): brand colours, the heading font and a few small details. It has no layout rules.
The old Assignment 2 stylesheets (base.css, Yerkenaz.css, dilnaz.css, aisha.css) were deleted. removed-css.md lists what was removed and which Bootstrap class replaced it.
Containers: the navigation bar uses container-fluid (full-width burgundy bar), the page content uses container (readable line length).
Responsive blocks: perk cards (index), drink categories (menu), photo cards and customise cards (coffee), plus the two-column layouts on about, visit, reviews and booking.
Component: Card (index, menu, coffee), Table (menu, coffee), List group (visit), Alert (booking); each has a comment naming what was changed.
Logo: images/logo.svg (the Espresso Day logo, vector, from the official site) is shown in the header of every page on a white strip.
Screenshots of index.html at 375, 768 and 1280 px, and of the collapsed phone navigation, are in the screenshots folder.
Photos are in the images folder. The AI log is in ai-log.md.
