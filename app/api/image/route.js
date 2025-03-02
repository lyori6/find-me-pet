import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API route to serve images from the /app/public/pics directory
 * 
 * @param {NextRequest} request - The incoming request
 * @returns {Promise<NextResponse>} The image response
 */
export async function GET(request) {
  try {
    // Extract the image path from the URL
    const url = new URL(request.url);
    const imagePath = url.pathname.replace('/api/image', '');
    
    // Construct the full path to the image
    let fullPath;
    if (imagePath.startsWith('/placeholder-pet')) {
      fullPath = path.join(process.cwd(), 'app', 'public', 'placeholder-pet.jpg');
    } else {
      fullPath = path.join(process.cwd(), 'app', 'public', 'pics', imagePath);
    }
    
    // Check if the file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`Image not found: ${fullPath}`);
      return new NextResponse(null, { status: 404 });
    }
    
    // Read the file
    const imageBuffer = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = 'image/jpeg'; // Default
    
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse(null, { status: 500 });
  }
}
