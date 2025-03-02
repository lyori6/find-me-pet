'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import QuickSearchButton from '@/components/ui/quick-search-button';
import { Button } from '@/components/ui/button';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-primary">FindMe.pet</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/questionnaire" 
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Find a Pet
            </Link>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h3>
            <QuickSearchButton className="w-full" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
