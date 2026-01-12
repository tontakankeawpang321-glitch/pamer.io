export default {
  async fetch(request, env) {
    // ---------- CORS ----------
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // ---------- Preflight ----------
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ---------- Allow POST only ----------
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "POST only" }),
        { status: 405, headers: corsHeaders }
      );
    }

    // ---------- Read body ----------
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const userText = body?.text;
    if (!userText) {
      return new Response(
        JSON.stringify({ error: "Missing text" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ---------- Gemini API ----------
    const GEMINI_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      env.GEMINI_API_KEY;

    try {
      const geminiRes = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userText }]
            }
          ]
        })
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return new Response(
          JSON.stringify({
            error: "Gemini API error",
            detail: errText
          }),
          { status: 500, headers: corsHeaders }
        );
      }

      const data = await geminiRes.json();

      // ---------- Extract reply ----------
      const reply =
