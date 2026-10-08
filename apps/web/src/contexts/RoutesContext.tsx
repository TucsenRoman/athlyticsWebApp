import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchRoutes } from "@/lib/routes";

const RoutesContext = createContext<any>(null);

export function RoutesProvider({ ledgerId, children }) {
  const [routes, setRoutes] = useState([]);

  async function loadRoutes() {
    const { data } = await fetchRoutes(ledgerId);
    setRoutes(data || []);
  }

  useEffect(() => {
    loadRoutes();
  }, [ledgerId]);

  return (
    <RoutesContext.Provider value={{ routes, loadRoutes }}>
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes() {
  return useContext(RoutesContext);
}
