import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycwxjqwktazjttmjglla.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_guRi1Uo2lCJPfAAFPEJ_Sw_kel-CFVX"
  );
}
