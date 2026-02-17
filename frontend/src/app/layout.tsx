import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "@/components/providers/SessionProvider";
import { auth } from "@/auth";
import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// Lazy load non-critical components for better performance
const CommandMenu = dynamic(() => import("@/components/layout/CommandMenu").then(mod => ({ default: mod.CommandMenu })));

const FloatingTicketButton = dynamic(() => import("@/components/FloatingTicketButton"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Prevent font blocking
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Prevent font blocking
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: "%s | Rudratic HR",
    default: "Rudratic Technologies HR Management System"
  },
  description: "Enterprise-grade HR Platform by Rudratic Technologies",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  // Root Layout wrapping everything
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >

          <ClientSessionProvider session={session}>
            <CommandMenu />
            {children}
            <Toaster />
            <SonnerToaster richColors position="top-right" />
            <FloatingTicketButton />
          </ClientSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
