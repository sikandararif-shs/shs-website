// GET /api/policy?slug=your-policy-slug
// Fetches one policy by its slug and converts simple Markdown to HTML.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblqXIWDRkcbMKNV8"; // Policies table

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function renderMarkdown(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let html = "";
  let inList = false;

  for (let line of lines) {
    line = line.trim();
    line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    if (line.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2 class="font-display text-2xl mt-8 mb-3">${line.slice(3)}</h2>`;
    } else if (line.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h1 class="font-display text-3xl mt-8 mb-4">${line.slice(2)}</h1>`;
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
      return new Response(JSON.stringify({ error: "Policy not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const f = match.fields;
    const policy = {
      title: f.Title || "Untitled Policy",
      slug,
      category: f.Category || "Internal Policy",
      effectiveFrom: f["Effective From"] || null,
      datePosted: match.createdTime || null,
      summary: f.Excerpt || "",
      contentHtml: renderMarkdown(f["Body Text"] || "")
    };

    return new Response(JSON.stringify({ policy }), {
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
