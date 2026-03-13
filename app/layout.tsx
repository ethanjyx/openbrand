import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenBrand — Extract brand assets from any website",
  description:
    "Extract logos, colors, and images from any website URL. Open-source brand asset extraction toolkit.",
  metadataBase: new URL("https://openbrand.sh"),
  openGraph: {
    title: "OpenBrand",
    description:
      "Extract logos, colors, and images from any website URL. Open-source brand asset extraction toolkit.",
    url: "https://openbrand.sh",
    siteName: "OpenBrand",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OpenBrand — Extract brand assets from any website",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenBrand",
    description:
      "Extract logos, colors, and images from any website URL. Open-source brand asset extraction toolkit.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
