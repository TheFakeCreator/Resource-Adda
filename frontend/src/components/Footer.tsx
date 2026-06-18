import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { SITE_CONSTANTS } from "@/config/constants";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Resource-Adda
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {SITE_CONSTANTS.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-primary transition-colors"
                >
                  Study Materials
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="hover:text-primary transition-colors"
                >
                  Contribution Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="hover:text-primary transition-colors"
                >
                  Security Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Community</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href={SITE_CONSTANTS.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <FaGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href={SITE_CONSTANTS.socials.twitter}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <FaTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Join us in building the best platform for students!
            </p>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {SITE_CONSTANTS.name}. Open Source
            under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
