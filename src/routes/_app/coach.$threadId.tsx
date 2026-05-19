import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Plus, Trash2, Send, Square, Sparkles, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listThreads, createThread, getThread, deleteThread, saveUserMessage } from "@/lib/coach.functions";

export const Route = createFileRoute("/_app/coach/$threadId")({
  component: CoachPage,
});

const SUGGESTIONS = [
  "How do I start a budget from scratch?",
  "Explain index funds in simple terms",
  "What's the 50/30/20 rule?",
  "How big should my emergency fund be?",
];

function CoachPage() {
  const { threadId } = useParams({ from: "/_app/coach/$threadId" });
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Array<{ id: string; title: string; updated_at: string }>>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cancelSavedRef = useRef(false);

  const refreshThreads = async () => {
    try {
      const t = await listThreads();
      setThreads(t as never);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoaded(false);
    cancelSavedRef.current = false;
    (async () => {
      try {
        const { messages } = await getThread({ data: { threadId } });
        setInitialMessages(messages as unknown as UIMessage[]);
      } catch (e) {
        console.error(e);
        toast.error("Could not load conversation");
      } finally {
        setLoaded(true);
      }
    })();
    refreshThreads();
  }, [threadId]);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: { threadId },
    fetch: async (url, init) => {
      const { data } = await supabase.auth.getSession();
      const headers = new Headers(init?.headers);
      if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
      return fetch(url, { ...init, headers });
    },
  });

  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message),
    onFinish: async ({ message, isAbort }) => {
      if (isAbort && !cancelSavedRef.current) {
        cancelSavedRef.current = true;
        const parts = (message?.parts ?? []) as Array<{ type: string; text?: string }>;
        const cloned = parts.map((p) => ({ ...p }));
        let lastTextIdx = -1;
        cloned.forEach((p, i) => { if (p.type === "text") lastTextIdx = i; });
        if (lastTextIdx >= 0 && cloned[lastTextIdx].text !== undefined) {
          cloned[lastTextIdx].text = `${cloned[lastTextIdx].text}\n\n_Stopped._`;
        } else {
          cloned.push({ type: "text", text: "_Stopped._" });
        }
        try {
          const { error: insertErr } = await supabase.from("chat_messages").insert({
            thread_id: threadId,
            user_id: (await supabase.auth.getUser()).data.user!.id,
            role: "assistant",
            parts: cloned as never,
          });
          if (insertErr) console.error(insertErr);
        } catch (err) {
          console.error(err);
        }
      }
      refreshThreads();
    },
  });

  useEffect(() => {
    if (status === "submitted" || status === "streaming") cancelSavedRef.current = false;
  }, [status]);

  useEffect(() => { textareaRef.current?.focus(); }, [threadId, status]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    const parts = [{ type: "text" as const, text: trimmed }];
    try {
      await saveUserMessage({ data: { threadId, parts, text: trimmed } });
    } catch (e) {
      console.error(e);
    }
    await sendMessage({ text: trimmed });
  };

  const handleNewThread = async () => {
    const t = await createThread();
    await refreshThreads();
    navigate({ to: "/coach/$threadId", params: { threadId: t.id } });
  };

  const handleDelete = async (id: string) => {
    await deleteThread({ data: { threadId: id } });
    if (id === threadId) {
      const remaining = threads.filter((t) => t.id !== id);
      if (remaining.length) navigate({ to: "/coach/$threadId", params: { threadId: remaining[0].id } });
      else handleNewThread();
    } else {
      refreshThreads();
    }
  };

  return (
    <div className="-m-6 lg:-m-8 grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[260px_1fr]">
      {/* Thread list */}
      <aside className="hidden border-r border-border bg-card/40 md:flex md:flex-col">
        <div className="p-3">
          <Button onClick={handleNewThread} className="w-full justify-start gap-2" variant="outline">
            <Plus className="size-4" /> New chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            {threads.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition",
                  t.id === threadId ? "bg-sage-100 text-sage-800" : "hover:bg-muted",
                )}
              >
                <Link
                  to="/coach/$threadId"
                  params={{ threadId: t.id }}
                  className="flex-1 truncate"
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="rounded p-1 text-muted-foreground opacity-0 hover:bg-background hover:text-foreground group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Conversation */}
      <section className="flex min-h-0 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-6 py-3">
          <Bot className="size-4 text-sage-700" />
          <h1 className="text-sm font-medium">AI Money Coach</h1>
        </header>

        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-3xl px-6 py-8">
            {loaded && messages.length === 0 && (
              <div className="space-y-6 py-12 text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sage-100 text-sage-700">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">How can I help with your money today?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Ask anything about budgeting, saving, or investing.</p>
                </div>
                <div className="mx-auto grid max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="rounded-xl border border-border bg-card p-3 text-left text-sm transition hover:border-sage-300 hover:bg-sage-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((m) => (
                <MessageRow key={m.id} message={m} />
              ))}
              {status === "submitted" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-sage-100 text-sage-700"><Bot className="size-3.5" /></span>
                  <span className="animate-pulse">Thinking…</span>
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {error.message}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-background p-4">
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask Moneti about your money…"
              rows={1}
              className="min-h-[44px] resize-none rounded-2xl"
            />
            {isBusy ? (
              <Button onClick={() => stop()} size="icon" className="size-11 rounded-xl" variant="secondary" aria-label="Stop">
                <Square className="size-4" />
              </Button>
            ) : (
              <Button onClick={() => handleSend(input)} size="icon" className="size-11 rounded-xl bg-sage-600 hover:bg-sage-700" disabled={!input.trim()} aria-label="Send">
                <Send className="size-4" />
              </Button>
            )}
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
            Educational only — not licensed financial advice.
          </p>
        </div>
      </section>
    </div>
  );
}

function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = (message.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-foreground text-background" : "bg-sage-100 text-sage-700",
        )}
      >
        {isUser ? <UserIcon className="size-3.5" /> : <Bot className="size-3.5" />}
      </span>
      <div className={cn("max-w-[85%]", isUser && "text-right")}>
        {isUser ? (
          <div className="inline-block rounded-2xl rounded-tr-sm bg-foreground px-4 py-2 text-sm text-background">
            {text}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-2 prose-ol:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ""}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
