export const metadata = {
  title: "Community Guidelines - Resource Adda",
  description: "Rules and guidelines for interacting on Resource Adda.",
};

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Community & Contribution Guidelines
          </h1>
          <p className="text-xl text-muted-foreground">
            How we keep Resource Adda safe, helpful, and welcoming for everyone.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Be Respectful
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Treat everyone with respect. Harassment, hate speech, bullying,
              and personal attacks are strictly prohibited and will result in an
              immediate ban from the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Contribution Guidelines
            </h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              <p>
                When submitting new resources, roadmaps, or interview
                experiences, please ensure they are:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Accurate & Up-to-date:</strong> Verify that notes or
                  roadmaps are relevant to the current curriculum or tech
                  landscape.
                </li>
                <li>
                  <strong>Well-Formatted:</strong> Use clear titles, tags, and
                  Markdown formatting (for blogs and experiences) to make your
                  content easy to read.
                </li>
                <li>
                  <strong>Original Work:</strong> If you are sharing notes or
                  experiences, ensure you have the right to share them. Do not
                  plagiarize blogs or articles.
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Share Constructively
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Whether you are posting an interview experience, a blog, or
              replying in the Wellbeing section, ensure your contribution is
              helpful and constructive. Avoid spamming or posting irrelevant
              content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Maintain Academic Integrity
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Do not use the platform to facilitate cheating. Sharing resources
              is highly encouraged, but sharing answers during active exams or
              assignments violates academic integrity policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2 text-rose-500">
              Moderation & Zero-Tolerance Policy
            </h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">
              <p>
                We rely on the community to keep Resource Adda safe. Every post,
                resource, and comment has a <strong>Report button</strong>.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Shadowbanning:</strong> If any piece of content
                  receives 5 independent reports, it is automatically
                  shadowbanned (hidden from the public) and sent to
                  administrators for review.
                </li>
                <li>
                  <strong>Account Suspension:</strong> If 3 of your
                  contributions are shadowbanned, your account will be
                  automatically and permanently suspended.
                </li>
                <li>
                  <strong>Anonymity is Not Immunity:</strong> The "Post
                  Anonymously" feature hides your identity from the public feed,
                  but your actions remain linked to your account in our secure
                  database. If you abuse anonymity to harass others or post
                  inappropriate content, you will be banned.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
