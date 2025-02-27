import type React from "react"
import "@/styles/globals.css"
import localFont from "next/font/local"
import Link from "next/link"
import { Providers } from './providers';
import GoogleTagManager from "@/components/GoogleTagManager";
import GTMNoScript from "@/components/GTMNoScript";
import { Suspense } from "react";

const sfPro = localFont({
  src: [
    {
      path: "./fonts/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sfPro.variable}>
      <body className="font-sans">
        <GTMNoScript />
        {/* Ensure GTM is loaded early but won't block other components */}
        <Suspense fallback={null}>
          <GoogleTagManager />
        </Suspense>
        <Providers>
          <header className="bg-background shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                PetMatch
              </Link>
              <div className="space-x-4">
                <Link href="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/questionnaire" className="text-foreground hover:text-primary transition-colors">
                  Find a Pet
                </Link>
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}

export const metadata = {
  generator: 'v0.dev'
};
