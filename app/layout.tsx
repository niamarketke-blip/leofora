import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petale - Fresh Flowers",
  description: "Beautiful flowers delivered fresh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
