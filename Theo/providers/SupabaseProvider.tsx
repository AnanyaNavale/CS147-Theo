import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, getCurrentSession, onAuthStateChange } from "@/lib/supabase";

interface SupabaseContextValue {
  supabase: typeof supabase;
  session: Session | null;
  isSessionLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined
);

/**
 * Provides Supabase client and session state to the React tree.
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((currentSession) => {
        if (isMounted) {
          setSession(currentSession);
          setIsSessionLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to hydrate session", error);
        if (isMounted) {
          setIsSessionLoading(false);
        }
      });

    const unsubscribe = onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ supabase, session, isSessionLoading }),
    [session, isSessionLoading]
  );

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

/**
 * Retrieves Supabase context for child components.
 */
export function useSupabase() {
  const context = useContext(SupabaseContext);

  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return context;
}
