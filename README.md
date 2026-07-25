# SHS Enterprises — Website

Live at [shs-enterprises.com](https://www.shs-enterprises.com). This is the source repository, connected to Cloudflare Pages via GitHub — every push to `main` deploys automatically.

---

## Structure

```
├── index.html          Homepage
├── services.html        Full Service Range
├── about.html           About Us — vision, mission, TEDxLyari sponsorship
├── contact.html          Contact — lead form wired to Airtable
├── watch.html            Instagram content
├── assets/               Logo, favicon, client logos
└── functions/
    ├── portfolio.js         Portfolio — server-rendered from Airtable, live
    ├── blog.js              Blog index — server-rendered from Airtable
    ├── blog-post.js         Single blog post reader
    ├── policies.js          Policies index — server-rendered from Airtable
    ├── policy.js            Single policy reader
    └── api/                Contact form endpoint, plus legacy read-only endpoints
```

## The core idea: most content lives in Airtable, not in these files

Portfolio, Blog, and Policies pages are not static HTML — they're Cloudflare Functions that fetch straight from Airtable and build the complete page on every visit. This means:

- **New Portfolio photos, Blog posts, or Policies show up on the live site automatically** the moment you publish them in Airtable — no upload, no redeploy, nothing to do here at all
- The Portfolio category names, headings, and SEO paragraphs *do* live in code (`functions/portfolio.html.js`, near the top, in the `CATEGORIES` array) — because Airtable only stores which category an image belongs to, not the marketing copy around it. Adding a genuinely new category (not just a new photo in an existing one) means adding a new entry there.

## Editing content that lives in Airtable

Open your **SHS Website** base. Three tables matter here:
- **Portfolio** — Image, Category, Alt Text, Caption, Featured
- **Blogs** — Title, Slug, Banner Image, Excerpt, Body Text (supports `#`/`##` headers, `**bold**`, `- lists`, and `[image-1]` style markers for inline photos), Category, Date Published, Published
- **Policies** — same shape as Blogs, plus Effective From. Category must be exactly `External Policy` or `Internal Policy`.

Nothing goes live until **Published** is checked — for Blogs and Policies. **Portfolio has no Published gate**: any image added to that table appears on the live site immediately, so only add images there when they're ready to be public.

## Editing content that lives in code

Everything else — headline copy, the "Our Difference" section, service descriptions, the About Us story, FAQ answers — is written directly into the relevant `.html` file as plain text. Open the file, find the text, edit it, re-upload.

## Deploying

**Always through GitHub — never Cloudflare's "Upload assets" screen.** That upload method doesn't support the Functions this site depends on and will silently break Portfolio, Blog, and Policies.

1. On GitHub, open this repo
2. **Add file → Upload files**
3. Drag in whatever changed
4. **Commit changes**
5. Cloudflare picks it up and redeploys within a minute or two — nothing else to do

## Required environment variable

`AIRTABLE_TOKEN` must be set in Cloudflare → this project → **Settings → Environment Variables**, scoped to **Production**, as a **Secret**. Without it, Portfolio/Blog/Policies will render with empty placeholders instead of real content.
