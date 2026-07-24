# ⚒ ESO Crafting Helper

A lightweight, offline tool for tracking **Elder Scrolls Online** crafting
**trait research** — the real-time timers, which traits you've unlocked for each
piece of gear, and how your skills and membership bonuses shorten the wait.

No install, no server, no account. Open `index.html` in any browser and
everything saves locally to that browser.

## What it does

### 🕓 Research Timers
Pick a craft, an item, and a trait, and it starts a countdown. The time is
calculated from **how many traits you already know for that specific item**
(research doubles with each trait) and then reduced by your passive rank, ESO
Plus, and any other bonus you set. Each timer shows a live countdown, the exact
finish date/time, and a progress bar. Timers persist across page reloads because
they're stored with real timestamps.

### 🧩 Trait Tracker
A grid of every craftable item vs. every trait. Tick off the traits you've
already researched. The per-item count (e.g. `4 / 9`) is what determines your
**next** research time for that item, so keeping this current keeps the timer
math accurate. Cells you're actively researching are highlighted.

### ⚙️ Skills & Bonuses
Set the rank of each craft's research passive and it applies automatically:

| Passive rank | Research reduction | Simultaneous research slots |
|:------------:|:------------------:|:---------------------------:|
| 0 (none)     | 0%                 | 1 |
| 1            | 5%                 | 2 |
| 2            | 10%                | 2 |
| 3            | 20%                | 3 |
| 4            | 25%                | 3 |

The research passive is called **Metallurgy** (Blacksmithing), **Stitching**
(Clothing), **Carpentry** (Woodworking), and **Lapidary Research** (Jewelry).
**ESO Plus** adds another 10% and stacks *multiplicatively*. An "other reduction"
field lets you fold in any additional buff.

> **Champion Points note:** the live game has no Champion Point that reduces
> trait research time — research reductions come from the crafting passive and
> ESO Plus. The "other reduction" field is provided so you can account for any
> future/event bonus yourself.

### 📖 Reference
Base research time per trait number, plus the full effect of every weapon,
armor, and jewelry trait.

## Crafting data included

- **Blacksmithing** — 7 weapons + 7 heavy armor pieces (weapon / armor traits)
- **Clothing** — 7 light + 7 medium armor pieces (armor traits)
- **Woodworking** — 5 staves/bow + shield (weapon / armor traits)
- **Jewelry Crafting** — ring, necklace (jewelry traits)

## Research time reference

The 1st trait on an item takes 6 hours; each additional trait on that same item
doubles, capped at 30 days:

| Trait # | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|--------:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Base time | 6h | 12h | 1d | 2d | 4d | 8d | 16d | 30d | 30d |

Effective time = base × (1 − passive) × (1 − ESO Plus) × (1 − other),
all stacking multiplicatively.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page layout and tabs |
| `styles.css` | Styling (dark Elder-Scrolls theme) |
| `data.js`    | ESO crafts, items, traits, research times, passive ranks |
| `app.js`     | Timer logic, trait tracking, persistence |

## Data & backups

All state lives in your browser's `localStorage`. Use **Skills & Bonuses →
Data** to export a JSON backup, import it on another device, or reset
everything.

---

*Fan-made helper. Not affiliated with ZeniMax or Bethesda.*
