import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin", "greek"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-heading",
  subsets: ["latin", "greek"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Λιμενική Αστυνομία — Ηλεκτρονικές κλήσεις",
  description:
    "Ψηφιακή καταχώρηση κλήσεων οχημάτων για τη Λιμενική Αστυνομία, με admin εύρεση ανά ημερομηνία και πινακίδα.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body
        className={`${sourceSans.variable} ${sourceSerif.variable} min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
