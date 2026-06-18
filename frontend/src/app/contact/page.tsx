import { Mail, MapPin } from "lucide-react";
import { SITE_CONSTANTS } from "@/config/constants";

export const metadata = {
  title: "Contact Us - Resource Adda",
  description: "Get in touch with the Resource Adda team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground">
            Have a question, feedback, or want to contribute to the platform?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Email</h2>
            <p className="text-muted-foreground">
              For general inquiries, bug reports, and support:
            </p>
            <a
              href={`mailto:${SITE_CONSTANTS.emails.support}`}
              className="text-primary hover:underline font-medium inline-block mt-2"
            >
              {SITE_CONSTANTS.emails.support}
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
            <div className="h-12 w-12 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-500 mb-6">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Campus</h2>
            <p className="text-muted-foreground leading-relaxed">
              {SITE_CONSTANTS.location.name}
              <br />
              {SITE_CONSTANTS.location.address}
              <br />
              {SITE_CONSTANTS.location.state}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
