// functions/policies.js
const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblqXIWDRkcbMKNV8"; // Policies table

function slugify(title) {
  return (title || "untitled").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}
function esc(s) { return (s || '').replace(/"/g, '&quot;'); }
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

async function fetchPolicies(token) {
  let records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("filterByFormula", "{Published}=1");
    url.searchParams.set("sort[0][field]", "Effective From");
    url.searchParams.set("sort[0][direction]", "asc");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);
    const data = await res.json();
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);

  return records.map(rec => {
    const f = rec.fields;
    return {
      slug: (f.Slug && f.Slug.trim()) || slugify(f.Title),
      title: f.Title || "Untitled Policy",
      summary: f.Excerpt || "",
      category: f.Category || "Internal Policy",
      effectiveFrom: f["Effective From"] || null,
      datePosted: rec.createdTime || null
    };
  });
}

export async function onRequestGet(context) {
  const token = context.env.AIRTABLE_TOKEN;
  let policies = [];
  if (token) {
    try { policies = await fetchPolicies(token); } catch (e) { /* renders empty state */ }
  }

  const listHtml = policies.length ? policies.map(p => `
    <li class="policy-item flex gap-4">
      <span class="policy-num"></span>
      <div class="flex-1">
        <a href="policy?slug=${encodeURIComponent(p.slug)}" class="font-display text-xl md:text-2xl hover:text-[var(--red)] transition-colors">${p.title}</a>
        <p class="text-sm muted mt-1">${esc(p.summary)}</p>
        <p class="text-xs font-mono mt-2" style="color:var(--gold);">${p.category}, ${formatDate(p.datePosted)}</p>
        <div class="policy-sep"></div>
        <p class="text-sm muted">In effect from: ${formatDate(p.effectiveFrom)}</p>
      </div>
    </li>`).join('') : '';

  const emptyState = policies.length ? '' : `<p class="muted py-10">Policies will be listed here as they're published.</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Policies — SHS Enterprises</title>
<meta name="description" content="SHS Enterprises' internal and external policies covering how we work with clients and partners.">
<link rel="canonical" href="https://www.shs-enterprises.com/policies">
<link rel="icon" type="image/png" href="assets/favicon.png">
<meta name="robots" content="noindex, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  :root{ --ink:#0A0A0A; --paper:#FAFAFA; --paper-dim:#F1EEE9; --red:#C90201; --red-deep:#750101; --gold:#C39D63; --stone:#827C74; --line: rgba(10,10,10,0.10); }
  *{box-sizing:border-box;}
  body{background:var(--paper); color:var(--ink); font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased;}
  .font-display{font-family:'Fraunces',serif;}
  .font-mono{font-family:'JetBrains Mono',monospace;}
  .muted{color:var(--stone);}
  .eyebrow{font-family:'JetBrains Mono',monospace; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; font-weight:500;}
  .nav-blur{backdrop-filter:blur(14px); background:rgba(250,250,250,0.85);}
  .btn-primary{ background:linear-gradient(135deg, var(--red), var(--red-deep)); color:var(--paper); border-radius:999px; padding:0.9rem 1.9rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; }
  .policy-item{ counter-increment:policy; }
  .policy-list{ counter-reset:policy; }
  .policy-num{ font-family:'Fraunces',serif; font-size:1.6rem; color:var(--gold); min-width:2.5rem; }
  .policy-num::before{ content: counter(policy) "."; }
  .policy-sep{ border-top:1px solid var(--line); margin:0.9rem 0; }

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

<section class="pt-40 pb-16 px-6 md:px-10">
  <div class="max-w-3xl mx-auto">
    <p class="eyebrow mb-5" style="color:var(--red)">Policies</p>
    <h1 class="font-display text-4xl md:text-5xl leading-tight mb-6">SHS Enterprises — Policies</h1>
    <p class="muted leading-relaxed">
      The policies below govern how SHS Enterprises works with clients, partners and the public. Internal policies apply to our own operating standards; external policies apply directly to client relationships and agreements.
    </p>
  </div>
</section>

<section class="pb-24 px-6 md:px-10">
  <div class="max-w-3xl mx-auto">
    <ol class="policy-list space-y-8">${listHtml}</ol>
    ${emptyState}
  </div>
</section>

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

<script>document.getElementById('year').textContent = new Date().getFullYear();

document.querySelectorAll('.accordion-item').forEach(item => {
  const btn = item.querySelector('button');
  if(btn) btn.addEventListener('click', () => item.classList.toggle('open'));
});
(function(){
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if(!btn || !menu) return;
  btn.addEventListener('click', () => { btn.classList.toggle('open'); menu.classList.toggle('open'); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { btn.classList.remove('open'); menu.classList.remove('open'); }));
})();
(function(){
  const header = document.querySelector('header');
  if(!header) return;
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    if(window.innerWidth > 767) { header.classList.remove('header-hidden'); return; }
    const current = window.scrollY;
    if(current > lastScroll && current > 120){ header.classList.add('header-hidden'); }
    else { header.classList.remove('header-hidden'); }
    lastScroll = current <= 0 ? 0 : current;
  }, { passive:true });
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=120" }
  });
}
