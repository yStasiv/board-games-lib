import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Моя колекція настільних ігор",
  description: "Каталог настільних ігор у нашій шафі.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased">{children}</body>
    </html>
  );
}
