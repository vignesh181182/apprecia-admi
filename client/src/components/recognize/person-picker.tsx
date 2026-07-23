import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EMPLOYEES, type Employee } from "@/lib/recognize-data";

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold text-foreground">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  );
}

export function PersonPicker({
  selectedId,
  onSelect,
}: {
  selectedId?: string;
  onSelect: (employee: Employee) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EMPLOYEES;
    return EMPLOYEES.filter((e) => e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-full h-11 pl-10 pr-4 rounded-full bg-white border border-border focus:border-border focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-colors"
        />
      </div>

      {results.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No teammates match "{query}".</p>
      ) : (
        <ul className="divide-y divide-border">
          {results.map((p) => {
            const selected = p.id === selectedId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect(p)}
                  className={`w-full flex items-center gap-3 py-3 px-1 text-left transition-colors rounded-lg ${
                    selected ? "bg-amber-50" : "hover:bg-muted"
                  }`}
                >
                  <img src={p.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-primary font-mobile font-semibold truncate">
                      {highlight(p.name, query)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{p.role}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
