export default {
  async fetch(request, env) {

    // ===============================
    // CORS CONFIG
    // ===============================
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // หรือใส่ domain จริงก็ได้
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // ===============================
    // Preflight (OPTIONS)
    // ===============================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ===============================
    // Only POST
    // ===============================
    if (request.method !== "POST") {
      return new Response("POST only", {
        status: 405,
        headers: corsHeaders,
      });
    }

    // ===============================
    // Read input
    // ===============================
    const { text } = await request.json();

    // ===============================
    // Gemini 2.5 Flash
    // ===============================
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      env.GEMINI_API_KEY;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text }],
          },
        ],
      }),
    });

    const geminiData = await geminiRes.json();

    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "ไม่สามารถวิเคราะห์อาการได้ในขณะนี้";

    // ===============================
    // Response
    // ===============================
    return new Response(
      JSON.stringify({ reply }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  },
};
