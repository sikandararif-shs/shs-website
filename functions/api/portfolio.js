// GET /api/portfolio
// Reads all records from the Portfolio table and returns them grouped by Category.
// The Airtable token is read from an environment variable (AIRTABLE_TOKEN) set in
// Cloudflare Pages — it is never written into this file, so it's safe to deploy.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblJYQJfU5ywsci3D"; // Portfolio table

export async function onRequestGet(context) {
  const token = context.env.AIRTABLE_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: "Server not configured (missing AIRTABLE_TOKEN)." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let records = [];
    let offset = null;

    // Airtable paginates 100 records at a time — loop until there's no more offset.
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
      if (offset) url.searchParams.set("offset", offset);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Airtable API error: ${res.status}`);
      }

      const data = await res.json();
      records = records.concat(data.records);
      offset = data.offset;
    } while (offset);

    // Group by Category, only include rows that actually have an image attached.
    const grouped = {};
    for (const rec of records) {
      const f = rec.fields;
      if (!f.Image || !f.Image.length) continue;

      const category = f.Category || "Uncategorized";
      if (!grouped[category]) grouped[category] = [];

      grouped[category].push({
        id: rec.id,
        url: f.Image[0].url,
        thumbnail: f.Image[0].thumbnails?.large?.url || f.Image[0].url,
        alt: f["Alt Text"] || `${category} — SHS Enterprises manufacturing`,
        caption: f["Caption"] || "",
        featured: !!f.Featured
      });
    }

    return new Response(JSON.stringify({ categories: grouped }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300" // cache 5 min so we don't hammer the Airtable API
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
