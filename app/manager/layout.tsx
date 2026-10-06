import { RoleGate } from "@/components/layout/RoleGate";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate expected="MANAGER">{children}</RoleGate>;
}
