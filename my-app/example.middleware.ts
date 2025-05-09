import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Get the current session
  const session = await auth();
  const isAuthenticated = !!session?.user;
  
  console.log(`Middleware running for path: ${path}`);
  console.log(`Authentication status: ${isAuthenticated}`);
  
  // Handle /login route - redirect to dashboard if already logged in
  if (path === '/login') {
    if (isAuthenticated) {
      console.log('User already authenticated, redirecting from login page');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/api/protected') ||
                           path.startsWith('/profile');
  
  if (isProtectedRoute) {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // User is authenticated, debug token information
    const token = session as any;
    if (token) {
      const now = Date.now();
      const accessTokenExpires = token.accessTokenExpires || 0;
      const refreshTokenExpires = token.refreshTokenExpires || 0;
      
      console.log(`Current time: ${new Date(now).toISOString()}`);
      console.log(`Access token expires: ${new Date(accessTokenExpires).toISOString()}`);
      console.log(`Refresh token expires: ${new Date(refreshTokenExpires).toISOString()}`);
      console.log(`Access token expiring in: ${(accessTokenExpires - now) / 1000}s`);
      
      // Check if token is about to expire
      if (accessTokenExpires && now >= accessTokenExpires - 10000) { // 10 seconds before expiry
        console.log('Access token about to expire, refresh will be triggered');
      }
      
      if (token.error) {
        console.error(`Token error: ${token.error}`);
      }
    }
    
    return NextResponse.next();
  }
  
  // For public routes that are not /login, just proceed
  return NextResponse.next();
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    // Include all protected routes
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/profile/:path*',
    // Include login page to handle redirects
    '/login',
    // Add any other routes you want to protect
  ],
};