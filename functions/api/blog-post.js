// GET /api/blog-post?slug=your-post-slug
// Fetches one post by its slug, converts simple Markdown (#, ##, **bold**, - lists)
// to HTML, and replaces [image-1], [image-2] etc. markers in the content with the
// corresponding image from the "Inline Images" attachment field.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblnpJA3AUZIpSLnz"; // Blog table

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function esc(s) { return (s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

// Minimal Markdown -> HTML converter, deliberately simple (no external libraries).
function renderMarkdown(text, inlineImages) {
  if (!text) return "";

  // Swap [image-N] markers for real <img> tags first.
  text = text.replace(/\[image-(\d+)\]/g, (match, n) => {
    const idx = parseInt(n, 10) - 1;
    const img = inlineImages[idx];
    if (!img) return ""; // marker referenced an image that doesn't exist — drop it silently
    const dims = img.width && img.height ? ` width="${img.width}" height="${img.height}"` : '';
    return `\n<img src="${esc(img.url)}" alt="${esc(img.filename) || "SHS Enterprises blog image"}" class="w-full rounded-xl my-8" loading="lazy"${dims}>\n`;
  });

  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (let raw of lines) {
    let line = raw.trim();

    if (line.startsWith("<img")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += line;
      continue;
    }

    // Bold: **text**
    line = esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2 class="font-display text-3xl mt-12 mb-4">${line.slice(3)}</h2>`;
    } else if (line.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h1 class="font-display text-4xl mt-12 mb-5">${line.slice(2)}</h1>`;
    } else if (line.startsWith("- ")) {
      if (!inList) { html += '<ul class="list-disc pl-6 space-y-2 my-4">'; inList = true; }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line === "") {
      if (inList) { html += "</ul>"; inList = false; }
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<p class="my-4 leading-relaxed">${line}</p>`;
    }
  }
  if (inList) html += "</ul>";

  return html;
}

export async function onRequestGet(context) {
  const token = context.env.AIRTABLE_TOKEN;
  const slug = new URL(context.request.url).searchParams.get("slug");

  if (!token) {
    return new Response(JSON.stringify({ error: "Server not configured (missing AIRTABLE_TOKEN)." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug parameter." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
    url.searchParams.set("filterByFormula", "{Published}=1");

    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);
    const data = await res.json();

    const match = data.records.find(rec => {
      const f = rec.fields;
      const s = (f.Slug && f.Slug.trim()) || slugify(f.Title || "untitled");
      return s === slug;
    });

    if (!match) {
      return new Response(JSON.stringify({ error: "Post not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const f = match.fields;
    const inlineImages = (f["Inline Images"] || []).map(img => ({ url: img.url, filename: img.filename, width: img.width, height: img.height }));
    const banner = f["Banner Image"]?.[0];

    const post = {
      title: f.Title || "Untitled",
      slug,
      bannerImage: banner?.url || null,
      bannerImageWidth: banner?.width || null,
      bannerImageHeight: banner?.height || null,
      category: f.Category || "General",
      datePublished: f["Date Published"] || null,
      excerpt: f.Excerpt || "",
      contentHtml: renderMarkdown(f["Body Text"] || "", inlineImages)
    };

    return new Response(JSON.stringify({ post }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
