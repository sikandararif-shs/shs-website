// functions/blog.js
const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblnpJA3AUZIpSLnz"; // Blogs table

function slugify(title) {
  return (title || "untitled").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}
function esc(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function fetchPosts(token) {
  let records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("filterByFormula", "AND({Published}=1, OR({Scheduled For}=BLANK(), IS_BEFORE({Scheduled For}, NOW())))");
    url.searchParams.set("sort[0][field]", "Date Published");
    url.searchParams.set("sort[0][direction]", "desc");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);
    const data = await res.json();
    records = records.concat(data.records);
    offset = data.offset;
  } while (offset);

  return records.map(rec => {
    const f = rec.fields;
    const banner = f["Banner Image"]?.[0];
    const bannerThumb = banner?.thumbnails?.large;
    return {
      slug: (f.Slug && f.Slug.trim()) || slugify(f.Title),
      title: f.Title || "Untitled",
      excerpt: f.Excerpt || "",
      bannerImage: bannerThumb?.url || banner?.url || null,
      bannerImageWidth: bannerThumb?.width || banner?.width || null,
      bannerImageHeight: bannerThumb?.height || banner?.height || null,
      category: f.Category || "General",
      datePublished: f["Date Published"] || null
    };
  });
}

export async function onRequestGet(context) {
  const cache = caches.default;
  const cacheKey = new Request(context.request.url, context.request);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const token = context.env.AIRTABLE_TOKEN;
  let posts = [];
  let fetchOk = false;
  if (token) {
    try { posts = await fetchPosts(token); fetchOk = true; } catch (e) { /* renders empty state */ }
  }

  const postsHtml = posts.length ? posts.map(p => `
    <a href="blog-post?slug=${encodeURIComponent(p.slug)}" class="post-card block">
      <div class="post-img">${p.bannerImage ? `<img src="${p.bannerImage}" alt="${esc(p.title)}" loading="lazy"${p.bannerImageWidth && p.bannerImageHeight ? ` width="${p.bannerImageWidth}" height="${p.bannerImageHeight}"` : ''}>` : ''}</div>
      <div class="p-6">
        <p class="eyebrow mb-2" style="color:var(--gold)">${p.category}</p>
        <h2 class="font-display text-xl mb-2">${p.title}</h2>
        <p class="muted text-sm mb-3">${p.excerpt}</p>
        <p class="text-xs muted">${formatDate(p.datePublished)}</p>
      </div>
    </a>`).join('') : '';

  const emptyState = posts.length ? '' : `<p class="text-center muted py-16">New posts are on the way — check back soon, or follow us on Instagram for updates in the meantime.</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Blog — Fashion Manufacturing & Brand Growth Insights | SHS Enterprises</title>
<meta name="description" content="Insights on low-MOQ manufacturing, fashion brand strategy, and launching apparel labels in Pakistan — from SHS Enterprises.">
<link rel="canonical" href="https://www.shs-enterprises.com/blog">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"></noscript>
<link rel="stylesheet" href="/assets/tailwind.css">
<script type="application/ld+json">{ "@context": "https://schema.org", "@type": "Blog", "name": "SHS Enterprises Blog", "url": "https://www.shs-enterprises.com/blog" }</script>
<style>
  :root{ --ink:#0A0A0A; --paper:#FAFAFA; --paper-dim:#F1EEE9; --red:#C90201; --red-deep:#750101; --gold:#C39D63; --stone:#726C63; --line: rgba(10,10,10,0.10); }
  *{box-sizing:border-box;}
  body{background:var(--paper); color:var(--ink); font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased;}
  .font-display{font-family:'Fraunces',serif;}
  .muted{color:var(--stone);}
  .eyebrow{font-family:'JetBrains Mono',monospace; font-size:0.72rem; letter-spacing:0.18em; text-transform:uppercase; font-weight:500;}
  .nav-blur{backdrop-filter:blur(14px); background:rgba(250,250,250,0.85);}
  .btn-primary{ background:linear-gradient(135deg, var(--red), var(--red-deep)); color:var(--paper); border-radius:999px; padding:0.9rem 1.9rem; font-weight:600; font-size:0.95rem; display:inline-flex; align-items:center; gap:0.5rem; }
  .post-card{ border:1px solid var(--line); border-radius:16px; overflow:hidden; background:#fff; transition:transform .35s ease, box-shadow .35s ease; }
  .post-card:hover{ transform:translateY(-4px); box-shadow:0 25px 50px -20px rgba(10,10,10,0.2); }
  .post-img{ aspect-ratio:16/9; background:var(--paper-dim); overflow:hidden; }
  .post-img img{ width:100%; height:100%; object-fit:cover; }
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
          <a href="/oversized-t-shirt-manufacturer" class="nav-dropdown-link">Oversized T-Shirts</a>
          <a href="/custom-hoodie-manufacturer" class="nav-dropdown-link">Hoodies</a>
        </div>
      </div>
      <a href="services" class="hover:text-[var(--red)]">Services</a>
      <a href="about" class="hover:text-[var(--red)]">About</a>
      <a href="blog" style="color:var(--red)">Blog</a>
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
        <a href="/oversized-t-shirt-manufacturer">Oversized T-Shirts</a>
        <a href="/custom-hoodie-manufacturer">Hoodies</a>
      </div>
    </div>
    <a href="services" class="hover:text-[var(--red)]">Services</a>
    <a href="about" class="hover:text-[var(--red)]">About</a>
    <a href="blog" style="color:var(--red)">Blog</a>
    <a href="watch" class="hover:text-[var(--red)]">Watch</a>
    <a href="contact" class="hover:text-[var(--red)]">Contact</a>
  </div>
</div>
<main>

<section class="pt-40 pb-16 px-6 md:px-10">
  <div class="max-w-4xl mx-auto">
    <p class="eyebrow mb-5" style="color:var(--red)">Blog</p>
    <h1 class="font-display text-4xl md:text-6xl leading-tight mb-6">Manufacturing & brand growth, explained.</h1>
    <p class="text-lg muted leading-relaxed max-w-2xl">Notes on low-MOQ manufacturing, fashion strategy, and building a brand in Pakistan's apparel industry — written by the SHS team.</p>
  </div>
</section>

<section class="pb-24 px-6 md:px-10">
  <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">${postsHtml}</div>
  ${emptyState}
</section>

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

<script>
document.getElementById('year').textContent = new Date().getFullYear();
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
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=120" }
  });

  if (fetchOk) context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
