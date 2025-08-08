import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const libertinus = localFont({
  variable: "--font-libertinus",
  display: "swap",
  src: [
    { path: "../../public/fonts/libertinus/LibertinusSerif-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/libertinus/LibertinusSerif-Italic.otf", weight: "400", style: "italic" },
    { path: "../../public/fonts/libertinus/LibertinusSerif-Semibold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/libertinus/LibertinusSerif-SemiboldItalic.otf", weight: "600", style: "italic" },
    { path: "../../public/fonts/libertinus/LibertinusSerif-Bold.otf", weight: "700", style: "normal" },
    { path: "../../public/fonts/libertinus/LibertinusSerif-BoldItalic.otf", weight: "700", style: "italic" },
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
  <body className={`${libertinus.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
