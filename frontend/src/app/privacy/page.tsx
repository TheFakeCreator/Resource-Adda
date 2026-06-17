export const metadata = {
  title: "Privacy Policy - Resource Adda",
  description: "Privacy policy and data handling for Resource Adda.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Because Resource Adda is built exclusively for NIT Raipur
              students, we employ strict data collection boundaries:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Authentication Data:</strong> We exclusively use Google
                OAuth for login. We never collect or store passwords. From
                Google, we only store your `googleId`, `name`, `email`, and
                `avatarUrl`.
              </li>
              <li>
                <strong>Academic Profile:</strong> To contextualize advice, we
                ask for your `branch` and `semester`.
              </li>
              <li>
                <strong>User-Generated Content:</strong> Any blogs, roadmaps,
                interview experiences, comments, or wellbeing posts you submit
                are stored in our MongoDB database.
              </li>
              <li>
                <strong>Media Uploads:</strong> Images or videos attached to
                your posts are securely uploaded to Cloudinary and linked in our
                database.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your email address is strictly used during the OAuth callback to
              verify your <strong>@nitrr.ac.in</strong> domain status, ensuring
              platform exclusivity. Your profile details (branch, semester) are
              attached to your public posts (like Blogs and Placements) to help
              peers evaluate the context of your advice. We do not use your data
              for marketing or tracking.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              3. The Anonymity Guarantee (Wellbeing Section)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We understand the need for a safe, judgment-free space. When you
              toggle "Post Anonymously" in the Wellbeing section:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Our backend controllers actively intercept the database payload
                before it is ever sent to the network.
              </li>
              <li>
                Your actual `author` object is scrubbed and replaced with a
                static <em>"Anonymous Student"</em> profile.
              </li>
              <li>
                Your identity is never exposed to the client-side browser or
                public APIs.
              </li>
              <li>
                <em>Note:</em> Your underlying User ID remains linked to the
                post securely within our internal database. This is strictly to
                allow admins to moderate abusive content or shadowban malicious
                users.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              4. Data Retention and Deletion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is retained as long as your account is active. Since we
              rely on Google OAuth, revoking our app's access via your Google
              Account settings prevents future logins. To request full deletion
              of your profile and associated posts from our database, please
              contact the administrators.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
