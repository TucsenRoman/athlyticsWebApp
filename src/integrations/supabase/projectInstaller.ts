import { supabase } from "@/integrations/supabase/client";

/* -------------------------------------------------------------------------- */
/*  OFFICIAL PACKAGE IDS (Hard-coded, safe to reference)                      */
/* -------------------------------------------------------------------------- */

export const OFFICIAL_PACKAGES = {
  ESSENTIALS: "0d643ccc-a366-4ccb-8817-f797ddaee55d",
  // Add more later (e.g. XC, Track, Football, etc.)
  // TRACK_PACKAGE: "",
  // FOOTBALL_PACKAGE: "",
} as const;

/* -------------------------------------------------------------------------- */
/*  UNIVERSAL INSTALLER — install ANY package by ID                           */
/* -------------------------------------------------------------------------- */

export async function installPackage(packageId: string, programId: number) {
  try {
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) throw new Error("Not authenticated");

    const userId = auth.user.id;

    // FETCH SESSION
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    if (!accessToken) throw new Error("Missing access token");

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/install_package`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          packageId,
          programId,
          userId,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ installPackage → Edge Function Error:", data);
      return { success: false, error: data };
    }

    console.log("✅ installPackage → Installed:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ installPackage FAILED:", err);
    return { success: false, error: err };
  }
}

/* -------------------------------------------------------------------------- */
/*  HELPER: Install Essentials Package                                        */
/* -------------------------------------------------------------------------- */

export async function installEssentials(programId: number) {
  return installPackage(OFFICIAL_PACKAGES.ESSENTIALS, programId);
}

/* -------------------------------------------------------------------------- */
/*  BACKWARD COMPAT: projectInstaller() defaults to Essentials                */
/* -------------------------------------------------------------------------- */

export async function projectInstaller(programId: number) {
  return installEssentials(programId);
}
