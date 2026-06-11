import { useApiVersion } from "../context/ApiVersionContext";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";

function VersionToggle() {
  const { version, setVersion } = useApiVersion();

  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-surf py-1.25 pl-2.5 pr-1.25 font-mono">
      <span className="text-[11px] tracking-widest text-faint">API</span>
      <div className="flex gap-0.75">
        {(["v1", "v2"] as const).map((x) => (
          <button
            key={x}
            onClick={() => setVersion(x)}
            className={`cursor-pointer rounded px-3 py-1 text-[12.5px] font-semibold transition ${
              version === x ? "bg-grn text-[#06140d]" : "bg-transparent text-mut hover:text-ink"
            }`}
          >
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TopBar() {
  const { logout } = useAuth();
  
  return (
    <div className="flex items-center justify-between border-b border-line bg-bg/70 px-6.5 py-3.75 backdrop-blur">
      <Logo />
      <div className="flex items-center gap-3.5">
        <VersionToggle />
        <div className="h-6 w-px bg-line" />
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-[7px] border border-line bg-surf2 font-mono text-xs font-bold text-grn">
            AD
          </div>
          <span className="font-mono text-[12.5px] text-mut">admin</span>
          <button
            onClick={logout}
            className="ml-1 cursor-pointer font-mono text-[11px] text-faint underline-offset-2 hover:text-danger hover:underline"
          >
            sair
          </button>
        </div>
      </div>
    </div>
  );
}