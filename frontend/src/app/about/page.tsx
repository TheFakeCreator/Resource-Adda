export const metadata = {
  title: "About Us - Resource Adda",
  description: "Learn more about Resource Adda and our mission.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            About Resource Adda
          </h1>
          <p className="text-xl text-muted-foreground">
            Empowering NITRR students through shared knowledge.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Resource Adda was built to solve a simple problem: the scattering
              of academic resources, interview experiences, and peer guidance
              across dozens of disjointed WhatsApp groups and Google Drives. Our
              mission is to provide a centralized, modern, and accessible
              platform for all students of NITRR.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground border-b border-white/10 pb-2">
              What We Offer
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Comprehensive academic resources and roadmaps.</li>
              <li>
                Authentic, community-shared interview experiences from seniors.
              </li>
              <li>An anonymous wellbeing space for open dialogue.</li>
              <li>A blogging platform to share your technical journey.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
