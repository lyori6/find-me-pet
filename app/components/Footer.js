import Link from 'next/link';
import { Home, Heart, Search } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-12 bg-primary/40">
      <div className="container mx-auto px-6 pb-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10">
          {/* Logo and tagline */}
          <div className="mb-8 md:mb-0 max-w-xs pt-4">
            <div className="text-primary font-bold text-2xl mb-3 flex items-center">
              <Image src="/logo.svg" alt="FindMe.pet Logo" width={24} height={24} className="mr-2" />
              FindMe.pet
            </div>
            <p className="text-sm text-slate-500">
              Connecting loving homes with pets in need.
            </p>
          </div>
          
          {/* Navigation links */}
          <div className="pt-1">
            <ul className="space-y-3">
              <li className="flex items-center">
                <Home className="w-4 h-4 text-primary mr-2" />
                <Link href="/" className="text-sm text-slate-600 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <Heart className="w-4 h-4 text-primary mr-2" />
                <Link href="/questionnaire" className="text-sm text-slate-600 hover:text-primary transition-colors">
                  Find a Pet
                </Link>
              </li>
              <li className="flex items-center">
                <Search className="w-4 h-4 text-primary mr-2" />
                <Link href="/search" className="text-sm text-slate-600 hover:text-primary transition-colors">
                  Quick Search
                </Link>
              </li>
            </ul>
            {/* Added small space below Quick Search - reduced by 20% */}
            <div className="h-6"></div>
          </div>
        </div>
        
        {/* Footer bottom / copyright - reduced spacing */}
        <div className="border-t border-slate-200 pt-8 mb-4">
          <div className="flex justify-between items-center py-2">
            <p className="text-sm text-slate-500">
              &copy; {currentYear} FindMe.pet. All rights reserved. Made with ❤️ by <a 
                href="https://www.linkedin.com/in/lyor/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Lyor
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
