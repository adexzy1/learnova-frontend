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
  const pathname = headersList.get("x-invoke-path") || "";

  if (!session) {
    redirect("/");
  }

  // Protection logic: If password change is required, only allow that page
  if (
    session.nextAction === "CHANGE_PASSWORD" &&
    !pathname.includes("/change-password")
  ) {
    redirect("/onboarding/change-password");
  }

  // If password change is already done, don't let them back to change-password
  if (
    session.nextAction !== "CHANGE_PASSWORD" &&
    pathname.includes("/change-password")
  ) {
    redirect("/onboarding");
  }

  return (
    <OnboardingShell
      user={session.user}
      permissions={session.permissions}
      personas={session?.personas}
      activePersona={session?.activePersona}
      nextAction={session?.nextAction}
      onboardingStep={session?.onboardingStep}
    >
      {children}
    </OnboardingShell>
  );
}
