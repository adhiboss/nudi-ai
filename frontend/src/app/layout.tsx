import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nudi AI - Turn Photos and Text into Talking Videos",
  description: "Create realistic talking videos with AI. Just a photo, a script, and a voice. No editing skills required.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakartaSans.variable} font-sans scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 antialiased selection:bg-[#fa256c] selection:text-white">
        {children}
      </body>
    </html>
  );
}
