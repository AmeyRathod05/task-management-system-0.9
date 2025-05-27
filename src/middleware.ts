import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path starts with /admin
  if (pathname.startsWith('/admin')) {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // If there's no token, redirect to the login page
    if (!token) {
      // Store the original URL to redirect back after login
      const url = new URL('/login', request.url);
      // Add the original path as a query parameter to redirect after login
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }
    
    // TODO: Optionally validate the token here if needed
    // This could involve checking token expiration or signature
  }
  
  // Continue with the request if authenticated or not an admin route
  return NextResponse.next();
}

// Configure the paths that should be checked by the middleware
export const config = {
  matcher: [
    '/admin/:path*'
  ],
};
