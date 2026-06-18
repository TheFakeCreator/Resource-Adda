export const metadata = {
  title: "Terms of Service - Resource Adda",
  description: "Terms of service and usage rules for Resource Adda.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using our platform.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              1. Platform Exclusivity
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Resource Adda is strictly built for the students of National
              Institute of Technology Raipur (NITRR). You are strictly required
              to use your official <strong>@nitrr.ac.in</strong> email address
              to register. Any attempts to bypass this domain restriction are
              prohibited.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              2. Content Submission & Community Moderation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Contributions (such as Roadmaps, Interview Experiences, Resources,
              and Wellbeing posts) are published immediately to the platform. We
              rely on community moderation to maintain content quality. By
              submitting content, you agree that your posts may be reported by
              other users and subsequently reviewed, edited, or deleted by
              Administrators at our discretion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              3. Conduct & Enforcement
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to post content that is illegal, abusive,
              plagiarized, or violates the Community Guidelines. Our automated
              moderation system enforces strict penalties:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Content Shadowbanning:</strong> Any contribution that
                receives 5 independent reports is automatically shadowbanned
                (removed from public view) and flagged for administrative
                review.
              </li>
              <li>
                <strong>Account Suspension:</strong> If 3 of your contributions
                are shadowbanned, your account will be automatically and
                permanently suspended.
              </li>
              <li>
                <strong>Anonymity Clause:</strong> The "Post Anonymously"
                feature in the Wellbeing section hides your identity from the
                public feed, but your actions remain linked to your account.
                Abuse of this feature will lead to account suspension.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              4. Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Resource Adda is provided "as is" and "as available". We do not
              guarantee the absolute accuracy of user-submitted notes or
              interview experiences. We are not liable for any academic or
              career outcomes resulting from the use of this platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
