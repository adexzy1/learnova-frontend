import { redirect } from "next/navigation";
import SuperAdminShell from "@/components/layout/super-admin-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function SuperAdminLayout({
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
    <SuperAdminShell user={auth.user} permissions={auth.permissions}>
      {children}
    </SuperAdminShell>
  );
}
