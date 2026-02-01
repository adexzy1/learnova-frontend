import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
        <p className="lead text-xl text-muted-foreground">
          Last updated: October 26, 2024
        </p>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Personal Identification Information:</strong> Name, email
              address, phone number, etc.
            </li>
            <li>
              <strong>Student Data:</strong> Grades, attendance records,
              disciplinary records, medical info (as provided by the school).
            </li>
            <li>
              <strong>Usage Data:</strong> Information on how the Service is
              accessed and used.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            2. How We Use Your Information
          </h2>
          <p>We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain the Service.</li>
            <li>To notify you about changes to our Service.</li>
            <li>
              To allow you to participate in interactive features of our
              Service.
            </li>
            <li>To provide customer support.</li>
            <li>To monitor the usage of the Service.</li>
            <li>To detect, prevent and address technical issues.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Data Retention</h2>
          <p>
            We will retain your Personal Data only for as long as is necessary
            for the purposes set out in this Privacy Policy. We will retain and
            use your Personal Data to the extent necessary to comply with our
            legal obligations (for example, if we are required to retain your
            data to comply with applicable laws), resolve disputes, and enforce
            our legal agreements and policies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Transfer</h2>
          <p>
            Your information, including Personal Data, may be transferred to —
            and maintained on — computers located outside of your state,
            province, country or other governmental jurisdiction where the data
            protection laws may differ than those from your jurisdiction.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no
            method of transmission over the Internet, or method of electronic
            storage is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Data, we cannot guarantee
            its absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Children&apos;s Privacy</h2>
          <p>
            Our Service addresses the needs of schools and students. We strictly
            adhere to applicable laws regarding children&apos;s data (such as
            COPPA in the US and GDPR in Europe). We do not knowingly collect
            personally identifiable information from anyone under the age of 18
            without parental or school consent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at privacy@schoolsms.com.
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
