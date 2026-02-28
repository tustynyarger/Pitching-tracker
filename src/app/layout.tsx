import "./globals.css";

export const metadata = {
  title: "Softball Performance Tracker",
  description: "Track pitching sessions and performance analytics",
  manifest: "/manifest.json",
  themeColor: "#b4f000",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}