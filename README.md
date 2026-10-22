# Bijli — Load-Shedding Alert & UPS Planner

**A UX concept for Pakistan's winter load-shedding problem.** Every winter (Nov–Feb),
Pakistani cities return to unscheduled power cuts — K-Electric, LESCO, and other DISCOs
publish no reliable block-wise schedule, evening routines get ambushed, UPS batteries die
mid-evening, and buying an inverter/UPS (Rs 45,000–150,000) is pure guesswork on sizing.
Bijli is a mobile-first concept that fixes all three: **know every cut before it hits,
buy a UPS sized to your actual wattage, and let neighbours warn each other in one tap.**

> **Sample-data honesty note:** every outage schedule, appliance wattage, UPS package,
> and PKR price in this demo is **illustrative sample data invented for the concept**.
> These are NOT real DISCO schedules and NOT real market prices. A real app would pull
> live feeder data and current retailer prices.

## How it works

The demo has three tabs, all working in your browser with no build step:

1. **Alerts** — Pick your area (8 sample areas across Karachi, Lahore, Islamabad,
   Peshawar, Rawalpindi, Quetta, Multan, and Faisalabad). The app renders today's
   outage timeline as a 24-hour bar with red cut blocks and a "now" marker, shows a
   live **Power ON / Power OFF** status chip, a countdown to the next cut
   ("Outage in 45 min"), and the list of upcoming cuts with durations. Your area is
   saved on the device (localStorage), so it survives a refresh.

2. **UPS Planner** — Tick the appliances you want backed up (each carries a typical
   wattage — ceiling fan 75W, LED bulb 12W, TV 150W, fridge 200W, …), drag the
   backup-hours slider (1–8 hrs), and the app computes your **total load in watts**
   and the energy you need in Wh. It then recommends the **cheapest of 6 sample
   UPS/inverter packages** (sample PKR prices) that covers your load with 25% headroom
   *and* runs for your chosen hours — with an estimated runtime figure.

3. **Community** — A big red **Report outage** button: one tap increments today's
   report counter for your area (stored per area per day in localStorage), a
   **voltage-fluctuation log** (248V high / 221V normal / 167V low) with color-coded
   bands, and stabilizer guidance so appliances survive the spike when power slams
   back on.

### The maths (in plain words)

- **Total load** = sum of (watts × quantity) for every ticked appliance.
- **Energy needed** = load × hours (watt-hours).
- **Usable battery energy** = Ah × volts × 50% depth of discharge × 85% inverter
  efficiency. (Lead-acid batteries shouldn't be drained fully — 50% keeps them alive.)
- **Runtime** = usable energy ÷ load.
- **Recommendation** = the cheapest package whose inverter rating (kVA × 1000)
  covers your load with 25% headroom AND whose runtime beats your chosen hours.
- **Status logic** = current time is checked against the area's cut windows;
  if you're inside one, you get the restore countdown, otherwise the next-cut countdown.

## Project structure

```
bijli-demo/
├── index.html   — page skeleton: header, tab nav, three tab panels
├── style.css    — volt-yellow (#EAB308) on dark slate (#0F172A), mobile-first cards
├── data.js      — sample areas, appliances, UPS packages, voltage log (all invented)
├── logic.js     — pure functions: no DOM, no storage — easy to test
├── app.js       — renders the UI, wires events, localStorage persistence
├── test.js      — 59 smoke-test assertions (run: node test.js)
├── dom_smoke.js — jsdom UI smoke test (run: node dom_smoke.js)
└── check_ids.js — verifies every JS-referenced id exists in the HTML
```

## What you can learn from this project

- **Separating logic from rendering.** `logic.js` has zero DOM code — every function
  is a plain input → output. That makes it trivially testable with plain
  `node assert` (see `test.js`), a habit that pays off in every project you build.
- **Time math without libraries.** Outage windows are stored as `"HH:MM"` strings;
  `parseTime` turns them into minutes and all status/countdown logic is simple
  integer comparison. You don't need a date library for a day-planner.
- **localStorage as a tiny database.** The saved area and per-day report counters
  show how to persist state with `JSON.parse`/`JSON.stringify` plus a
  try/catch fallback — no backend needed for a concept demo.
- **Constraint-based recommendation.** The UPS picker is a small filter+sort:
  filter packages by two constraints (power headroom, runtime), sort by price, take
  the first. That pattern powers every "find me the cheapest X that fits" feature.
- **Designing for honesty.** Sample data is labeled everywhere (sample-note banner,
  "sample price" tags, this README) — a concept demo that pretends to be real data
  misleads users; one that labels itself earns trust.

## Fork it and make it yours

Clone this and adapt the pattern to **your own city and your own problem**:

- Replace the 8 sample areas in `data.js` with your neighbourhood and your DISCO's
  real schedule (or wire in a live API later — the `currentStatus` function won't care
  where the windows come from).
- Swap the appliance list for your home's actual devices — measure with a cheap
  plug meter and put the real numbers in.
- Replace the 6 sample packages with quotes from your local market and see what the
  maths actually recommends.
- Add a new tab — e.g. a **bill estimator** that prices your UPS usage in PKR.

If you build something with it, I'd love to see it. Happy hacking!
