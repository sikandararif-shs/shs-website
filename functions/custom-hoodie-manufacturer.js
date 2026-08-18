// functions/custom-hoodie-manufacturer.js
// Serves /custom-hoodie-manufacturer — a dedicated landing page for custom hoodie
// manufacturing. Like portfolio.js, this runs server-side on every request and pulls
// real Airtable images live at request time (never hardcoded, since Airtable attachment
// URLs are signed and expire), so crawlers that don't execute JavaScript see the full
// page on the first request.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblJYQJfU5ywsci3D"; // Portfolio table

// Category field value on the Portfolio table (option id selfDmxwlMwNfvLlb) — Airtable
// formulas compare select fields against their display text, so we filter on the name.
const CATEGORY_NAME = "Spray & Garment Washed Hoodies";

function esc(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

async function fetchHoodieImages(token) {
  const results = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("filterByFormula", `{Category}="${CATEGORY_NAME}"`);
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);
    const data = await res.json();
    for (const rec of data.records) {
      const f = rec.fields;
      if (!f.Image || !f.Image.length) continue;
      const thumb = f.Image[0].thumbnails?.large;
      results.push({
        url: thumb?.url || f.Image[0].url,
        fullUrl: f.Image[0].url,
        width: thumb?.width || f.Image[0].width,
        height: thumb?.height || f.Image[0].height,
        alt: f["Alt Text"] || "SHS Enterprises custom hoodie manufacturing"
      });
    }
    offset = data.offset;
  } while (offset);
  return results;
}

function renderFinishGrid(images) {
  if (!images.length) {
    return `<p class="muted leading-relaxed">New finish photos are added directly from our production floor — see the full gallery in the <a href="portfolio" style="color:var(--red)">Portfolio</a> in the meantime.</p>`;
  }
  return `<div class="finish-grid my-10">${images.map(img => `
      <figure class="finish-item">
        <div class="finish-img" data-lightbox-url="${esc(img.fullUrl)}" data-lightbox-alt="${esc(img.alt)}">
          <img src="${img.url}" alt="${esc(img.alt)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')"${img.width && img.height ? ` width="${img.width}" height="${img.height}"` : ''}>
        </div>
        <figcaption class="finish-caption">${esc(img.alt)}</figcaption>
      </figure>`).join('')}</div>`;
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const token = context.env.AIRTABLE_TOKEN;
  let images = [];
  let dataFetchOk = false;

  if (token) {
    try {
      images = await fetchHoodieImages(token);
      dataFetchOk = true;
    } catch (e) { /* fall through with no images — page still renders with copy */ }
  }

  const ogImage = images[0]?.fullUrl || "https://www.shs-enterprises.com/assets/logo.png";
  const title = "Custom Hoodie Manufacturer";
  const description = "Low MOQ custom hoodie manufacturer for fashion brand. Pullover & kangaroo styles in acid wash, oil wash & spray finishes, Karachi, Pakistan, shipped worldwide.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="https://www.shs-enterprises.com/custom-hoodie-manufacturer">
<link rel="icon" type="image/png" href="assets/favicon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="https://www.shs-enterprises.com/custom-hoodie-manufacturer">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/assets/tailwind.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Custom Hoodie Manufacturing",
  "provider": { "@type": "Organization", "name": "SHS Enterprises", "url": "https://www.shs-enterprises.com" },
  "areaServed": "Worldwide",
  "description": "${esc(description)}",
  "url": "https://www.shs-enterprises.com/custom-hoodie-manufacturer"
}
</script>
<style>
  :root{
    --ink:#0A0A0A; --navy:#0D1B2A; --paper:#FAFAFA; --paper-dim:#F1EEE9;
    --red:#C90201; --red-deep:#750101; --gold:#C39D63; --stone:#726C63; --stone-light:#C9C0B2;
    --line: rgba(10,10,10,0.10); --line-dark: rgba(250,250,250,0.14);
  }
  *{box-sizing:border-box;} html{scroll-behavior:smooth;}
  body{background:var(--paper); color:var(--ink); font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased;}
  .font-display{font-family:'Fraunces',serif;}
  .font-mono{font-family:'JetBrains Mono',monospace;}
  .muted{color:var(--stone);}
  .eyebrow{font-family:'JetBrains Mono',monospace; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; font-weight:500;}
  .nav-blur{backdrop-filter:blur(14px); background:rgba(250,250,250,0.85);}
  .btn-primary{ background:linear-gradient(135deg, var(--red), var(--red-deep)); color:var(--paper); border-radius:999px; padding:0.9rem 1.9rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; transition:all .35s ease; }
  .btn-primary:hover{ transform:translateY(-2px); box-shadow:0 14px 30px -10px rgba(201,2,1,0.55); background:linear-gradient(135deg, var(--red-deep), var(--red)); }
  .btn-secondary{ border:1px solid var(--line-dark); color:var(--paper); border-radius:999px; padding:0.9rem 1.9rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; transition:all .35s ease; }
  .btn-secondary:hover{ border-color:var(--red); color:var(--red); }
  .wa-float{
    position:fixed; bottom:24px; right:24px; z-index:50;
    width:60px; height:60px; border-radius:50%;
    background:#25D366; display:flex; align-items:center; justify-content:center;
    box-shadow:0 10px 30px -8px rgba(0,0,0,0.4);
    transition:transform .3s ease;
  }
  .wa-float:hover{transform:scale(1.08);}

  .navy-hero{
    background:linear-gradient(160deg, var(--navy), var(--ink)); color:var(--paper); position:relative;
  }
  .navy-hero .muted{color:var(--stone-light);}
  .section-fade-bottom::after{
    content:''; position:absolute; left:0; right:0; bottom:0; height:90px;
    background:linear-gradient(to bottom, transparent, var(--paper)); pointer-events:none;
  }

  .content-img-wrap{ max-width:640px; margin-left:auto; margin-right:auto; }
  .content-img{ aspect-ratio:4/5; border-radius:14px; overflow:hidden; background:var(--paper-dim); border:1px solid var(--line); cursor:zoom-in; }
  .content-img img{ width:100%; height:100%; object-fit:cover; transition:transform .5s ease, opacity .4s ease; opacity:0; }
  .content-img img.loaded{ opacity:1; }
  .content-img:hover img{ transform:scale(1.05); }

  .finish-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:1.5rem; }
  .finish-item{ display:flex; flex-direction:column; }
  .finish-img{ aspect-ratio:4/5; border-radius:14px; overflow:hidden; background:var(--paper-dim); border:1px solid var(--line); cursor:zoom-in; }
  .finish-img img{ width:100%; height:100%; object-fit:cover; transition:transform .5s ease, opacity .4s ease; opacity:0; }
  .finish-img img.loaded{ opacity:1; }
  .finish-img:hover img{ transform:scale(1.05); }
  .finish-caption{ font-size:0.8rem; color:var(--stone); margin-top:0.65rem; text-align:center; }

  #lightbox{
    position:fixed; inset:0; z-index:200; background:rgba(10,10,10,0.92);
    display:none; align-items:center; justify-content:center; padding:2rem;
    opacity:0; transition:opacity .3s ease;
  }
  #lightbox.open{ display:flex; opacity:1; }
  #lightbox img{ max-width:min(90vw, 900px); max-height:85vh; object-fit:contain; border-radius:8px; box-shadow:0 30px 80px -20px rgba(0,0,0,0.6); }
  #lightboxClose{
    position:absolute; top:24px; right:28px; width:44px; height:44px; border-radius:50%;
    background:rgba(250,250,250,0.1); border:1px solid var(--line-dark); color:var(--paper);
    font-size:1.5rem; cursor:pointer; display:flex; align-items:center; justify-content:center;
  }
  #lightboxClose:hover{ background:rgba(250,250,250,0.2); }
  section h2{ color:var(--ink); }

  .hamburger{ display:none; flex-direction:column; gap:5px; width:28px; cursor:pointer; background:none; border:none; padding:0; z-index:60; }
  .hamburger span{ display:block; height:2px; width:100%; background:currentColor; border-radius:2px; transition:transform .3s ease, opacity .3s ease; }
  .hamburger.open span:nth-child(1){ transform:translateY(7px) rotate(45deg); }
  .hamburger.open span:nth-child(2){ opacity:0; }
  .hamburger.open span:nth-child(3){ transform:translateY(-7px) rotate(-45deg); }
  .mobile-menu{
    position:fixed; top:0; right:0; bottom:0; z-index:70;
    width:280px; max-width:80vw;
    transform:translateX(100%); transition:transform .4s cubic-bezier(.2,.8,.2,1);
    background:var(--ink); padding-top:100px; overflow-y:auto;
    box-shadow:-10px 0 40px -10px rgba(0,0,0,0.5);
  }
  .mobile-menu.open{ transform:translateX(0); }
  .mobile-menu-inner{ padding:1.5rem 2rem 2rem; display:flex; flex-direction:column; gap:1.4rem; }
  .mobile-menu-inner a{ font-size:1.1rem; font-weight:500; color:var(--paper); }
  @media (max-width: 767px){ .hamburger{ display:flex; } }

  header{ transition:transform .3s ease; }
  header.header-hidden{ transform:translateY(-100%); }
</style>
</head>
<body>

<header class="fixed top-0 left-0 right-0 z-50 nav-blur border-b" style="border-color:var(--line);">
  <div class="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
    <a href="/"><img src="assets/logo-icon.png" alt="SHS Enterprises Logo" class="h-12 w-auto object-contain" width="77" height="112"></a>
    <span class="md:hidden font-bold" style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:1.15rem; letter-spacing:0.04em; color:var(--red);">SHS</span>
    <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
      <a href="/" class="hover:text-[var(--red)]">Home</a>
      <a href="portfolio" class="hover:text-[var(--red)]">Portfolio</a>
      <a href="services" class="hover:text-[var(--red)]">Services</a>
      <a href="about" class="hover:text-[var(--red)]">About</a>
      <a href="blog" class="hover:text-[var(--red)]">Blog</a>
      <a href="watch" class="hover:text-[var(--red)]">Watch</a>
      <a href="contact" class="hover:text-[var(--red)]">Contact</a>
    </nav>
    <button class="hamburger" id="hamburgerBtn" aria-label="Open menu"><span></span><span></span><span></span></button>
    <a href="https://calendly.com/shs-enterprises-pk/discussion-meeting/" target="_blank" rel="noopener" class="btn-primary hidden md:inline-flex !py-2.5 !px-5 !text-[0.85rem]">Schedule a Meeting</a>
  </div>
</header>

<div class="mobile-menu" id="mobileMenu">
  <div class="mobile-menu-inner">
    <a href="/">Home</a>
    <a href="portfolio" class="hover:text-[var(--red)]">Portfolio</a>
    <a href="services" class="hover:text-[var(--red)]">Services</a>
    <a href="about" class="hover:text-[var(--red)]">About</a>
    <a href="blog" class="hover:text-[var(--red)]">Blog</a>
    <a href="watch" class="hover:text-[var(--red)]">Watch</a>
    <a href="contact" class="hover:text-[var(--red)]">Contact</a>
  </div>
</div>
<main>

<section class="pt-40 pb-16 px-6 md:px-10 navy-hero section-fade-bottom">
  <div class="max-w-4xl mx-auto">
    <p class="eyebrow mb-5" style="color:var(--red)">Custom Hoodie Manufacturer</p>
    <h1 class="font-display text-4xl md:text-6xl leading-tight mb-6">Custom Hoodie Manufacturer — Spray-Dyed, Garment-Washed, Built the Way You Actually Designed It</h1>
    <p class="text-lg muted leading-relaxed mb-6">Most hoodie manufacturers hand you back a plain pullover in whatever color you picked from a swatch card. We build the finish into the garment — acid dip, diesel wash, spray application, tiger print — the techniques that make a hoodie look like a product, not a blank. Based in Karachi, Pakistan, working with fashion and streetwear brands worldwide, starting at 50 pieces per style.</p>
    <p class="text-lg muted leading-relaxed mb-10">Every order includes free trend analysis, pricing strategy, and launch support — we stay involved after the samples ship, not just before.</p>
    <div class="flex flex-wrap gap-4">
      <a href="https://calendly.com/shs-enterprises-pk/discussion-meeting/" target="_blank" rel="noopener" class="btn-primary">Schedule a Meeting</a>
      <a href="portfolio" class="btn-secondary">See the Portfolio</a>
    </div>
  </div>
</section>

<div class="px-6 md:px-10">
  <div class="max-w-4xl mx-auto py-4">

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Acid Dip, Diesel Wash, Spray Finish — Real Techniques, Not Just Plain Fleece</h2>
      <p class="muted leading-relaxed mb-6">Anyone can sew a hoodie. Finishing is where the actual craft is, and it's where most low-MOQ manufacturers quietly cut corners because wash and spray processes are harder to control at small batch sizes. This is what we've actually put into production:</p>
      <ul class="space-y-4 muted leading-relaxed mb-4">
        <li><strong style="color:var(--ink)">Acid Dip</strong> — a lilac/purple acid-dip hoodie, sampled internally in 2025. Controlled acid treatment for a faded, mottled colorway that reads intentional, not accidental.</li>
        <li><strong style="color:var(--ink)">Diesel Wash</strong> — a gray diesel-washed hoodie produced for WB Buying House (2023). A heavier, more textured wash finish with visible tonal variation.</li>
        <li><strong style="color:var(--ink)">Spray Finish</strong> — a dark hoodie with speckled spray detailing, produced for Firangi Kapra (2025). Hand-applied spray work for graduated or speckled color effects that can't be replicated with a solid dye lot.</li>
        <li><strong style="color:var(--ink)">Acid Wash</strong> — produced for GenZ Drip (2025). A cleaner, more classic acid-wash treatment.</li>
        <li><strong style="color:var(--ink)">Tiger Print Wash</strong> — a tiger-print garment-washed hoodie, internal sampling, 2025. Pattern-driven wash work layered on top of garment dyeing.</li>
      </ul>

      ${renderFinishGrid(images)}

      <p class="muted leading-relaxed"><a href="portfolio" style="color:var(--red)">See more finishes in the full Portfolio →</a></p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Fabric Weight Matched to the Finish</h2>
      <p class="muted leading-relaxed mb-4">Wash treatment changes what a fabric needs to hold up, so we don't run one blanket GSM across every hoodie style:</p>
      <ul class="space-y-3 muted leading-relaxed">
        <li><strong style="color:var(--ink)">Standard/blank hoodies:</strong> 280–300 GSM.</li>
        <li><strong style="color:var(--ink)">Washed finishes</strong> (diesel wash, acid wash, garment wash, tiger print wash): 320–350 GSM — the heavier weight holds up to the wash process without losing shape.</li>
        <li><strong style="color:var(--ink)">Fully customized designs:</strong> we don't stop at these ranges — on customized demand, we'll go over 400 GSM to match the design.</li>
      </ul>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Real Machinery, Not a Generic Claim</h2>
      <p class="muted leading-relaxed">The same production floor that builds our tees builds our hoodies — Juki single-needle lockstitch for main seaming, Siruba overlock for edge finishing, Jack flatlock for coverstitch hemming and drawstring casings, and Kansai Special for chain-stitch detailing on kangaroo pockets and hood panels. This is what's actually on our floor, not a stock description.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Sourced From the Same Fabric Mills as the Names You Already Know</h2>
      <p class="muted leading-relaxed mb-4">Our fleece and terry stock comes from OEKO-TEX certified mills that also supply brands like DKNY, ZARA, Volcom, and Spider. Order 50 pieces or 5,000 — it's the same raw material tier either way.</p>
      <p class="muted leading-relaxed"><a href="services" style="color:var(--red)">See our full manufacturing process →</a></p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Sample Turnaround and MOQ Built for Brands Starting Out</h2>
      <p class="muted leading-relaxed mb-4">Standard hoodies typically sample in 5–10 days; wash and spray finishes can add time since they're applied and checked in batches, not rushed. We'll always tell you upfront if a finish is going to push the timeline.</p>
      <p class="muted leading-relaxed">MOQ starts at 50–60 pieces per style, and our Promise to Success program lowers minimums further for brands that come back for repeat runs — this isn't just for brands that already have scale, it's built for the first order too.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Who This Is Actually Built For</h2>
      <p class="muted leading-relaxed">Streetwear and fashion labels that want a hoodie with an actual finish, not a blank — first-time founders testing a drop before committing to bulk, small-batch brands who need real photos and real production behind them, and anyone looking for a non-China manufacturing option without giving up quality or MOQ flexibility. Karachi-based, shipping worldwide.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">See It, Don't Just Read About It</h2>
      <p class="muted leading-relaxed mb-4">Come see the wash and spray process in person, or follow along online — we document real production, not stock photography. Follow the day-to-day floor work on <a href="https://www.instagram.com/shs.clothingmanufacturers/" target="_blank" rel="noopener" style="color:var(--red)">Instagram</a> and our <a href="https://pk.linkedin.com/company/shs-enterprises-apparel-manufacturing" target="_blank" rel="noopener" style="color:var(--red)">LinkedIn</a> company page, or come verify it yourself — SHS Enterprises, Karachi, Pakistan.</p>
      <p class="muted leading-relaxed">Explore the full <a href="portfolio" style="color:var(--red)">Portfolio →</a>. Have a question or want to drop an inquiry? <a href="contact" style="color:var(--red)">Get in touch →</a> — our contact page has the form and our location. Also manufacturing oversized tees? <a href="/oversized-t-shirt-manufacturer" style="color:var(--red)">See our tee capabilities →</a>. See our <a href="services" style="color:var(--red)">full services →</a>, or <a href="https://calendly.com/shs-enterprises-pk/discussion-meeting/" target="_blank" rel="noopener" style="color:var(--red)">schedule a visit or strategy call</a>.</p>
    </section>

  </div>
</div>

<div id="lightbox" onclick="if(event.target===this) closeLightbox()">
  <button id="lightboxClose" onclick="closeLightbox()" aria-label="Close">&times;</button>
  <img id="lightboxImg" src="" alt="">
</div>

</main>
<footer class="py-16 px-6 md:px-10 border-t" style="border-color:var(--line);">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
    <div>
      <img src="assets/logo-icon.png" alt="SHS Enterprises" class="h-14 w-auto object-contain mb-4" width="77" height="112">
      <p class="muted text-sm max-w-xs">Low-MOQ clothing manufacturer & full brand growth system for fashion brands. Based in Karachi, working worldwide.</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm">
      <div>
        <p class="font-semibold mb-3">Company</p>
        <ul class="space-y-2 muted">
          <li><a href="/" class="hover:text-[var(--red)]">Home</a></li>
          <li><a href="portfolio" class="hover:text-[var(--red)]">Portfolio</a></li>
          <li><a href="contact" class="hover:text-[var(--red)]">Contact</a></li>
          <li><a href="policies" class="hover:text-[var(--red)]">Policies</a></li>
        </ul>
      </div>
      <div>
        <p class="font-semibold mb-3">Connect</p>
        <ul class="space-y-2 muted">
          <li><a href="https://www.instagram.com/shs.clothingmanufacturers/" class="hover:text-[var(--red)]">Instagram</a></li>
          <li><a href="https://www.facebook.com/shsclothingmanufacturers" class="hover:text-[var(--red)]">Facebook</a></li>
          <li><a href="https://pk.linkedin.com/company/shs-enterprises-apparel-manufacturing" class="hover:text-[var(--red)]">LinkedIn</a></li>
          <li><a href="https://www.youtube.com/channel/UC8FAR87_4C0blSX-GUqddjA" class="hover:text-[var(--red)]">YouTube</a></li>
          <li><a href="https://www.tiktok.com/@shs.apparelsourcing" class="hover:text-[var(--red)]">TikTok</a></li>
        </ul>
      </div>
      <div>
        <p class="font-semibold mb-3">Sponsorships</p>
        <p class="muted text-sm">For sponsorships & collaborations: <a href="mailto:shs.enterprises.pk@gmail.com" class="hover:text-[var(--red)]">shs.enterprises.pk@gmail.com</a></p>
      </div>
    </div>
  </div>
  <div class="max-w-7xl mx-auto mt-14 pt-8 border-t text-xs muted" style="border-color:var(--line);">© <span id="year"></span> SHS Enterprises. All rights reserved. Karachi, Pakistan</div>
</footer>

<a href="#" id="waFloat" target="_blank" rel="noopener" class="wa-float" aria-label="Chat on WhatsApp">
  <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.05-1.32A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.6 0-3.1-.43-4.4-1.18l-.31-.18-3.12.82.84-3.04-.2-.32A7.94 7.94 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.4-5.6c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/></svg>
</a>

<script>
document.getElementById('year').textContent = new Date().getFullYear();

(function(){
  const now = new Date();
  const karachiHour = (now.getUTCHours() + 5) % 24;
  const numberA = "923312195977";
  const numberB = "923032134366";
  const useA = (karachiHour >= 10) || (karachiHour < 1);
  const number = useA ? numberA : numberB;
  const msg = encodeURIComponent("Hi SHS Enterprises, I'm interested in learning more about your custom hoodie manufacturing.");
  document.getElementById('waFloat').href = \`https://wa.me/\${number}?text=\${msg}\`;
})();

function openLightbox(url, alt){
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightboxImg').alt = alt;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-lightbox-url]');
  if (trigger) openLightbox(trigger.dataset.lightboxUrl, trigger.dataset.lightboxAlt);
});
function closeLightbox(){
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLightbox(); });

(function(){
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if(!btn || !menu) return;
  btn.addEventListener('click', () => { btn.classList.toggle('open'); menu.classList.toggle('open'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { btn.classList.remove('open'); menu.classList.remove('open'); }));
})();

</script>
<script>
// Auto-hide header on scroll down, reveal on scroll up — mobile only, to maximize screen space
(function(){
  const header = document.querySelector('header');
  if(!header) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    if(window.innerWidth > 767) { header.classList.remove('header-hidden'); return; }
    const current = window.scrollY;
    if(current > lastScroll && current > 120){
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    lastScroll = current <= 0 ? 0 : current;
  }, { passive:true });
})();
</script>
</body>
</html>`;

  const response = new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "public, max-age=120"
    }
  });

  if (dataFetchOk) context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
