import type { ReactNode } from "react";

export function SectionTitle({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="mb-3.75 flex items-center gap-2.5">
      <span className="font-mono text-[12.5px] font-semibold text-grn">{">"} {title}</span>
      {badge && (
        <span className="rounded border border-grn/40 bg-grn/12 px-2 py-0.5 font-mono text-[10px] text-grn">
          {badge}
        </span>
      )}
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

export function Field({
  label, required, hint, error, valid, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string;
  valid?: boolean; children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.75 flex gap-1.25 whitespace-nowrap font-mono text-[11px] uppercase tracking-wide text-mut">
        {label}{required && <span className="text-grn">*</span>}
      </div>
      <div className="relative">
        {children}
        {valid && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute right-3 top-3.25 text-grn">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {error && <div className="mt-1.5 font-mono text-[10.5px] text-danger">{error}</div>}
      {!error && hint && <div className="mt-1.5 font-mono text-[10.5px] text-faint">{hint}</div>}
    </div>
  );
}