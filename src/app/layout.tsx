import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// LTRemark font family from /public/fonts
const remark = localFont({
  variable: "--font-remark",
  display: "swap",
  src: [
    { path: "../../public/fonts/LTRemark-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/LTRemark-Italic.otf", weight: "400", style: "italic" },
    { path: "../../public/fonts/LTRemark-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/LTRemark-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../../public/fonts/LTRemark-Black.otf", weight: "900", style: "normal" },
    { path: "../../public/fonts/LTRemark-BlackItalic.otf", weight: "900", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: "The Last Teacher — Write",
  description: "Minimal writing surface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
  <body className={`${remark.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
