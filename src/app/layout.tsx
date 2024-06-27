"use client";

import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Script from "next/script";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Header />
            {/* (57 & 73) Header Height || (24) Footer Height */}
            <main className="h-[calc(100vh-57px-24px)] md:h-[calc(100vh-73px-24px)]">
                {children}
            </main>
            <Footer />
            <Toaster
              closeButton
              duration={3500}
              position="top-right"
              richColors
            />
          </TooltipProvider>
        </QueryClientProvider>
      </body>

      <Script
        async
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script id="gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
      </Script>
    </html>
  );
}
