import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <p className="lead text-xl text-muted-foreground">
          Last updated: October 26, 2024
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the School Management System
            &quot;Service&quot;, you accept and agree to be bound by the terms
            and provision of this agreement. In addition, when using these
            particular services, you shall be subject to any posted guidelines
            or rules applicable to such services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Description of Service</h2>
          <p>
            The Service provides a comprehensive school management solution
            including but not limited to student information systems, grading,
            attendance tracking, and finance management. The Service is provided
            on an &quot;as is&quot; and &quot;as available&quot; basis.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. User Conduct</h2>
          <p>You agree to not use the Service to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Upload, post, email or otherwise transmit any content that is
              unlawful, harmful, threatening, abusive, harassing, tortuous,
              defamatory, vulgar, obscene, libelous, invasive of another&apos;s
              privacy, hateful, or racially, ethnically or otherwise
              objectionable.
            </li>
            <li>Impersonate any person or entity.</li>
            <li>
              Forge headers or otherwise manipulate identifiers in order to
              disguise the origin of any content transmitted through the
              Service.
            </li>
            <li>
              Upload or transmit any material that contains software viruses or
              any other computer code, files or programs designed to interrupt,
              destroy or limit the functionality of any computer software or
              hardware or telecommunications equipment.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Privacy & Security</h2>
          <p>
            We take data security seriously. Your data is encrypted and stored
            securely. We do not sell your personal data or student data to third
            parties. For more information, please refer to our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. If a revision is material we will try to
            provide at least 30 days notice prior to any new terms taking
            effect.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at
            support@schoolsms.com.
          </p>
        </section>
      </div>

      <div className="border-t pt-8 text-sm text-muted-foreground text-center">
        &copy; {new Date().getFullYear()} School Management System. All rights
        reserved.
      </div>
    </div>
  );
}
