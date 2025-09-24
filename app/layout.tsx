import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { LoadingProvider } from "./components/UI/Loading/LoadingContext";
import TopLoadingBar from "./components/UI/Loading/TopLoadingBar";
import QueryProvider from "./queryProvider";
import GlobalSubscriptionProvider from "./components/Providers/GlobalSubscriptionProvider";
import InitUser from "../lib/store/InitUser"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GroupFinder",
  description: "Finds Groups For Your Projects!",
  icons: {
    icon: '/icon.png'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <LoadingProvider>
            <GlobalSubscriptionProvider>
              <TopLoadingBar />
              <InitUser />
              {children}
            </GlobalSubscriptionProvider>
          </LoadingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
