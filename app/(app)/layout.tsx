import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getUserSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session) {
    redirect("/");
  }

  console.log(session);

  switch (session.nextAction) {
    case "COMPLETE_ONBOARDING":
      redirect("/onboarding");
    case "CHANGE_PASSWORD":
      redirect("/onboarding/change-password");
    default:
      break;
  }

  return (
    <AppShell
      user={session.user}
      permissions={session.permissions}
      personas={session?.personas}
      activePersona={session?.activePersona}
      nextAction={session?.nextAction}
    >
      {children}
    </AppShell>
  );
}
