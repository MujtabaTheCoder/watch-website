import React from "react";
import { getStoreSettings } from "@/lib/data";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();
  return <StoreSettingsForm initialSettings={settings} />;
}
