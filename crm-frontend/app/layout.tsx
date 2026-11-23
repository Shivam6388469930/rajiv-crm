import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpticCRM - Modern Optical Store & Clinic Practice Management",
  description:
    "All-in-one optical CRM for optometrists, eyewear brands, clinics, inventory tracking, and billing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
