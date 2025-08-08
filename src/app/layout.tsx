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

const hostGrotesk = localFont({
  variable: "--font-host-grotesk",
  display: "swap",
  src: [
    { path: "../../public/fonts/host-grotesk/HostGrotesk-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/fonts/host-grotesk/HostGrotesk-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
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
  <body className={`${libertinus.variable} ${hostGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
