import { RoleGate } from "@/components/layout/RoleGate";
export default function Layout({ children }: { children: React.ReactNode }) { return <RoleGate expected="STUDENT">{children}</RoleGate>; }
