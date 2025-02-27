'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function NonUSLocationDialog({ isOpen, onClose, onFindShelters }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Location Not Supported</DialogTitle>
          <DialogDescription>
            Unfortunately, FindMePet currently only operates in the United States.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            We're working on expanding our service to more countries. In the meantime, 
            we can help you find animal shelters near your location.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            className="sm:order-first"
          >
            Close
          </Button>
          <Button 
            onClick={onFindShelters}
            className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
          >
            Find Animal Shelters Near Me
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
