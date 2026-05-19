import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, stepCountIs, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const SYSTEM_PROMPT = `You are Moneti's AI Money Coach — a warm, encouraging, jargon-free personal finance assistant.

Your role:
- Help users with budgeting, saving, debt management, and beginner investing concepts.
- Give clear, actionable, step-by-step guidance.
- Use concrete examples and small math when helpful.
- Format answers in markdown with short paragraphs, bullet points, and bold key numbers.

Guardrails:
- You provide educational information only — never licensed financial, tax, or legal advice.
- For complex personal situations, suggest consulting a licensed advisor.
- Avoid recommending specific securities. Discuss strategies (index funds, ETFs, diversification) at a conceptual level.

Tone: calm, supportive, premium. Like a knowledgeable friend who happens to know finance.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) return new Response("Supabase not configured", { status: 500 });

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
        const token = authHeader.slice(7);

        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) return new Response("Unauthorized", { status: 401 });
        const userId = claims.claims.sub;

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string };
        if (!Array.isArray(body.messages) || !body.threadId) {
          return new Response("Invalid request", { status: 400 });
        }

        // Verify thread ownership via RLS-scoped read.
        const { data: thread } = await supabase
          .from("chat_threads")
          .select("id")
          .eq("id", body.threadId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(body.messages),
          stopWhen: stepCountIs(50),
          abortSignal: request.signal,
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ responseMessage, isAborted }) => {
            if (isAborted) return;
            if (!responseMessage?.parts || responseMessage.parts.length === 0) return;
            const { error } = await supabase.from("chat_messages").insert({
              thread_id: body.threadId!,
              user_id: userId,
              role: "assistant",
              parts: responseMessage.parts as never,
            });
            if (error) console.error("chat insert error", error);
            await supabase
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", body.threadId!);
          },
          onError: (err) => {
            console.error("stream error", err);
            return err instanceof Error ? err.message : "Stream error";
          },
        });
      },
    },
  },
});
