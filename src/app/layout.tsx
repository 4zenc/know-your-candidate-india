import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { I18nProvider } from "@/i18n/provider";
import { Navbar } from "@/components/Navbar";
import { SearchModal } from "@/components/SearchModal";
import { getMeta } from "@/lib/data-service";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });

export const metadata: Metadata = {
  title: { default: "Know Your MP — 543 Lok Sabha constituencies", template: "%s · Know Your MP" },
  description: "Find your MP in the 18th Lok Sabha: declared assets, criminal cases, attendance and questions, with links to the original sources. Includes an RTI application generator.",
};

export const viewport: Viewport = { themeColor: "#09090b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const meta = getMeta();
  return (
    <html lang="en">
      <body className={`${geistSans.variable} min-h-screen antialiased`}>
        <I18nProvider>
          <Navbar />
          <SearchModal />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-6xl space-y-1 border-t border-line px-4 py-8 text-xs text-muted print:hidden">
            <p>
              Sources: <a className="underline" href="https://www.myneta.info/LokSabha2024/">ADR / MyNeta</a> (self-declared 2024 affidavits),{" "}
              <a className="underline" href="https://prsindia.org/mptrack">PRS MP Track</a> (parliamentary activity), Wikipedia (result margins), {" "}
              <a className="underline" href="https://affidavit.eci.gov.in/">ECI</a>. Data fetched {meta.generated}.
            </p>
            <p>A declared case is an allegation, not a conviction. Verify against primary sources before sharing. Non-partisan; not affiliated with any party or government body.</p>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
