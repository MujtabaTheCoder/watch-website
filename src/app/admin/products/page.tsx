import React from "react";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { getUnifiedProducts } from "@/lib/products-store";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products: Product[] = await getUnifiedProducts();

  return <ProductManagement initialProducts={products} />;
}
