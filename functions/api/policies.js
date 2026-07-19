// GET /api/policies
// Returns all policies where "Published" is checked, with just enough data for the
// index list (title, excerpt as the summary line, category, effective date, slug).

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblqXIWDRkcbMKNV8"; // Policies table

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

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

    const policies = records.map(rec => {
      const f = rec.fields;
      return {
        slug: (f.Slug && f.Slug.trim()) || slugify(f.Title || "untitled"),
        title: f.Title || "Untitled Policy",
        summary: f.Excerpt || "",
        category: f.Category || "Internal Policy",
        effectiveFrom: f["Effective From"] || null,
        datePosted: rec.createdTime || null
      };
    });

    return new Response(JSON.stringify({ policies }), {
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
