import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // profile data
  username: string | null;
  bio: string | null;

  signOut: () => Promise<void>;
}

/* ========================================================================== */
/* CONTEXT                                                                    */
/* ========================================================================== */

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  username: null,
  bio: null,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/* ========================================================================== */
/* PROVIDER                                                                   */
/* ========================================================================== */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* PROFILE FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, bio")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUsername(data.username ?? null);
      setBio(data.bio ?? null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* AUTH BOOTSTRAP + LISTENER                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      const session = data.session ?? null;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUsername(null);
        setBio(null);
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUsername(null);
        setBio(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* LOGOUT                                                                   */
  /* ------------------------------------------------------------------------ */

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUsername(null);
    setBio(null);
  };

  /* ------------------------------------------------------------------------ */
  /* PROVIDER                                                                 */
  /* ------------------------------------------------------------------------ */

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        username,
        bio,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
