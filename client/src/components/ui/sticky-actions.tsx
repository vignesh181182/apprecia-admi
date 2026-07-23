import { cn } from "@/lib/utils";

/**
 * Pins a row of action buttons (Save, Cancel, etc.) to the bottom of the
 * nearest scrolling ancestor. Use as the last child of a scrollable page
 * container so users don't miss the Save button when the form is long.
 */
export function StickyActions({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "between" | "end";
}) {
  const alignClass =
    align === "start" ? "justify-start" : align === "between" ? "justify-between" : "justify-end";
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-6 px-6 py-3 mt-2 bg-white/95 backdrop-blur border-t border-border shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.12)]",
        "flex items-center gap-2",
        alignClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
