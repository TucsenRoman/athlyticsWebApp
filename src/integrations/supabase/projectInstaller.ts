import { supabase } from "@/integrations/supabase/client";

/**
 * projectInstaller
 * -----------------
 * Calls the Edge Function "install_package" to install the default
 * Essentials Package into a program. 
 *
 * All heavy cloning logic is inside the Edge Function.
 */
export async function projectInstaller(programId: number) {
  try {
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) throw new Error("Not authenticated");

    const userId = auth.user.id;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/install_package`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: "891550fd-4ab6-4103-a31e-5ba9e43acfad",
          programId,
          userId,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Edge Function HTTP Error:", data);
      return { success: false, error: data };
    }

    console.log("✅ Project Installed:", data);

    return { success: true, installed: data };
  } catch (err) {
    console.error("❌ projectInstaller FAILED:", err);
    return { success: false, error: err };
  }
}
