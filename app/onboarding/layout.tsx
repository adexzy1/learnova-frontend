import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserSession } from "@/lib/auth";
import { OnboardingShell } from "@/components/layout/onboarding-shell";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  if (!session) {
    redirect("/");
  }

  console.log(session);

  // Protection logic: If password change is required, only allow that page
  if (
    session.data.nextAction === "CHANGE_PASSWORD" &&
    !pathname.includes("/onboarding/change-password")
  ) {
    redirect("/onboarding/change-password");
  }

  // If password change is already done, don't let them back to change-password
  if (
    session.data.nextAction !== "CHANGE_PASSWORD" &&
    pathname.includes("/change-password")
  ) {
    redirect("/onboarding");
  }

  return (
    <OnboardingShell
      user={session.data.user}
      permissions={session.data.permissions}
      personas={session?.data.personas}
      activePersona={session?.data.activePersona}
      nextAction={session?.data.nextAction}
      onboardingStep={session?.data.onboardingStep}
    >
      {children}
    </OnboardingShell>
  );
}
