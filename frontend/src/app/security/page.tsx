import { SITE_CONSTANTS } from "@/config/constants";

export const metadata = {
  title: "Security Policy - Resource Adda",
  description: "Vulnerability reporting and security policy for Resource Adda.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Security Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            We take the security of Resource Adda and student data seriously.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Reporting a Vulnerability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you discover a security vulnerability within Resource Adda,
              please do not exploit it or share it publicly. Instead,
              responsibly disclose it to our team by emailing{" "}
              <strong>{SITE_CONSTANTS.emails.security}</strong>. We will
              investigate all legitimate reports and do our best to quickly fix
              the problem.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Our Commitment
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                We will acknowledge receipt of your vulnerability report
                quickly.
              </li>
              <li>
                We will provide an estimated timeframe for addressing the
                vulnerability.
              </li>
              <li>We will notify you when the vulnerability has been fixed.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Authentication Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We rely entirely on Google OAuth for authentication, ensuring that
              we never store or manage user passwords. We strictly validate
              email domains to ensure platform exclusivity.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Data Privacy & Anonymity
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              While features like the Wellbeing section allow for public
              anonymity, we securely link all contributions to the authenticated
              user account in our backend databases. This cryptographic linkage
              is strictly protected, never exposed to the public feed, and is
              accessed exclusively by our automated moderation system or System
              Administrators to enforce community guidelines and suspend abusive
              accounts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
