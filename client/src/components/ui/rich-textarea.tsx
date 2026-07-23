import { useRef } from "react";
import { Bold, Italic } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Textarea with a tiny markdown toolbar — Bold (**…**) and Italic (*…*).
 * Selecting text and clicking a button wraps it; clicking with no selection
 * inserts the markers around the cursor so the user can type between them.
 *
 * Stored value is plain markdown. Use {@link renderRichText} or a markdown
 * library to render bold/italic in read-only displays.
 */
export function RichTextarea({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 5,
  className,
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrap(marker: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const inner = selected.length > 0 ? selected : "text";
    const next = `${before}${marker}${inner}${marker}${after}`;
    if (maxLength && next.length > maxLength) return;
    onChange(next);

    // Restore selection inside the wrappers so the user can keep typing.
    requestAnimationFrame(() => {
      if (!ref.current) return;
      const cursorStart = before.length + marker.length;
      const cursorEnd = cursorStart + inner.length;
      ref.current.focus();
      ref.current.setSelectionRange(cursorStart, cursorEnd);
    });
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-white focus-within:ring-1 focus-within:ring-stone-400 focus-within:border-stone-400 transition",
        className,
      )}
    >
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted">
        <ToolbarButton onClick={() => wrap("**")} label="Bold (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => wrap("*")} label="Italic (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <span className="text-[10px] text-muted-foreground ml-auto pr-1">
          Markdown — **bold**, *italic*
        </span>
      </div>
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => {
          const next = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
          onChange(next);
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
            e.preventDefault();
            wrap("**");
          } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
            e.preventDefault();
            wrap("*");
          }
        }}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-y bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Tiny markdown renderer for the limited grammar this editor produces:
 * `**bold**` and `*italic*`. Escapes raw HTML in the input so user-entered
 * tags can't render.
 */
export function renderRichText(md: string): { __html: string } {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/\n/g, "<br/>");
  return { __html: html };
}
