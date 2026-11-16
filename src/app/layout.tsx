import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Merriweather,
  Plus_Jakarta_Sans,
  Roboto,
} from "next/font/google";
import { CVProvider } from "@/context/CVContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creativise CV Builder — Free Europass, Modern & ATS Resume Maker",
  description:
    "Create professional Europass, Modern, and ATS-friendly CVs online for free. Privacy-first local storage, instant PDF & DOCX export, and built-in ATS keyword matcher.",
  keywords: [
    "CV Builder",
    "Europass CV Maker",
    "ATS Resume Builder",
    "Free Resume Creator",
    "Creativise CV Builder",
    "DOCX CV Export",
  ],
  openGraph: {
    title: "Creativise CV Builder — Free Europass, Modern & ATS Resume Maker",
    description:
      "Create professional Europass, Modern, and ATS-friendly CVs online for free.",
    type: "website",
    url: "/",
    siteName: "Creativise CV Builder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creativise CV Builder — Free Europass, Modern & ATS Resume Maker",
    description:
      "Create professional Europass, Modern, and ATS-friendly CVs online for free.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jakarta.variable} ${merriweather.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CVProvider>{children}</CVProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Creativise CV Builder",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Create professional Europass, Modern, and ATS-friendly CVs online for free with privacy-first local storage.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
