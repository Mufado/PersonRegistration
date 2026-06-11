export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-7.5 w-7.5 place-items-center rounded-[7px] bg-grn shadow-[0_0_18px_rgba(93,255,159,0.5)]">
        <span className="font-mono text-[15px] font-bold text-[#06140d]">{">"}</span>
      </div>
      <div className="font-mono text-[14.5px] font-semibold tracking-tight">
        pessoas<span className="text-grn2">.api</span>
      </div>
    </div>
  );
}