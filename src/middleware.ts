import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';
import { hasPermission } from '@/lib/rbac';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isProtectedApi = 
    pathname.startsWith('/api/orders') || 
    pathname.startsWith('/api/products') || 
    pathname.startsWith('/api/support');
  
  // Public GET requests for products and orders are allowed
  if (isProtectedApi && req.method === 'GET' && !pathname.includes('/admin')) {
    // wait, /api/orders GET is protected for admin, but we already handled it in the route file.
    // Let's let the route files handle GET if they want to, except for admin routes.
    // Actually, it's safer to enforce here if we want to be perfect.
  }

  if (!isAdminPage && !isAdminApi && !isProtectedApi && !isAuthPage) {
    return NextResponse.next();
  }

  // Allow public GET for products (and support POST for new tickets)
  if (pathname.startsWith('/api/products') && req.method === 'GET') {
    return NextResponse.next();
  }
  if (pathname.startsWith('/api/support') && req.method === 'POST') {
    return NextResponse.next(); // Public can create tickets
  }
  // Public can create orders
  if (pathname.startsWith('/api/orders') && req.method === 'POST') {
    return NextResponse.next();
  }

  const sessionToken = req.cookies.get('session')?.value;
  if (!sessionToken) {
    if (isAdminPage) return NextResponse.redirect(new URL('/login', req.url));
    if (isAdminApi || isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.next(); // Allow access to /login if no token
  }

  // Verify token
  const payload = await verifySession(sessionToken);
  if (!payload || !payload.role) {
    if (isAdminPage) return NextResponse.redirect(new URL('/login', req.url));
    if (isAdminApi || isProtectedApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.next(); // Allow access to /login if token invalid
  }

  const role = payload.role as string;

  // If authenticated user tries to access login/signup, redirect based on role
  if (isAuthPage) {
    if (role === 'admin' || role === 'manager') {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else if (role === 'support') {
      return NextResponse.redirect(new URL('/admin/support', req.url));
    } else if (role === 'delivery') {
      return NextResponse.redirect(new URL('/admin/delivery', req.url));
    } else {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Protect Admin UI Pages
  if (isAdminPage) {
    if (role === 'user') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Check page access permission
    if (!hasPermission(role, 'access_page', pathname)) {
      if (role === 'delivery') {
        return NextResponse.redirect(new URL('/admin/delivery', req.url));
      } else if (role === 'support') {
        return NextResponse.redirect(new URL('/admin/support', req.url));
      } else {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
  }

  // Protect Admin API Routes and Protected Data APIs
  if (isAdminApi || isProtectedApi) {
     if (role === 'user') {
       // Users might be allowed to GET their own orders, but /api/orders GET currently returns all orders.
       // So for now, block users from these protected admin actions entirely.
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     // General blanket enforcement for DELETE
     if (req.method === 'DELETE' && !hasPermission(role, 'delete')) {
       return NextResponse.json({ error: 'Forbidden. You lack delete permissions.' }, { status: 403 });
     }
     
     // Blanket enforcement for POST/PUT/PATCH (Create/Edit)
     if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!hasPermission(role, 'edit') && !hasPermission(role, 'create')) {
           return NextResponse.json({ error: 'Forbidden. You lack edit/create permissions.' }, { status: 403 });
        }
        if (pathname === '/api/admin/invite' && !hasPermission(role, 'invite_role')) {
             return NextResponse.json({ error: 'Forbidden. Cannot invite team members.' }, { status: 403 });
        }
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/admin/:path*',
    '/api/orders/:path*',
    '/api/products/:path*',
    '/api/support/:path*',
    '/login',
    '/signup'
  ],
};
