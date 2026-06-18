import WellbeingFeed from "@/components/wellbeing/WellbeingFeed";
import { HeartPulse } from "lucide-react";
import { SITE_CONSTANTS } from "@/config/constants";

export const metadata = {
  title: "Student Wellbeing - Resource Adda",
  description:
    "A safe, anonymous space for students to share, ask, and support each other.",
};

export default function WellbeingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Soft calming background elements */}
      <div className="absolute top-0 left-1/4 w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative z-10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-4">
            <HeartPulse className="w-4 h-4" />
            <span className="text-sm font-medium">Safe Space</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Student Wellbeing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            College is tough. You don't have to face it alone. Share your
            thoughts anonymously, ask for advice, or offer a listening ear to
            your peers.
          </p>
        </div>
      </section>

      {/* Main Feed Section */}
      <section className="relative z-10">
        <WellbeingFeed />
      </section>

      {/* Static Resources Footer */}
      <section className="mt-24 border-t border-white/5 bg-black/20 backdrop-blur-xl py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold">Need professional help?</h2>
          <p className="text-muted-foreground">
            If you are in immediate distress, please reach out to the campus
            counseling center or national helplines.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left w-full max-w-xs">
              <h3 className="font-semibold text-teal-400">Campus Counselor</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Available Mon-Fri, 10AM - 5PM
              </p>
              <p className="text-sm mt-2">{SITE_CONSTANTS.emails.counseling}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left w-full max-w-xs">
              <h3 className="font-semibold text-blue-400">
                Vandrevala Foundation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                24/7 National Mental Health Helpline
              </p>
              <p className="text-sm mt-2">9999 666 555</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
