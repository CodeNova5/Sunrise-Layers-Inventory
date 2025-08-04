import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { appDescription, appTitle } from "@/data";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: { default: "Dashboard", template: `%s | ${appTitle}` },
  description: appDescription,
  applicationName: appTitle,
  authors: [{ name: "Dave Mcsavvy", url: "https://mcsavvy.is-a.dev" }],
};
export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} safe-container`}>
        <ToastContainer position="top-center" hideProgressBar />

        {children}
      </body>
    </html>
  );
}
