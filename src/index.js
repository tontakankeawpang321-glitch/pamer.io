export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();

      if (!body?.text) {
        return new Response(
          JSON.stringify({ error: "missing text" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        env.GEMINI_API_KEY;

      const geminiRes = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: body.text }] }],
        }),
      });

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok) {
        return new Response(
          JSON.stringify({
            error: "Gemini API error",
            detail: geminiData,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      let reply = "ไม่สามารถวิเคราะห์อาการได้ในขณะนี้";

      if (geminiData?.candidates?.length > 0) {
        reply =
          geminiData.candidates[0]?.content?.parts
            ?.map(p => p.text)
            .join("") || reply;
      }

      return new Response(
        JSON.stringify({ reply }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } catch (err) {
      console.error("WORKER ERROR:", err);

      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }
};
