import { createClient } from "@supabase/supabase-js";

async function clearDbOrders() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ycwxjqwktazjttmjglla.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_guRi1Uo2lCJPfAAFPEJ_Sw_kel-CFVX";
  const supabase = createClient(url, anonKey);

  try {
    const { error: itemsErr } = await supabase.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("Deleted order_items:", itemsErr ? itemsErr.message : "Success");

    const { error: ordersErr } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("Deleted orders:", ordersErr ? ordersErr.message : "Success");
  } catch (e) {
    console.log("Supabase cleanup note:", e.message);
  }
}

clearDbOrders();
