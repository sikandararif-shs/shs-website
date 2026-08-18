// functions/oversized-t-shirt-manufacturer.js
// Serves /oversized-t-shirt-manufacturer — a dedicated landing page for oversized t-shirt
// manufacturing. Like portfolio.js, this runs server-side on every request and bakes real
// Airtable images (fetched by record ID) directly into the HTML response, so crawlers that
// don't execute JavaScript see the full page on the first request.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblJYQJfU5ywsci3D"; // Portfolio table

// Record IDs pulled from the Portfolio table, placed at fixed points in the page copy below.
const HERO_IMG = "recnNo9vG0Q5rTS3B";
const FABRIC_IMG = "recp4as462DioTYLD";
const MACHINERY_IMG = "recFeOcuycsQHPSbC";
const SILHOUETTE_IMG = "reczE5P55r9DcahaT";
const CLOSING_IMG = "recRytk4mKeBy5P59";
const IMAGE_IDS = [HERO_IMG, FABRIC_IMG, MACHINERY_IMG, SILHOUETTE_IMG, CLOSING_IMG];

function esc(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

async function fetchImageRecords(token, ids) {
  const results = {};
  await Promise.all(ids.map(async (id) => {
    try {
      const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const f = data.fields;
      if (!f.Image || !f.Image.length) return;
      const thumb = f.Image[0].thumbnails?.large;
      results[id] = {
        url: thumb?.url || f.Image[0].url,
        fullUrl: f.Image[0].url,
        width: thumb?.width || f.Image[0].width,
        height: thumb?.height || f.Image[0].height,
        alt: f["Alt Text"] || "SHS Enterprises oversized t-shirt manufacturing"
      };
    } catch (e) { /* skip this image — page still renders without it */ }
  }));
  return results;
}

function renderContentImage(img) {
  if (!img) return '';
  return `
    <div class="content-img-wrap my-10">
      <div class="content-img" data-lightbox-url="${esc(img.fullUrl)}" data-lightbox-alt="${esc(img.alt)}">
        <img src="${img.url}" alt="${esc(img.alt)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')"${img.width && img.height ? ` width="${img.width}" height="${img.height}"` : ''}>
      </div>
    </div>`;
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const token = context.env.AIRTABLE_TOKEN;
  let images = {};
  let dataFetchOk = false;

  if (token) {
    try {
      images = await fetchImageRecords(token, IMAGE_IDS);
      dataFetchOk = true;
    } catch (e) { /* fall through with no images — page still renders with copy */ }
  }

  const ogImage = images[HERO_IMG]?.fullUrl || "https://www.shs-enterprises.com/assets/logo.png";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Oversized T-Shirt Manufacturer — Custom Fits for Streetwear & Fashion Brands</title>
<meta name="description" content="Low-MOQ oversized t-shirt manufacturer working across basic, boxy, and graphic fits — heavy GSM cotton and French Terry, screen print and puff print finishing, sample-ready in days. Based in Karachi, Pakistan.">
<link rel="canonical" href="https://www.shs-enterprises.com/oversized-t-shirt-manufacturer">
<link rel="icon" type="image/png" href="assets/favicon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="Oversized T-Shirt Manufacturer — Custom Fits for Streetwear & Fashion Brands">
<meta property="og:description" content="Low-MOQ oversized t-shirt manufacturer working across basic, boxy, and graphic fits — heavy GSM cotton and French Terry, screen print and puff print finishing, sample-ready in days. Based in Karachi, Pakistan.">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="https://www.shs-enterprises.com/oversized-t-shirt-manufacturer">
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
  "serviceType": "Oversized T-Shirt Manufacturing",
  "provider": { "@type": "Organization", "name": "SHS Enterprises", "url": "https://www.shs-enterprises.com" },
  "areaServed": "Worldwide",
  "description": "Low-MOQ oversized t-shirt manufacturer working across basic, boxy, and graphic fits — heavy GSM cotton and French Terry, screen print and puff print finishing, sample-ready in days. Based in Karachi, Pakistan.",
  "url": "https://www.shs-enterprises.com/oversized-t-shirt-manufacturer"
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
    background:linear-gradient(160deg, var(--navy), var(--ink)); padding-top:100px; overflow-y:auto;
    box-shadow:-10px 0 40px -10px rgba(0,0,0,0.5);
  }
  .mobile-menu.open{ transform:translateX(0); }
  .mobile-menu .starfield{
    position:absolute; inset:0; pointer-events:none;
    background-image:
      radial-gradient(1.5px 1.5px at 10% 20%, rgba(255,255,255,0.9), transparent),
      radial-gradient(1px 1px at 25% 65%, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 40% 15%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1.5px 1.5px at 70% 35%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 85% 60%, rgba(255,255,255,0.6), transparent),
      radial-gradient(2px 2px at 15% 85%, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 60% 10%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1.5px 1.5px at 90% 90%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 33% 45%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 78% 20%, rgba(255,255,255,0.6), transparent),
      radial-gradient(1.5px 1.5px at 5% 55%, rgba(255,255,255,0.6), transparent);
    background-repeat:repeat; background-size:180px 180px; opacity:0.35;
  }
  .mobile-menu-inner{ position:relative; z-index:1; padding:1.5rem 2rem 2rem; display:flex; flex-direction:column; gap:1.4rem; }
  .mobile-menu-inner a{ font-size:1.1rem; font-weight:500; color:var(--paper); }
  .mobile-menu-close{
    position:absolute; top:18px; right:18px; z-index:2;
    width:36px; height:36px; display:flex; align-items:center; justify-content:center;
    background:none; border:none; color:var(--paper); font-size:1.35rem; line-height:1; cursor:pointer;
  }
  .mobile-menu-backdrop{
    position:fixed; inset:0; z-index:65; background:rgba(0,0,0,0.5);
    opacity:0; visibility:hidden; transition:opacity .3s ease, visibility .3s ease;
  }
  .mobile-menu-backdrop.open{ opacity:1; visibility:visible; }
  .mobile-nav-item{ display:flex; flex-direction:column; }
  .mobile-nav-row{ display:flex; align-items:center; justify-content:space-between; gap:0.75rem; }
  .mobile-nav-toggle{
    background:none; border:none; color:var(--paper); cursor:pointer;
    padding:0.25rem; font-size:0.85rem; display:flex; align-items:center; justify-content:center;
    transition:transform .3s ease;
  }
  .mobile-nav-item.open .mobile-nav-toggle{ transform:rotate(180deg); }
  .mobile-submenu{ max-height:0; overflow:hidden; transition:max-height .35s ease; display:flex; flex-direction:column; gap:0.7rem; padding-left:1rem; }
  .mobile-nav-item.open .mobile-submenu{ max-height:200px; margin-top:0.8rem; }
  .mobile-menu-inner .mobile-submenu a{ font-size:0.95rem; font-weight:400; color:var(--stone-light); }
  .nav-dropdown{ position:relative; }
  .nav-dropdown-menu{
    position:absolute; top:100%; left:0; margin-top:0.9rem; min-width:210px;
    background:var(--paper); border:1px solid var(--line); border-radius:12px;
    box-shadow:0 20px 40px -15px rgba(10,10,10,0.25);
    padding:0.4rem; opacity:0; visibility:hidden; transform:translateY(-6px);
    transition:opacity .25s ease, transform .25s ease, visibility .25s ease;
  }
  .nav-dropdown:hover .nav-dropdown-menu, .nav-dropdown:focus-within .nav-dropdown-menu{
    opacity:1; visibility:visible; transform:translateY(0);
  }
  .nav-dropdown-link{ display:block; padding:0.6rem 0.9rem; border-radius:8px; font-size:0.85rem; font-weight:500; color:var(--ink); white-space:nowrap; }
  .nav-dropdown-link:hover{ background:var(--paper-dim); color:var(--red); }
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
      <div class="nav-dropdown">
        <a href="portfolio" class="hover:text-[var(--red)] inline-flex items-center gap-1">Portfolio<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></a>
        <div class="nav-dropdown-menu">
          <a href="/oversized-t-shirt-manufacturer" class="nav-dropdown-link" style="color:var(--red)">Oversized T-Shirts</a>
          <a href="/custom-hoodie-manufacturer" class="nav-dropdown-link">Hoodies</a>
        </div>
      </div>
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

<div class="mobile-menu-backdrop" id="mobileMenuBackdrop"></div>
<div class="mobile-menu" id="mobileMenu">
  <div class="starfield"></div>
  <button type="button" class="mobile-menu-close" id="mobileMenuClose" aria-label="Close menu">✕</button>
  <div class="mobile-menu-inner">
    <a href="/">Home</a>
    <div class="mobile-nav-item">
      <div class="mobile-nav-row">
        <a href="portfolio" class="hover:text-[var(--red)]">Portfolio</a>
        <button type="button" class="mobile-nav-toggle" aria-label="Toggle Portfolio submenu" aria-expanded="false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
      </div>
      <div class="mobile-submenu">
        <a href="/oversized-t-shirt-manufacturer" style="color:var(--red)">Oversized T-Shirts</a>
        <a href="/custom-hoodie-manufacturer">Hoodies</a>
      </div>
    </div>
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
    <p class="eyebrow mb-5" style="color:var(--red)">Oversized T-Shirt Manufacturer</p>
    <h1 class="font-display text-4xl md:text-6xl leading-tight mb-6">Oversized T-Shirt Manufacturer — Built for Brands That Actually Wear the Fit</h1>
    <p class="text-lg muted leading-relaxed mb-6">An oversized t-shirt is deceptively simple to say and genuinely difficult to manufacture well. The drape, the shoulder drop, the way the fabric sits without collapsing into shapelessness — that's construction, not just cutting a bigger pattern. SHS Enterprises manufactures oversized t-shirts across basic, boxy, graphic, and drop-shoulder silhouettes for streetwear and fashion labels working in low-MOQ production, based in Karachi, Pakistan, and shipping to brands worldwide.</p>
    <p class="text-lg muted leading-relaxed">We don't treat "oversized" as one fixed spec. A brand launching a summer essentials drop needs a completely different fabric weight than a brand building a statement graphic piece meant to anchor a collection — and we build to that difference deliberately, not by offering one blank silhouette and hoping it fits every use case.</p>
  </div>
</section>

<div class="px-6 md:px-10">
  <div class="max-w-4xl mx-auto py-4">

    ${renderContentImage(images[HERO_IMG])}

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Fabric and GSM, Matched to What You're Actually Launching</h2>
      <p class="muted leading-relaxed mb-4">For summer essentials — the kind of piece meant to move fast, at volume, at accessible pricing — we work in cotton single jersey or a PC (poly-cotton) mix, typically landing between 150 and 170 GSM. Light enough to breathe, still holding structure through repeated washing.</p>
      <p class="muted leading-relaxed mb-4">Once a brand moves into fashion or a more unique garment vertical — pieces meant to carry a screen print or a heavier embroidery panel — we push into PC Interlock or French Terry, generally in the 180 to 220 GSM range. That extra weight matters here: a heavy print on a light fabric distorts and cracks faster than the same print on something built to carry it.</p>
      <p class="muted leading-relaxed mb-4">And when something genuinely ambitious lands on our table — a full tech pack, a considered design, a brand that wants a flagship piece — we take that development into premium French Terry fabric running up to 280 GSM. That's the extraordinary end of what we build, and we treat it that way in production, not as a standard SKU.</p>
      <p class="muted leading-relaxed">We also manufacture well beyond that range on custom demand. Our studio currently has a 300+ GSM Scuba fabric oversized tee on display — heavier than most manufacturers will even quote — and it's there for any visiting brand to see and hold, not just described in a spec sheet.</p>
    </section>

    ${renderContentImage(images[FABRIC_IMG])}

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Real Machinery, Not a Generic Claim</h2>
      <p class="muted leading-relaxed">Oversized construction lives or dies at the seams. Our floor runs on Juki single-needle lockstitch machines for main seaming, Siruba overlock machines for edge finishing that won't fray under wash stress, Jack flatlock machines for the coverstitch hemming that keeps a drop-shoulder tee lying flat instead of curling, and dedicated Kansai Special feed-off-the-arm machines for chain-stitch detailing on heavier panels. This isn't a stock list — it's genuinely what's on our production floor, and it's why the drape holds after twenty washes, not just in the first photoshoot.</p>
    </section>

    ${renderContentImage(images[MACHINERY_IMG])}

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Sourced From the Same Fabric Mills as the Names You Already Know</h2>
      <p class="muted leading-relaxed">The fabric behind every SHS oversized tee comes from OEKO-TEX certified mills that also supply production runs for global names like DKNY, ZARA, Volcom, and Spider. That's not a small distinction — OEKO-TEX certification means every roll has been independently tested and cleared of harmful substances, at a standard those brands won't manufacture without. When we build for you, you're working with the same raw material tier the industry's biggest names demand, regardless of your order size.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Every Silhouette, Not Just One Fit</h2>
      <p class="muted leading-relaxed mb-4">"Oversized" isn't a single silhouette in our production line — it's a category. We build basic tees for everyday essentials, boxy and drop-shoulder cuts for streetwear-first labels, graphic-forward pieces designed around a print or embroidery placement, and long-sleeve and pocket-tee variations for brands extending a core style into a fuller range.</p>
      <p class="muted leading-relaxed">We also manufacture raglan and baseball-style panel construction, V-neck and scoop-neck finishes for brands working outside the standard crew, muscle-fit and tank silhouettes for activewear-adjacent labels, and Henley and polo constructions when a brand wants structure without going fully tailored. Browse examples of these exact builds — and everything else we manufacture — in our full <a href="portfolio" style="color:var(--red)">portfolio</a>.</p>
    </section>

    ${renderContentImage(images[SILHOUETTE_IMG])}

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Sample Turnaround and What Slows It Down</h2>
      <p class="muted leading-relaxed">For an oversized t-shirt specifically, our sample turnaround runs 5 to 10 days, depending on the article's demand at the time. Pieces with heavier value-added customization — multi-placement embroidery, complex puff print layering, custom wash treatments — will genuinely take longer than that window, and we tell you upfront rather than let a deadline slip quietly.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">MOQ Built for Brands Starting Out, Not Just Established Ones</h2>
      <p class="muted leading-relaxed">Our standard minimum order is 50 to 60 pieces — low enough that a first-time founder can test a real design in the real market without committing capital meant for six months of runway. For brands that build a genuine, ongoing relationship with us, our Promise to Success program extends even lower minimums over time, because the goal was never a single transaction — it's a brand that keeps coming back because the first order actually worked.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">Who This Is Actually Built For</h2>
      <p class="muted leading-relaxed">If you're a low-MOQ streetwear manufacturer search away from finding your production partner, or you're comparing us against options in private label clothing and custom apparel manufacturing in Karachi, this is the exact gap we were built to close. We work with startup clothing labels placing their first order and established small batch clothing brands scaling a proven line. For brands specifically looking at clothing manufacturing countries other than China — whether for cost, lead time, or simply wanting a manufacturing partner that isn't juggling a thousand other accounts — Pakistan, and SHS specifically, is a genuine, capable option.</p>
    </section>

    <section class="py-10 md:py-14">
      <h2 class="font-display text-3xl md:text-4xl mb-6">See It, Don't Just Read About It</h2>

      ${renderContentImage(images[CLOSING_IMG])}

      <p class="muted leading-relaxed">Every claim above is something you can verify in person. Schedule a visit or a strategy call on <a href="https://calendly.com/shs-enterprises-pk/discussion-meeting/" target="_blank" rel="noopener" style="color:var(--red)">Calendly</a>, walk our floor, hold the 300 GSM Scuba sample yourself. Follow the day-to-day production on <a href="https://www.instagram.com/shs.clothingmanufacturers/" target="_blank" rel="noopener" style="color:var(--red)">Instagram</a>, or find us directly — SHS Enterprises, Karachi, Pakistan. Curious what else we manufacture beyond t-shirts? See the full range of <a href="services" style="color:var(--red)">services</a> we offer alongside production.</p>
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
  const msg = encodeURIComponent("Hi SHS Enterprises, I'm interested in learning more about your oversized t-shirt manufacturing.");
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
  const trigger = e.target.closest('.content-img[data-lightbox-url]');
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
  const closeBtn = document.getElementById('mobileMenuClose');
  const backdrop = document.getElementById('mobileMenuBackdrop');
  if(!btn || !menu) return;
  function openMenu(){
    btn.classList.add('open');
    menu.classList.add('open');
    if(backdrop) backdrop.classList.add('open');
  }
  function closeMenu(){
    btn.classList.remove('open');
    menu.classList.remove('open');
    if(backdrop) backdrop.classList.remove('open');
  }
  btn.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  if(closeBtn) closeBtn.addEventListener('click', closeMenu);
  if(backdrop) backdrop.addEventListener('click', closeMenu);
  menu.querySelectorAll('.mobile-nav-toggle').forEach(t => {
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = t.closest('.mobile-nav-item');
      if(!item) return;
      const open = item.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
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
