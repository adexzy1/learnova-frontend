import { redirect } from "next/navigation";
import { TenantShell } from "@/components/layout/tenant-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentUser();
  console.log(auth);

  if (!auth) {
    redirect("/");
  }

  return (
    <TenantShell user={auth.user} permissions={auth.permissions}>
      {children}
    </TenantShell>
  );
}
