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

// DEBUG: ส่ง error จาก Gemini กลับไปให้เห็น
if (!geminiRes.ok) {
  return new Response(
    JSON.stringify({
      error: "Gemini API error",
      detail: geminiData
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

// รองรับ response หลายแบบ
let reply = "ไม่สามารถวิเคราะห์อาการได้ในขณะนี้";

if (geminiData?.candidates?.length > 0) {
  reply =
    geminiData.candidates[0]?.content?.parts
      ?.map(p => p.text)
      .join("") || reply;
}

return new Response(
  JSON.stringify({ reply, raw: geminiData }),
  {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  }
);
