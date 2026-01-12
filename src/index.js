export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }

    try {
      const { text } = await request.json();

      if (!text) {
        return new Response(
          JSON.stringify({ error: "No text provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        env.GEMINI_API_KEY;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text }]
            }
          ]
        })
      });

      const data = await res.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "ไม่สามารถสร้างคำตอบได้";

      return new Response(
        JSON.stringify({ reply }),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          detail: String(err)
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
