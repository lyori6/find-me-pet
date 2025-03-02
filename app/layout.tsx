import type React from "react"
import "@/styles/globals.css"
import localFont from "next/font/local"
import Link from "next/link"
import { Providers } from './providers';
import GoogleTagManager from "@/components/GoogleTagManager";
import GTMNoScript from "@/components/GTMNoScript";
import { Suspense } from "react";
import Footer from "./components/Footer";
import MobileMenu from "./components/MobileMenu";
import QuickSearchButton from '@/components/ui/quick-search-button';

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
    <html lang="en" suppressHydrationWarning className={sfPro.variable}>
      <body className="font-sans min-h-screen flex flex-col">
        <GTMNoScript />
        {/* Ensure GTM is loaded early but won't block other components */}
        <Suspense fallback={null}>
          <GoogleTagManager />
        </Suspense>
        <Providers>
          <header className="bg-background shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-2xl md:text-3xl font-bold text-primary flex items-center">
                <img src="/logo.svg" alt="FindMe.pet Logo" className="h-7 w-auto mr-2" />
                FindMe.pet
              </Link>
              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/" className="text-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/questionnaire" className="text-foreground hover:text-primary transition-colors">
                  Find a Pet
                </Link>
                <div className="ml-2">
                  <QuickSearchButton className="py-2 px-4 text-sm" />
                </div>
              </div>
              {/* Mobile Menu - Visible only on mobile */}
              <div className="md:hidden">
                <MobileMenu />
              </div>
            </nav>
          </header>
          <main className="container mx-auto px-4 flex-grow mb-20">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata = {
  title: 'FindMe.pet - Find Your Perfect Pet Companion',
  description: 'Connect with adoptable pets in your area. FindMe.pet helps you discover and adopt dogs, cats, and other animals looking for their forever homes.',
  generator: 'v0.dev',
  keywords: 'pet adoption, find pets, adopt dogs, adopt cats, pet finder, animal adoption, rescue pets',
  authors: [{ name: 'FindMe.pet Team' }],
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
    other: {
      rel: 'apple-touch-icon',
      url: '/logo.svg',
    },
  },
  manifest: '/manifest.json',
  themeColor: '#ef4444',
  // Open Graph meta tags for better social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://findme.pet',
    siteName: 'FindMe.pet',
    title: 'FindMe.pet - Find Your Perfect Pet Companion',
    description: 'Connect with adoptable pets in your area. FindMe.pet helps you discover and adopt dogs, cats, and other animals looking for their forever homes.',
    images: [
      {
        url: '/1_shatsa.jpeg',
        width: 1200,
        height: 630,
        alt: 'Shasta - An adorable pet available for adoption on FindMe.pet',
      }
    ],
  },
  // Twitter Card meta tags
  twitter: {
    card: 'summary_large_image',
    title: 'FindMe.pet - Find Your Perfect Pet Companion',
    description: 'Connect with adoptable pets in your area. FindMe.pet helps you discover and adopt dogs, cats, and other animals looking for their forever homes.',
    images: ['/1_shatsa.jpeg'],
    creator: '@findmepet',
  },
  // Robots meta tag
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Verification for search engines
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code if available
  },
};
