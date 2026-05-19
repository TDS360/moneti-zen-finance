import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
type SerializedMessage = { id: string; role: string; parts: unknown[] };

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id,title,updated_at,created_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, title: "New conversation" })
      .select("id,title,updated_at,created_at")
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const getThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const [{ data: thread, error: tErr }, { data: msgs, error: mErr }] = await Promise.all([
      supabase.from("chat_threads").select("id,title,updated_at").eq("id", data.threadId).maybeSingle(),
      supabase.from("chat_messages").select("id,role,parts,created_at").eq("thread_id", data.threadId).order("created_at"),
    ]);
    if (tErr) throw new Error(tErr.message);
    if (mErr) throw new Error(mErr.message);
    if (!thread) throw new Error("Thread not found");
    const messages: SerializedMessage[] = (msgs ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      parts: (m.parts as unknown[]) ?? [],
    }));
    return { thread, messages };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ threadId: z.string().uuid(), title: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("chat_threads").update({ title: data.title, updated_at: new Date().toISOString() }).eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ threadId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    await supabase.from("chat_messages").delete().eq("thread_id", data.threadId);
    const { error } = await supabase.from("chat_threads").delete().eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveUserMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      threadId: z.string().uuid(),
      parts: z.array(z.any()),
      text: z.string().optional(),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "user",
      parts: data.parts as never,
    });
    if (error) throw new Error(error.message);

    // Update thread title from the first user message if still default.
    if (data.text) {
      const { data: thread } = await supabase.from("chat_threads").select("title").eq("id", data.threadId).maybeSingle();
      if (thread && thread.title === "New conversation") {
        const title = data.text.slice(0, 60).trim();
        await supabase.from("chat_threads").update({ title, updated_at: new Date().toISOString() }).eq("id", data.threadId);
      } else {
        await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", data.threadId);
      }
    }
    return { ok: true };
  });

export const saveAssistantMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      threadId: z.string().uuid(),
      parts: z.array(z.any()),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: userId,
      role: "assistant",
      parts: data.parts as never,
    });
    if (error) throw new Error(error.message);
    await supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", data.threadId);
    return { ok: true };
  });
