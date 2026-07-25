// POST /api/lead
// Receives contact form submissions and writes them into the Leads table.
// Validation rules: Name, Email, Brand Name, Reason, Contact Preference are always
// required. Phone Number is required only if Contact Preference is "Call Me".

const BASE_ID = "applLqc9DL2932xAm";
const TABLE_ID = "tblg0d6X0G0Vm50JF"; // Leads table

export async function onRequestPost(context) {
  const token = context.env.AIRTABLE_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: "Server not configured (missing AIRTABLE_TOKEN)." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await context.request.json();
    const { name, email, brandName, reason, contactPreference, phoneNumber, website } = body;

    // --- Honeypot: "website" is hidden from real visitors via CSS. Only bots that
    // blindly fill every field will populate it. Pretend success without writing anything. ---
    if (website?.trim()) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // --- Server-side validation (never trust the browser alone) ---
    const errors = [];
    if (!name?.trim()) errors.push("Name is required.");
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email is required.");
    if (!brandName?.trim()) errors.push("Brand name is required.");
    if (!reason?.trim()) errors.push("Reason for interest is required.");
    if (!["Call Me", "Email Me"].includes(contactPreference)) errors.push("Contact preference is required.");
    if (contactPreference === "Call Me" && !phoneNumber?.trim()) {
      errors.push("Phone number is required when 'Call Me' is selected.");
    }

    if (errors.length) {
      return new Response(JSON.stringify({ error: errors.join(" ") }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // --- Write to Airtable ---
    const fields = {
      "Name": name.trim(),
      "Email": email.trim(),
      "Brand Name": brandName.trim(),
      "Reason for Interest": reason.trim(),
      "Contact Preference": contactPreference,
      "Status": "New"
    };
    if (phoneNumber?.trim()) fields["Phone Number"] = phoneNumber.trim();

    const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Airtable API error: ${res.status} — ${errText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
