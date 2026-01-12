const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {

    // ✅ รองรับ preflight (สำคัญ)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("POST only", {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const { text } = await request.json();

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        env.GEMINI_API_KEY;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text }] }
          ]
        })
      });

      const data = await res.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "ไม่สามารถวิเคราะห์อาการได้ในขณะนี้";

      return new Response(
        JSON.stringify({ reply }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }
  }
};
