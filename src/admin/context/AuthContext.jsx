import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin as checkIsAdmin, signIn as apiSignIn, signOut as apiSignOut } from "@/admin/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolve = useCallback(async (sess) => {
    setSession(sess);
    setAdmin(sess?.user ? await checkIsAdmin(sess.user.id) : false);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      // Defer the async admin lookup: calling supabase methods *synchronously*
      // inside this callback can deadlock the client (documented caveat).
      setTimeout(() => resolve(sess), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [resolve]);

  const signIn = async (email, password) => {
    const res = await apiSignIn(email, password);
    if (!res.error) await resolve(res.data.session);
    return res;
  };

  const signOut = async () => {
    await apiSignOut();
    setSession(null);
    setAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isAdmin: admin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
