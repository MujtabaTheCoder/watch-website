import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbLatencyMs = 0;

  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycwxjqwktazjttmjglla.supabase.co";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_guRi1Uo2lCJPfAAFPEJ_Sw_kel-CFVX";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const dbStart = Date.now();
    const { error } = await supabase.from("settings").select("key").limit(1);
    dbLatencyMs = Date.now() - dbStart;

    if (error) {
      dbStatus = "degraded";
    }
  } catch {
    dbStatus = "unavailable";
  }

  const totalLatencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: dbStatus === "healthy" ? "pass" : "warn",
      brand: "VELLORE",
      tagline: "Time, Refined.",
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        latency_ms: dbLatencyMs,
      },
      server: {
        latency_ms: totalLatencyMs,
        node_env: process.env.NODE_ENV,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
