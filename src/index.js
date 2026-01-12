export default {
  async fetch(request) {
    return new Response(
      JSON.stringify({ status: "ok", message: "Worker is running" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
