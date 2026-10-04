import { NextResponse } from "next/server";
import { getUnifiedProducts } from "@/lib/products-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getUnifiedProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}
