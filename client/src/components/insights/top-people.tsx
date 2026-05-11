import type { PersonStat } from "@/lib/insights-data";

export function TopPeople({ title, hint, people }: { title: string; hint?: string; people: PersonStat[] }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
        {hint && <p className="text-xs text-stone-500 mt-0.5">{hint}</p>}
      </header>
      <ol className="space-y-2.5">
        {people.map((p, i) => (
          <li key={p.name} className="flex items-center gap-2.5">
            <span className="w-5 text-xs font-semibold text-stone-400 text-center">{i + 1}</span>
            <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-stone-900 truncate">{p.name}</p>
              {p.role && <p className="text-xs text-stone-500 truncate">{p.role}</p>}
            </div>
            <span className="text-sm font-semibold text-stone-900 shrink-0 tabular-nums">{p.count}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
