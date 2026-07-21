// functions/portfolio.js
// Serves /portfolio.html — but unlike a static file, this runs server-side on every
// request: fetches the Portfolio table from Airtable, and bakes every image, alt text,
// caption, and category paragraph DIRECTLY into the HTML response. This means crawlers
// that don't execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, etc.) see the full
// real content on the very first request — not an empty shell waiting on a client-side
// fetch() call. Human visitors see zero difference; this is purely about who else can read it.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblJYQJfU5ywsci3D"; // Portfolio table

const CATEGORIES = [
  { slug: "Old Money Styles", h1: "Old Money Style Polos — Polo T-Shirt Manufacturer in Karachi",
    copy: "Old money fashion is built on timeless silhouettes, premium fabrics, and refined details that never go out of style. At SHS, we manufacture pique polo, retro-inspired ribbed polos, linen shirts, button-down shirts, and sporty vintage styles using ring spun cotton, PC blends, and rib cotton for fashion brands looking to create premium collections. As a polo manufacturer in Karachi, we support low-MOQ production for startups and established labels developing high-quality unisex clothing with consistent craftsmanship." },
  { slug: "Graphic/Puff/Embroidery/Screen Printed Tees", h1: "Graphic, Puff, Embroidery & Screen Printed Tees — Karachi",
    copy: "Graphic tees continue to be one of the strongest-selling categories for every modern fashion brand, making quality printing and garment construction essential. SHS manufactures premium boxy fit and dropped shoulder T-shirts with DTF printing, puff prints, high-density graphics, and detailed embroidery on T-shirts using low-MOQ production. Whether you're launching your first collection or expanding an existing label, our screen printing capabilities are built for brands that want standout designs without compromising quality." },
  { slug: "Sublimation Articles", h1: "Sublimation Articles — Polyester Manufacturing in Karachi",
    copy: "From basketball jerseys to tracksuits, SHS manufactures premium sublimation apparel using polyester interlock, bird eye mesh, polyester mesh, scuba fabric, and fleece-based performance materials. As a trusted sportswear manufacturer, we produce low-MOQ jackets, activewear, and teamwear with vibrant full-coverage sublimation prints that remain durable through repeated use. We also support emerging activewear brands with fabric recommendations and production guidance from sampling to bulk manufacturing." },
  { slug: "Spray & Garment Washed Hoodies", h1: "Spray & Garment Washed Hoodies — Hoodies Manufacturer in Karachi",
    copy: "Our washed hoodie collection combines premium construction with fashion-forward finishing techniques to create pieces that feel unique from the very first wear. SHS manufactures balaclava hoodies, kangaroo hoodies, zip-up hoodies, and pullovers using heavy GSM French Terry and cotton fleece with acid washing, diesel washing, spray finishes, and dip dyeing effects. Every wash is carefully controlled to achieve a premium vintage aesthetic while maintaining fabric durability." },
  { slug: "Washed Oversized Tees", h1: "Oversized T-Shirt Manufacturer in Karachi — Ring-Spun Cotton Manufacturing",
    copy: "As an oversized t-shirt manufacturer in Karachi, SHS specializes in producing washed oversized T-shirts with premium ring-spun cotton for a softer hand feel and longer garment life, serving modern streetwear brands. Our production includes acid wash, stone wash, mineral wash, garment wash, and tie-dye finishes, all available in low MOQs for growing fashion brands. Each wash creates its own unique character, allowing collections to stand apart in an increasingly competitive market." },
  { slug: "Fleece Sweatshirts", h1: "Fleece Sweatshirts Manufacturer in Karachi",
    copy: "Sweatshirts remain one of the most dependable winter essentials for every fashion brand because they combine comfort, versatility, and year-round demand. SHS manufactures cotton fleece, PC fleece, French Terry sweatshirts, and panelled sweatshirts in multiple fits and fabric weights to match your collection. Whether you're developing minimalist basics or statement pieces, our low-MOQ production helps brands launch winter collections with confidence." },
  { slug: "Denim Bottoms", h1: "Denim Jorts & Jeans Manufacturer in Karachi",
    copy: "Denim is often the next milestone for fashion brands ready to expand beyond basics, and SHS makes that transition possible with flexible low-MOQ production. As a low MOQ denim manufacturer in Karachi, we produce jeans, jorts, jackets, reversible denim pieces, and heavyweight fashion articles while guiding brands through fabric selection, washes, trims, and finishing techniques. Save your inspiration from Pinterest or anywhere else, share your ideas with us, and we'll help transform them into commercially viable products with the right balance of design, durability, and manufacturing cost." },
  { slug: "French Terry & Jersey Shorts, Joggers & Trousers", h1: "Terry Trouser Manufacturer in Karachi — French Terry & Jersey Bottoms",
    copy: "As a terry trouser manufacturer in Karachi, SHS produces premium French Terry and jersey bottoms designed for comfort, durability, and modern fits, whether you're building a streetwear collection or everyday essentials. Our production includes joggers, shorts, cargos, and relaxed trousers using cotton French Terry, single jersey, fleece, and other knitted fabrics with flexible low-MOQ manufacturing. From oversized silhouettes to clean everyday basics, we help brands create bottoms that customers actually wear on repeat." },
  { slug: "Spray Tees", h1: "Spray Tees — Unique Wash Effects, Manufactured in Karachi",
    copy: "Fashion rewards originality, and spray-effect garments are one of the most affordable ways to launch distinctive collections. SHS produces low-MOQ spray T-shirts featuring airbrushed graffiti effects, bleach sprays, fabric spray paints, and experimental finishing techniques that give every garment its own identity. If you have an unconventional design idea, we'll work with you to develop a production-ready version that fits your brand." },
  { slug: "Unique Fashion Styles", h1: "Unique Fashion Styles — Custom Apparel Sourcing in Karachi",
    copy: "Some garments can't be found in a catalogue—they have to be developed from scratch. Through our custom apparel sourcing and manufacturing capabilities, we've produced reversible crochet denim jackets, mirror-panel old money polos, balaclava hoodies, padded vests, multi-panel oversized garments, and other technically challenging fashion pieces for ambitious brands. If you're serious about building a memorable fashion brand instead of another copy, bring us your concept and we'll help turn it into a production-ready collection worthy of joining SHS's growing portfolio of unique apparel." }
];

const FAQS = [
  { q: 'Where to get hoodies manufactured in Karachi?', a: "SHS Enterprises manufactures hoodies in Karachi — including garment-washed, acid-washed, and balaclava styles — at low-MOQ volumes, with quality control built into every stage of production." },
  { q: 'Who can manufacture polo t-shirts in Karachi?', a: "SHS Enterprises manufactures polo t-shirts in Karachi, including old-money and premium ribbed styles, at low-MOQ volumes suited to early-stage brands rather than bulk retailers." },
  { q: 'How to launch a clothing brand in Pakistan?', a: "Launching a clothing brand in Pakistan typically means navigating manufacturing, pricing, positioning, and marketing largely on your own — which is exactly the gap SHS Enterprises was built to close. Instead of just producing your garments, SHS supports the full launch process: trend analysis, budget allocation, brand positioning, and sales strategy, alongside the manufacturing itself." },
  { q: 'What should you look for in a clothing manufacturer in Karachi?', a: "Rather than ranking specific companies — which varies constantly and depends on what a brand actually needs — the real question is what to evaluate: MOQ flexibility, quality control process, communication during production, and whether the manufacturer offers any support beyond just producing garments. SHS Enterprises was built to score well on all four, particularly the last one, where most manufacturers offer nothing at all." },
  { q: 'What should you look for in a clothing manufacturer in Pakistan?', a: "Same principle nationally: reliability, MOQ suited to your stage, transparent pricing, and — increasingly important for early-stage brands — whether the manufacturer helps with anything beyond production. SHS Enterprises is one of the only manufacturers in Pakistan offering trend analysis, pricing strategy, and marketing support alongside low-MOQ manufacturing, at no added cost." },
  { q: 'How to start a brand with no manufacturing experience?', a: "This is precisely who SHS Enterprises is built for. A brand only needs to bring the concept — SHS handles product development, sampling, sourcing, manufacturing, and the business research most new founders don't have time or experience to do themselves." },
  { q: 'How long does a production run take from concept to delivery?', a: "Timelines depend on the product and order size, but the process moves through sampling, revisions, manufacturing, quality control, and delivery — with SHS managing communication at every stage so brands always know where their order stands." }
];

function slugToId(s) { return s.toLowerCase().replace(/[^\w]+/g, '-'); }
function esc(s) { return (s || '').replace(/"/g, '&quot;'); }

async function fetchPortfolioData(token) {
  let records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);
    const data = await res.json();
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);

  const grouped = {};
  const hallOfFame = [];
  for (const rec of records) {
    const f = rec.fields;
    if (!f.Image || !f.Image.length) continue;
    const category = f.Category || "Uncategorized";
    const item = {
      url: f.Image[0].thumbnails?.large?.url || f.Image[0].url,
      fullUrl: f.Image[0].url,
      alt: f["Alt Text"] || `${category} — SHS Enterprises manufacturing`,
      caption: f["Caption"] || "",
      category
    };
    if (f["Hall of Fame"]) {
      hallOfFame.push(item);
    } else {
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    }
  }
  return { grouped, hallOfFame };
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const token = context.env.AIRTABLE_TOKEN;
  let grouped = {};
  let hallOfFame = [];
  let totalImages = 0;
  let dataFetchOk = false;

  if (token) {
    try {
      const data = await fetchPortfolioData(token);
      grouped = data.grouped;
      hallOfFame = data.hallOfFame;
      Object.values(grouped).forEach(arr => totalImages += arr.length);
      dataFetchOk = true;
    } catch (e) { /* fall through with empty grouped — page still renders with copy and placeholders */ }
  }

  // Hall of Fame: a dedicated, gold-styled section pulling any image flagged in Airtable,
  // regardless of its actual category — the item stays in its normal category section too.
  const hallOfFameHtml = hallOfFame.length ? `
    <section id="hall-of-fame" class="py-16 md:py-20 px-0 relative section-fade-bottom" style="background:linear-gradient(135deg, #B8963E, #E8CD8A, #B8963E);">
      <div class="max-w-7xl mx-auto px-6 md:px-10">
        <p class="eyebrow mb-3" style="color:#4A3A14; letter-spacing:0.22em;">★ SHS's Hall of Fame ★</p>
        <p class="mb-6 max-w-2xl" style="color:#4A3A14; font-style:italic;">The pieces every fashion brand dreams of seeing their name attached to — our most technically ambitious, most talked-about work. Bring us your concept, and earn your place here.</p>
        <h2 class="font-display text-3xl md:text-4xl mb-8" style="color:#2E2408;">SHS's Hall of Fame</h2>
        <div class="cat-grid">${hallOfFame.map(img => `
          <div>
            <div class="cat-img" onclick="openLightbox('${img.fullUrl}', '${esc(img.alt)}')"><img src="${img.url}" alt="${esc(img.alt)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')"></div>
            ${img.caption ? `<p class="cat-caption" style="color:#4A3A14; opacity:1;">${esc(img.caption)}</p>` : ''}
          </div>`).join('')}
        </div>
      </div>
    </section>` : '';

  const categorySections = CATEGORIES.map(cat => {
    const images = grouped[cat.slug] || [];
    const grid = images.length
      ? images.map(img => `
          <div>
            <div class="cat-img" onclick="openLightbox('${img.fullUrl}', '${esc(img.alt)}')"><img src="${img.url}" alt="${esc(img.alt)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')"></div>
            ${img.caption ? `<p class="cat-caption">${esc(img.caption)}</p>` : ''}
          </div>`).join('')
      : Array.from({length:4}).map(() => `<div class="empty-slot">New pieces coming soon</div>`).join('');

    return `
    <section id="${slugToId(cat.slug)}" class="py-16 md:py-20 px-0">
      <div class="max-w-7xl mx-auto">
        <h2 class="font-display text-3xl md:text-4xl mb-4">${cat.h1}</h2>
        <p class="muted max-w-3xl mb-8 leading-relaxed">${cat.copy}</p>
        <div class="cat-grid">${grid}</div>
      </div>
    </section>`;
  }).join('');

  const faqHtml = FAQS.map(f => `
    <div class="accordion-item rounded-xl border overflow-hidden" style="border-color:var(--line);">
      <button class="w-full flex items-center justify-between text-left px-6 py-5 font-medium" type="button">
        ${f.q}<span class="chev text-2xl" style="color:var(--red)">+</span>
      </button>
      <div class="accordion-panel px-6"><p class="muted pb-6">${f.a}</p></div>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio — Low-MOQ Clothing Manufacturing in Karachi | SHS Enterprises</title>
<meta name="description" content="Explore SHS Enterprises' manufacturing portfolio: polos, hoodies, denim, jerseys and more — low-MOQ apparel production in Karachi for early and growth-stage fashion brands.">
<link rel="canonical" href="https://www.shs-enterprises.com/portfolio">
<link rel="icon" type="image/png" href="assets/favicon.png">
<meta property="og:title" content="Portfolio — SHS Enterprises">
<meta property="og:description" content="Low-MOQ apparel manufacturing across polos, hoodies, denim, jerseys and more — produced in Karachi.">
<meta property="og:image" content="https://www.shs-enterprises.com/assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"></noscript>
<script src="https://cdn.tailwindcss.com"></script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "SHS Enterprises Manufacturing Portfolio",
  "description": "Low-MOQ apparel manufacturing portfolio — polos, hoodies, denim, jerseys, tees and more, produced in Karachi, Pakistan.",
  "url": "https://www.shs-enterprises.com/portfolio",
  "isPartOf": { "@type": "WebSite", "name": "SHS Enterprises", "url": "https://www.shs-enterprises.com" }
}
</script>
<style>
  :root{
    --ink:#0A0A0A; --navy:#0D1B2A; --paper:#FAFAFA; --paper-dim:#F1EEE9;
    --red:#C90201; --red-deep:#750101; --gold:#C39D63; --stone:#827C74; --stone-light:#C9C0B2;
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
  .cat-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:1rem; }
  .cat-img{ aspect-ratio:4/5; border-radius:14px; overflow:hidden; background:var(--paper-dim); border:1px solid var(--line); cursor:zoom-in; }
  #hall-of-fame .cat-img{ border-color:rgba(46,36,8,0.35); background:rgba(46,36,8,0.06); }
  #hall-of-fame .empty-slot{ border-color:rgba(46,36,8,0.4); color:#4A3A14; }
  .cat-img img{ width:100%; height:100%; object-fit:cover; transition:transform .5s ease, opacity .4s ease; opacity:0; }
  .cat-img img.loaded{ opacity:1; }
  .cat-img:hover img{ transform:scale(1.05); }
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
  .fade-to-gold::after{
    content:''; position:absolute; left:0; right:0; bottom:0; height:90px;
    background:linear-gradient(to bottom, transparent, #B8963E); pointer-events:none;
  }

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
  .cat-caption{ font-style:italic; font-size:0.78rem; color:var(--gold); margin-top:0.5rem; opacity:0.85; }
  .empty-slot{ aspect-ratio:4/5; border-radius:14px; border:1px dashed var(--gold); opacity:0.5; display:flex; align-items:center; justify-content:center; color:var(--gold); font-family:'JetBrains Mono',monospace; font-size:0.7rem; text-align:center; padding:1rem; }
  .accordion-panel{max-height:0; overflow:hidden; transition:max-height .5s cubic-bezier(.2,.8,.2,1);}
  .accordion-item.open .accordion-panel{max-height:500px;}
  .accordion-item.open .chev{transform:rotate(45deg);}
  .chev{transition:transform .35s ease;}
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
    <a href="/"><img src="assets/logo-icon.png" alt="SHS Enterprises Logo" class="h-12 w-auto object-contain"></a>
    <span class="md:hidden font-bold" style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:1.15rem; letter-spacing:0.04em; color:var(--red);">SHS</span>
    <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
      <a href="/" class="hover:text-[var(--red)]">Home</a>
      <a href="portfolio" style="color:var(--red)">Portfolio</a>
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
    <a href="portfolio" style="color:var(--red)">Portfolio</a>
    <a href="services" class="hover:text-[var(--red)]">Services</a>
    <a href="about" class="hover:text-[var(--red)]">About</a>
    <a href="blog" class="hover:text-[var(--red)]">Blog</a>
    <a href="watch" class="hover:text-[var(--red)]">Watch</a>
    <a href="contact" class="hover:text-[var(--red)]">Contact</a>
  </div>
</div>

<section class="pt-40 pb-16 px-6 md:px-10 navy-hero fade-to-gold">
  <div class="max-w-4xl mx-auto">
    <p class="eyebrow mb-5" style="color:var(--red)">Portfolio</p>
    <h1 class="font-display text-4xl md:text-6xl leading-tight mb-6">Manufactured in Karachi. Built for early-stage brands.</h1>
    <p class="text-lg muted leading-relaxed mb-6">
      As a low-MOQ clothing manufacturer in Karachi, SHS Enterprises produces across the full range of streetwear and lifestyle categories — from heavy-GSM oversized tees and ring-spun cotton polos to garment-washed hoodies, French terry sweats, denim, bomber jackets, co-ord sets, and tie-and-dye pieces. Every category below is sampled, quality-checked and produced with the same 3-layer QC process, regardless of order size.
    </p>
    <p class="text-sm font-mono" style="color:var(--gold); border-left:2px solid var(--gold); padding-left:1rem;">
      The following are AI-enhanced images of real manufactured articles hanging in SHS's studio display, which you're welcome to visit and verify — this is done purely to maintain visual uniformity across the website.
    </p>
  </div>
</section>

${hallOfFameHtml}

<div class="px-6 md:px-10 pb-10">
  ${categorySections}
</div>

<section class="py-24 md:py-32 px-6 md:px-10" style="background:var(--paper-dim);">
  <div class="max-w-3xl mx-auto">
    <p class="eyebrow mb-5" style="color:var(--red)">More Questions</p>
    <h2 class="font-display text-4xl md:text-5xl leading-tight mb-16">Manufacturing & sourcing, answered.</h2>
    <div class="space-y-3">${faqHtml}</div>
  </div>
</section>

<div id="lightbox" onclick="if(event.target===this) closeLightbox()">
  <button id="lightboxClose" onclick="closeLightbox()" aria-label="Close">&times;</button>
  <img id="lightboxImg" src="" alt="">
</div>

<footer class="py-16 px-6 md:px-10 border-t" style="border-color:var(--line);">
  <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
    <div>
      <img src="assets/logo-icon.png" alt="SHS Enterprises" class="h-14 w-auto object-contain mb-4">
      <p class="muted text-sm max-w-xs">Low-MOQ clothing manufacturer & full brand growth system for fashion brands. Based in Karachi, working worldwide.</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-10 text-sm">
      <div>
        <p class="font-semibold mb-3">Company</p>
        <ul class="space-y-2 muted">
          <li><a href="about" class="hover:text-[var(--red)]">About Us</a></li>
          <li><a href="/" class="hover:text-[var(--red)]">Home</a></li>
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
  const msg = encodeURIComponent("Hi SHS Enterprises, I'm interested in learning more about your manufacturing and brand growth services.");
  document.getElementById('waFloat').href = \`https://wa.me/\${number}?text=\${msg}\`;
})();

function openLightbox(url, alt){
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = url;
  document.getElementById('lightboxImg').alt = alt;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLightbox(); });

document.querySelectorAll('.accordion-item').forEach(item => {
  item.querySelector('button').addEventListener('click', () => item.classList.toggle('open'));
});

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
