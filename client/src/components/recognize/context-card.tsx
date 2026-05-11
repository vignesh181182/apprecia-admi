import type { Employee, RecognizeBadge } from "@/lib/recognize-data";

export function ContextCard({
  employee,
  badge,
  verb = "Appreciating",
}: {
  employee: Employee;
  badge?: RecognizeBadge;
  verb?: string;
}) {
  return (
    <div className="bg-white rounded-2xl px-3 py-2.5 space-y-2">
      <div className="flex items-center gap-3">
        <img src={employee.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-stone-500 leading-tight">{verb}</p>
          <p className="font-mobile font-semibold text-[#a87a3a] truncate leading-tight">
            {employee.name}
          </p>
          <p className="text-xs text-stone-600 truncate">{employee.role}</p>
        </div>
      </div>
      {badge && (
        <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
          <span className="w-10 flex justify-center text-xl shrink-0">{badge.emoji}</span>
          <p className="font-mobile font-semibold text-[#a87a3a] truncate">{badge.label}</p>
        </div>
      )}
    </div>
  );
}
