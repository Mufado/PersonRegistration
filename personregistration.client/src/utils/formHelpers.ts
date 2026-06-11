import type { UseFormRegisterReturn } from "react-hook-form";

export const inputClass =
  "w-full rounded-md border border-line bg-[#0a0f10] px-[13px] py-[11px] pr-9 font-mono text-sm "
    + "text-ink outline-none placeholder:text-faint focus:border-grn2 focus:ring-2 focus:ring-grn/15";

export function restrict(reg: UseFormRegisterReturn, pattern: RegExp): UseFormRegisterReturn {
  return {
    ...reg,
    onChange: (e: { target: HTMLInputElement; type?: string }) => {
      e.target.value = e.target.value.replace(pattern, "");
      return reg.onChange(e);
    },
  };
}