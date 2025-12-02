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
    // 1. Get current user
    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) {
      throw new Error("Not authenticated");
    }

    const userId = auth.user.id;

    // 2. Call the Edge Function
    const { data, error } = await supabase.functions.invoke("install_package", {
      body: {
        packageId: "891550fd-4ab6-4103-a31e-5ba9e43acfad", // Essentials
        programId,
        userId,
      },
    });

    if (error) {
      console.error("❌ Edge Function error:", error);
      return { success: false, error };
    }

    console.log("✅ Project Installed:", data);

    return {
      success: true,
      installed: data,
    };
  } catch (err) {
    console.error("❌ projectInstaller FAILED:", err);
    return {
      success: false,
      error: err,
    };
  }
}
