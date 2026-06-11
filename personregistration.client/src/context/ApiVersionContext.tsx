import { createContext, useContext, useState, type ReactNode } from "react";

export type ApiVersion = "v1" | "v2";

interface ApiVersionContextType {
  version: ApiVersion;
  setVersion: (version: ApiVersion) => void;
}

// Using context instead of Redux since it is a small application,
// and I want to keep it simple.

const ApiVersionContext = createContext<ApiVersionContextType | undefined>(undefined);

export function ApiVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<ApiVersion>("v1");

  return (
    <ApiVersionContext.Provider value={{ version, setVersion }}>
      {children}
    </ApiVersionContext.Provider>
  );
}

export function useApiVersion() {
  const context = useContext(ApiVersionContext);

  if (context === undefined) {
    throw new Error("useApiVersion deve ser usado dentro de ApiVersionProvider");
  }
  
  return context;
}