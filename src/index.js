export default {
  async fetch(request, env) {
    // อนุญาตเฉพาะ POST
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405 });
    }

    try {
      const body = await request.json();
      const userText = body.text;

      if (!userText) {
        return new Response(
          JSON.stringify({ error: "No text provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        env.GEMINI_API_KEY;

      const geminiResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userText }]
            }
          ]
        })
      });

      const data = await geminiResponse.json();

      // ดึงคำตอบออกมาให้ frontend ใช้ง่าย
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "ไม่สามารถประมวลผลคำตอบได้";

      return new Response(
        JSON.stringify({ reply }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Internal error",
          detail: String(err)
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
