# Flipleo

**Flipleo is a profit tracker for resellers.** If you buy items (at online auctions, thrift stores, garage sales), fix them up or upgrade them, and resell them, Flipleo keeps track of every item from "watching the auction" to "sold", and shows you what you actually made.

This repository is the **web front end** (Angular). It talks to the [Flipleo API](../flipleo.API) (.NET), which stores data in the [Flipleo database](../flipleo.Database) (SQL Server).

---

## What you can do

### Track auctions
- Save auctions you're watching or bidding on (eBay, ShopGoodwill, …) with a link, image, current price, start/end time and notes.
- See a live countdown on every auction, highlighted in red in the last 3 hours.
- Filter by **Active**, **Ending in 24h** or **Ended**, and search by name or notes.
- Won it? Click **Won it → Add Flip** and the auction becomes a flip, pre-filled with the name, image and price you paid.

### Track flips
- Record every item you buy: name, image, buy price, and the date you bought it.
- Move it through **Bought → Listed → Sold**. Add an asking price while it's listed, and a sell price and sold date once it sells.
- See **profit** and **ROI** on every sold flip, and **expected profit** (in grey) on anything listed with an asking price.
- Summary tiles at the top: **Total Profit**, **Average ROI**, **Unsold Inventory** (money tied up in items not sold yet) and **Total Flips**.
- Filter by status, search by item or add-on name, and switch between **card** and **table** views.

### Add-ons (parts and upgrades)
- Add the parts, repairs or upgrades you put into a flip (for example TMR joysticks for a PS5 controller). Their cost is added up as the flip's **parts price** and taken out of the profit.
- Save the ones you use often to **My Add-Ons**, then pick them from a checklist next time.
- Picking a saved add-on copies its price onto the flip, so changing a saved add-on later never changes your past flips.

### Your account
- Create an account and sign in. Everything you add is private to your account.
- Forgot your password? Request a reset link by email. The link works once and expires after an hour.

---

## How profit is calculated

| Value | Formula |
|---|---|
| Parts price | Sum of the flip's add-on prices |
| Profit | Sell price − buy price − parts price (**only once the flip is Sold**) |
| Expected profit | Asking price − buy price − parts price (unsold flips; not counted in Total Profit) |
| ROI | Profit ÷ (buy price + parts price) |
| Unsold inventory | Buy price + parts price of every flip that isn't Sold |

---

## Tech stack

- **Angular 20** with standalone components, signals and the built-in control flow (`@if`, `@for`)
- **Angular Material** (Material 3 theme) and the Inter font
- JWT authentication against the Flipleo API (`authInterceptor` adds the token, `authGuard` protects pages)
- Hosted at [flipleo.com](https://flipleo.com) (GitHub Pages, see `CNAME`)

## Getting started

**Prerequisites:** Node.js (LTS), the Angular CLI (`npm install -g @angular/cli`), and the Flipleo API running locally (see its README).

```bash
npm install
ng serve
```

Open `http://localhost:4200`, then **Create an account** on the sign-in page. The API URL comes from `src/environments/environment.ts` (default `http://localhost:5142`).

| Command | What it does |
|---|---|
| `ng serve` | Dev server with live reload on port 4200 |
| `ng build` | Production build to `dist/` (uses `environment.prod.ts`) |
| `ng test` | Unit tests |

## Project structure

```
src/app/
  core/          guards, HTTP interceptors, app-wide services (auth, confirm dialog)
    services/data/   one data service per API controller
  shared/        reusable components (nav bar, stat tile, confirm dialog, image link field) and models
  pages/         one folder per page: home, login, forgot/reset password, flip-records, auctions
src/styles.scss  design tokens (colors, radius, shadows) and shared layout classes (.fl-*)
src/environments environment.ts (local) and environment.prod.ts
```

## Conventions

The full conventions (architecture, patterns, decisions and how-to recipes for UI, API and database) are in the **FlipLeo Developer Handbook** (`FlipLeo Developer Handbook.docx`). The short version for this repo:

- Components never call `HttpClient` directly; they use a data service from `core/services/data`.
- Pages own the data and call the API. Dialogs and child components just collect input and hand it back.
- Destructive actions always ask first (`ConfirmDialogService`).
- Use the shared design tokens (`var(--fl-…)`) instead of hard-coded colors, and keep each component's styles under the 4 kB budget.
- Calendar dates (bought/sold) are `yyyy-MM-dd` strings built from the local date. Never use `toISOString()` for them.
