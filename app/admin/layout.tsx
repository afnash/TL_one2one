import { RoleGate } from "@/components/layout/RoleGate";
import { isAdmin } from "@/lib/admin-session";
import { redirect } from "next/navigation";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { if (!await isAdmin()) redirect("/manage"); return <RoleGate expected="SUPERADMIN">{children}</RoleGate>; }
