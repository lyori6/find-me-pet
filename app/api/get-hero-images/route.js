import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API route to get hero images from the /public/pics directory
 * 
 * @returns {Promise<NextResponse>} JSON response with array of image filenames
 */
export async function GET() {
  try {
    // Get the absolute path to the public/pics directory
    const picsDirectory = path.join(process.cwd(), 'public', 'pics');
    
    // Read the directory contents
    const files = fs.readdirSync(picsDirectory);
    
    // Filter for image files and sort by the number prefix
    const imageFiles = files
      .filter(file => {
        // Check if file is an image (jpg, jpeg, png, etc.)
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .filter(file => {
        // Check if filename matches our pattern: [number]_[name].[ext]
        return /^\d+_[^.]+\.\w+$/.test(file);
      })
      .sort((a, b) => {
        // Sort by the number prefix
        const numA = parseInt(a.split('_')[0], 10);
        const numB = parseInt(b.split('_')[0], 10);
        return numA - numB;
      });
    
    // Return the list of image filenames
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error('Error reading hero images directory:', error);
    return NextResponse.json(
      { error: 'Failed to read images directory' },
      { status: 500 }
    );
  }
}
