import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  const { text } = await req.json();
  return new Response(JSON.stringify({ message: "Received: " + text }), {
    headers: { "Content-Type": "application/json" },
  });
}); 