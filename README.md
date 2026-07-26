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

### 📋 Research Plan (the "shopping list")
Add every trait you want across any items, and the planner works out the **order
to research them in for the least total time**. Research on a single item is
sequential (one trait at a time), but each craft's slots let different items run
in parallel — so the planner schedules your list across those slots and shows:

- a numbered, ordered research plan per craft with start offset and finish date
  for every step;
- the total time to finish everything (and, for contrast, how long it would take
  done one at a time);
- times based on your current known traits and bonuses.

It uses list scheduling with a "most work remaining first" priority — a fast,
near-optimal way to minimize the total finish time. The plan assumes you start
now with all research slots free, then you follow the order on the Research
Timers tab.

### 🧵 Crafting List (materials shopping list)
Add each item you plan to craft — craft, item, **style (motif)**, trait, quality
and quantity — and it lists exactly what materials each one needs, then rolls it
all up into a single **total shopping list**:

- base materials (Rubedite Ingot, Ancestor Silk, Rubedo Leather, Sanded Ruby Ash,
  Platinum Ounce) named per craft/armor weight;
- 1 style stone per item (named from the chosen motif, e.g. Redguard → Starmetal);
- 1 trait stone per item (e.g. Divines → Sapphire, Nirnhoned → Potent Nirncrux);
- **all** quality-improvement materials up to the chosen tier — a fresh item
  starts white, so a gold item consumes Fine + Superior + Epic + Legendary mats
  (e.g. Honing Stone → Dwarven Oil → Grain Solvent → Tempering Alloy);
- enchant runes if you pick a glyph: 1 potency (Repora/Itade), 1 essence (e.g.
  Okori for Weapon Damage), and 1 aspect rune by quality (Kuta for gold).

Base materials default to **150** per item (CP160) and the per-tier improvement
amounts to **2 / 3 / 4 / 8** (max Temper Expertise); all are editable so the
counts match your level and passives. The combined total is grouped into **Prime
/ Quality / Trait / Style / Enchant Materials** and can be copied to your
clipboard as a plain-text shopping list to mail to a crafter.

### 🎨 Motif Tracker
A grid of motifs with a checkbox for each of the **14 chapters** (one per
equipment slot). Tick what you've learned; a motif reads as fully known at 14/14,
and *all* marks a whole motif at once. Comes preloaded with the full
catalogue of **136 motifs** (with their official Crafting Motif number and a
"where to find" location for each), **grouped by their 39 source zones** (Base
Game, Morrowind, Summerset, Elsweyr, Necrom, Gold Road, Holiday Events, Crown
Store …). Each zone has a collapse toggle and a completion count, with
Collapse-all / Expand-all controls. Add any other motif by name.

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
