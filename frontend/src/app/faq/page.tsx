import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "FAQ - Resource Adda",
  description: "Frequently asked questions about Resource Adda.",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background relative py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <Accordion className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-lg">
                Who can join Resource Adda?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Resource Adda is strictly for the students of NITRR. You must
                have an active institutional email address (@nitrr.ac.in) to
                create an account and access the platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-lg">
                Is the Wellbeing section truly anonymous?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Yes. While we keep a secure record of who posts what to prevent
                spam and harassment, your identity (name, email, avatar) is
                completely hidden from other users when you post in the
                Wellbeing section.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-lg">
                How do I contribute a new Roadmap or Resource?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                You can submit resources and roadmaps from your Dashboard.
                Submissions are published immediately to the platform. We rely
                on the community to report inappropriate or low-quality content.
                If a post receives enough reports, it is automatically
                shadowbanned and reviewed by our admins.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-lg">
                I found a bug. Where do I report it?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                Please visit the Contact page and send an email to our support
                address. We appreciate your help in making the platform better!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
