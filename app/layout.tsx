import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import { LoadingProvider } from "./components/LoadingContext";
import TopLoadingBar from "./components/TopLoadingBar";
import QueryProvider from "./queryProvider";

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
            <TopLoadingBar />
            {children}
          </LoadingProvider>
        </QueryProvider>
        
      </body>
    </html>
  );
}
