# SHS Enterprises — SEO Tracker

Keep this updated as pages are added. One row per page/section = one thing to check before publishing.

## Pages (live or planned)

| Page | URL | Meta Title | Meta Description | Schema Type | Primary Keywords |
|---|---|---|---|---|---|
| Home | `/` (index.html) | SHS Enterprises — Low-MOQ Clothing Manufacturer in Karachi \| Full Brand Growth System | SHS Enterprises is a low-MOQ clothing manufacturer in Karachi offering end-to-end support for early and growth-stage fashion brands — manufacturing, trend analysis, pricing strategy, marketing and sales strategy, all in one place. | LocalBusiness | clothing manufacturer in Karachi, clothing manufacturer in Pakistan, low-MOQ manufacturer, apparel sourcing |
| Portfolio | `/portfolio.html` | Portfolio — Low-MOQ Clothing Manufacturing in Karachi \| SHS Enterprises | Explore SHS Enterprises' manufacturing portfolio: polos, hoodies, denim, jerseys and more — low-MOQ apparel production in Karachi for early and growth-stage fashion brands. | CollectionPage | polo t-shirts manufacturer in Karachi, hoodies manufacturer in Karachi, clothing factory |
| About Us | `/about.html` | *(pending build)* | | AboutPage / Organization | who is SHS Enterprises, apparel manufacturing partner Karachi |
| Services | `/services.html` | *(pending build)* | | Service | manufacturing + brand growth services Pakistan |
| Contact | `/contact.html` | *(pending build)* | | ContactPage | contact clothing manufacturer Karachi |
| Watch Our Content | `/watch.html` | *(pending build)* | | — | — |
| Blog index | `/blog.html` | *(pending build)* | | Blog | fashion brand strategy Pakistan, apparel manufacturing tips |
| Blog post (template) | `/blog-post.html?slug=...` | Pulled from Airtable "Title" field | Pulled from Airtable "Excerpt" field | BlogPosting | Set per-post in Airtable |

## Portfolio category slugs (must match Airtable "Category" field exactly — case sensitive)

| Category (Airtable value) | Anchor ID on page | Status |
|---|---|---|
| Old Money Styles | `#old-money-styles` | Images pending Airtable upload |
| Garment Washed Hoodies | `#garment-washed-hoodies` | Images pending Airtable upload |
| Balaclava Hoodies | `#balaclava-hoodies` | Images pending Airtable upload |
| Oversized Tees | `#oversized-tees` | Images pending Airtable upload |
| Screen Printed Tees | `#screen-printed-tees` | Images pending Airtable upload |
| Denim Bottoms | `#denim-bottoms` | Images pending Airtable upload |
| Sublimated Basketball Jerseys | `#sublimated-basketball-jerseys` | Images pending Airtable upload |
| Graphic Printed Tees | `#graphic-printed-tees` | New — no images yet |
| Sweatpants | `#sweatpants` | New — no images yet |
| Sweatshirts | `#sweatshirts` | New — no images yet |

**Important:** the Portfolio page pulls images live from Airtable's `Category` field — it does not use any locally-stored images, even for the original 7 categories. That means **all 10 categories' images need to be uploaded to Airtable** (including the original 10 photos from your first portfolio zip) for anything to actually display. Until then, every category shows a "New pieces coming soon" placeholder — this is expected behavior, not a bug.

## Target keyword bank (from your brief — track usage so we don't over/under-use any one term)

clothing manufacturer in Karachi · clothing manufacturer in Pakistan · polo t-shirts manufacturer in Karachi · clothing factory · low-MOQ manufacturer · apparel sourcing · hoodies manufacturer in Karachi · heavy GSM · lightweight cotton fabric · ring spun cotton · French terry fabric · interlock smooth fabric · single jersey · sherpa fleece · paneled polos · co-ord sets · pullover hoodies · kangaroo hoodies · diesel wash · acid wash · mineral wash · tie and dye · bomber jackets · denim jackets · denim jorts · denim jeans · sweatpants · sweatshirts · terry shorts · scuba tees · waffle tees · patchwork

## Standing rules for every new page going forward

1. Every page gets a unique `<title>` and `<meta name="description">` — never duplicate across pages.
2. Every page gets one JSON-LD schema block matching its actual content type (don't reuse LocalBusiness everywhere).
3. Every image gets real, specific alt text — never "image1.jpg" or a blank alt.
4. Every new URL gets a clean, hyphenated slug — no query-string-only pages where avoidable (blog posts are the one exception, using `?slug=`, documented above).
5. Update this tracker the same day a new page ships — an out-of-date tracker is worse than none, since it creates false confidence.
