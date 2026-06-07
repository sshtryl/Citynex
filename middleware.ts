import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

const ADMIN_ROLE_IDS = [1, 2, 3, 4, 6, 7];

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    // Public routes — no auth needed
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next();
    }

    // reset-password needs a token param
    if (pathname === '/reset-password') {
        const token = searchParams.get('token');
        if (!token || token.trim() === '') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // Static assets — skip
    if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|woff2?)$/)) {
        return NextResponse.next();
    }

    // API routes — skip
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Read token from cookie (set by saveToken helper)
    const token = request.cookies.get('token')?.value;

    // No token → redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Decode JWT to get role
    const decoded = decodeJWT(token);
    const userRoleId = decoded?.role_id;
    const isAdmin = userRoleId && ADMIN_ROLE_IDS.includes(userRoleId); // ← fixed typo

    // /superadmin — only superadmin (role_id === 1) allowed
    if (pathname.startsWith('/superadmin')) {
        if (userRoleId !== 1) {
            return NextResponse.redirect(new URL('/home', request.url));
        }
        return NextResponse.next();
    }

    // /admin/* — only admins allowed
    if (pathname.startsWith('/admin')) {
        if (!isAdmin) {
            return NextResponse.redirect(new URL('/home', request.url));
        }
        
        // Ensure admins can only access their own dashboard unless they are superadmin
        const matches = pathname.match(/^\/admin\/(\d+)$/);
        if (matches) {
            const pathId = parseInt(matches[1], 10);
            if (userRoleId !== 1 && userRoleId !== pathId) {
                return NextResponse.redirect(new URL(`/admin/${userRoleId}`, request.url));
            }
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|uploads).*)',
    ],
};