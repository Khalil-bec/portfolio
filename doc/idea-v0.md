# Portfolio idea v0
Personal portfolio for a CS student targeting DevOps / Cloud / SRE roles.
Flow, theme and scroll feel inspired by https://getartcraft.com/ — dark theme,
marquee ticker, numbered sections, scroll-revealed rows. Reimplemented from
scratch with my own content and code.

## Stack
Vanilla HTML/CSS/JS (ES modules), no build step. Lenis 1.3.x (lerp ~0.12, anchors on)
for smooth scroll + GSAP 3.15 / ScrollTrigger for reveals. Libraries vendored locally.

## Sections
Hero · Projects · Skills · Education · Contact

## Language
English + French with a visible switch (EN/FR). Choice persists (localStorage),
default from navigator.language, <html lang> updated. All text from doc/content.md
dictionaries; no hardcoded copy in HTML except keys (data-i18n="projects.title").

## Constraints
Mobile-first, prefers-reduced-motion disables Lenis + animations, keyboard accessible,
Lighthouse performance > 90, hosting TBD (static files only).