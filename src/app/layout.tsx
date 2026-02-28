import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://YOUR-VERCEL-URL.vercel.app"),
  title: "Softball Performance Tracker",
  description: "Track pitching sessions and performance analytics",
  manifest: "/manifest.json",
  openGraph: {
    title: "Softball Performance Tracker",
    description: "Track pitching sessions and performance analytics",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const viewport = {
  themeColor: "#b4f000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}