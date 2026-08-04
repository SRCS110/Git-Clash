import { serve } from "[https://deno.land/std@0.168.0/http/server.ts](https://deno.land/std@0.168.0/http/server.ts)";
import { GoogleGenAI, Type } from "npm:@google/genai";

const ai = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY") });
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
    const prompt = `
[INTERFACE]: ${payload.system_context.active_interface}
[LOCATION]: ${payload.system_context.node_id}
[OBJECTIVE]: ${payload.puzzle_environment.objective}
[AST STATE]: ${JSON.stringify(payload.puzzle_environment.current_player_ast)}
[QUESTION]: "${payload.user_prompt || "I need help!"}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are ROOT_BOT in Git Clash. Guide the user with strategic hints without outputting exact full solution code.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            thought_process: { type: Type.STRING },
            ui_action: { type: Type.STRING, enum: ['HIGHLIGHT_BLOCK', 'SHOW_HINT', 'EXPLAIN_CONCEPT', 'CELEBRATE'] },
            target_element_id: { type: Type.STRING },
            message: { type: Type.STRING },
            suggested_quick_replies: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["thought_process", "ui_action", "message"],
        },
      },
    });

    return new Response(response.text, { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});