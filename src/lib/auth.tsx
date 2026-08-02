import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  user_id: string | null;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  job_title: string | null;
  organization: string | null;
  field: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  blood_group: string | null;
  birth_day: number | null;
  birth_month: number | null;
  bio: string | null;
  section: string | null;
  roll: string | null;
  hide_phone: boolean;
  is_approved: boolean;
  created_at: string;
};

type AuthValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: string[];
  isAdmin: boolean;
  isStaff: boolean;
  isApproved: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((p as Profile) ?? null);
    setRoles((r ?? []).map((x: { role: string }) => x.role));
  }, []);

  useEffect(() => {
    let alive = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!alive) return;
      setSession(s);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user?.id) void load(session.user.id);
  }, [session?.user?.id, load]);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) await load(session.user.id);
  }, [session?.user?.id, load]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    await router.navigate({ to: "/", replace: true });
  }, [router]);

  const value: AuthValue = {
    loading,
    session,
    user: session?.user ?? null,
    profile,
    roles,
    isAdmin: roles.includes("admin"),
    isStaff: roles.includes("admin") || roles.includes("moderator"),
    isApproved: !!profile?.is_approved,
    refreshProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
