// GET /api/blog
// Returns all posts where "Published" is checked, newest first, with just enough
// data for snippet cards (title, excerpt, banner image, date, category, slug).
// Full post content is fetched separately via /api/blog-post?slug=... to keep
// this list endpoint light and fast.

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblnpJA3AUZIpSLnz"; // Blog table

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
      url.searchParams.set("sort[0][field]", "Date Published");
      url.searchParams.set("sort[0][direction]", "desc");
      if (offset) url.searchParams.set("offset", offset);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Airtable API error: ${res.status}`);

      const data = await res.json();
      records = records.concat(data.records);
      offset = data.offset;
    } while (offset);

    const posts = records.map(rec => {
      const f = rec.fields;
      return {
        slug: (f.Slug && f.Slug.trim()) || slugify(f.Title || "untitled"),
        title: f.Title || "Untitled",
        excerpt: f.Excerpt || "",
        bannerImage: f["Banner Image"]?.[0]?.thumbnails?.large?.url || f["Banner Image"]?.[0]?.url || null,
        category: f.Category || "General",
        datePublished: f["Date Published"] || null
      };
    });

    return new Response(JSON.stringify({ posts }), {
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
