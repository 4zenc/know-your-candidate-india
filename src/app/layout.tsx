import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { I18nProvider } from "@/i18n/provider";
import { Navbar } from "@/components/Navbar";
import { SearchModal } from "@/components/SearchModal";
import { getDisclaimer, getSearchIndex } from "@/lib/data-service";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });

export const metadata: Metadata = {
  title: { default: "Know Your Candidate — Indian Civic Transparency", template: "%s · Know Your Candidate" },
  description: "Non-partisan, data-driven view of Indian constituencies: candidate affidavits, criminal disclosures, MPLADS spending and manifesto promise tracking.",
};

export const viewport: Viewport = { themeColor: "#09090b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const index = getSearchIndex();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <I18nProvider>
          <Navbar />
          <SearchModal index={index} />
          <div className="border-b border-line bg-surface px-4 py-2 text-center text-xs text-muted">{getDisclaimer()}</div>
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-6xl border-t border-line px-4 py-8 text-xs text-muted">
            Non-partisan civic information. Always verify against primary sources before relying on any figure.
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
