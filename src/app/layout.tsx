import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Geist } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coffee Atlas – 당신의 커피 취향 기록",
  description: "어떤 카페가 좋았나요? 그날의 향기와 맛을 기록하고, 당신만의 특별한 커피 취향을 지도로 만들어보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${cormorant.variable} ${geist.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
