import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowUp, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  askAssistant,
  clearThread,
  loadThread,
  newMessage,
  saveThread,
  SUGGESTED_PROMPTS,
  type AssistantMessage,
} from "@/lib/assistant";

/**
 * Floating launcher, bottom-right. Rendered only while the panel is closed so
 * it never sits on top of the panel content.
 */
export function AssistantLauncher({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open assistant"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-4 pr-5 py-3 shadow-lg hover:opacity-90 transition-opacity"
    >
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-semibold">Ask AI</span>
    </button>
  );
}

/**
 * Split-view assistant. This is a flex sibling of <main>, not an overlay — it
 * takes real width so the page content reflows beside it.
 */
export function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<AssistantMessage[]>(() => loadThread());
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveThread(messages);
  }, [messages]);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || thinking) return;

    setInput("");
    setMessages((prev) => [...prev, newMessage("user", question)]);
    setThinking(true);
    try {
      const reply = await askAssistant(question);
      setMessages((prev) => [...prev, newMessage("assistant", reply.text, reply.links)]);
    } finally {
      setThinking(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  }

  function reset() {
    clearThread();
    setMessages([]);
  }

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        "relative z-30 shrink-0 overflow-hidden border-l border-border bg-white transition-[width] duration-300 ease-in-out",
        open ? "w-[380px] max-w-[85vw]" : "w-0",
      )}
    >
      {/* Fixed inner width so text does not reflow while the panel animates */}
      <div className="flex h-full w-[380px] max-w-[85vw] flex-col">
        <header className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft">
            <Sparkles className="h-4 w-4 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight text-foreground">Assistant</p>
            <p className="truncate text-xs text-muted-foreground">Answers from your account data</p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              aria-label="Clear conversation"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Eraser className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close assistant"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !thinking && (
            <div className="pt-2">
              <p className="text-sm text-foreground">
                Ask me about recognition activity in this account.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                I read the same data as your dashboard, so the numbers always match.
              </p>
              <div className="mt-4 space-y-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => void send(p)}
                    className="block w-full rounded-xl border border-border bg-muted px-3 py-2 text-left text-xs text-foreground transition-colors hover:border-primary"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.links && m.links.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.links.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="rounded-full border border-border bg-white px-2.5 py-1 text-xs font-medium text-primary hover:border-primary"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-3 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-muted px-3 py-2 focus-within:border-primary">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about approvals, points, teams…"
              className="max-h-28 flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              size="sm"
              onClick={() => void send(input)}
              disabled={!input.trim() || thinking}
              aria-label="Send"
              className="h-7 w-7 shrink-0 rounded-full p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
