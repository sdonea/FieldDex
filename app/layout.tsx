import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Silkscreen } from "next/font/google";
import "./globals.css";

const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", display: "swap" });
const silkscreen = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-silkscreen", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://fielddex-delta.vercel.app"),
  title: "Field Dex: collect the wildlife near you",
  description:
    "Enter a US ZIP code and get a deck of collectible cards for every species logged on iNaturalist within 10 km this week, rarest first.",
  twitter: { card: "summary_large_image" }, // X falls back to app/opengraph-image.png
};

export const viewport: Viewport = { themeColor: "#ee3131" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${pixelify.variable} ${silkscreen.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
