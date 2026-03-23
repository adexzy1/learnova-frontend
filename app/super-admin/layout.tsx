import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser, getUserSession } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getCurrentUser();
  const session = await getUserSession();

  if (!auth) {
    redirect("/");
  }

  return (
    <AppShell
      user={session?.user || auth.user}
      permissions={session?.permissions || auth.permissions}
      personas={session?.personas}
      activePersona={session?.activePersona}
      nextAction={session?.nextAction}
    >
      {children}
    </AppShell>
  );
}
