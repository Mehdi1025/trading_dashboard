import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PRIVATE_ROUTES = ["/dashboard", "/admin"] as const;

function isPrivateRoute(pathname: string) {
  return PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function copySupabaseCookies(
  source: NextResponse,
  target: NextResponse,
) {
  source.cookies.getAll().forEach(({ name, value }) => {
    target.cookies.set(name, value);
  });
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;
  const requiresAuth = isPrivateRoute(pathname);
  const requiresRoleCheck = isAdminRoute(pathname);

  // Refresh session only when needed: protected routes, admin RBAC, or
  // existing Supabase auth cookies (keeps logged-in users in sync).
  const hasSupabaseSession = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-"));

  if (!requiresAuth && !requiresRoleCheck && !hasSupabaseSession) {
    return supabaseResponse;
  }

  // Do not insert logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (requiresAuth && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);

    const redirectResponse = NextResponse.redirect(loginUrl);
    copySupabaseCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    const { data: role } = await supabase.rpc("get_my_role");
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = role === "admin" ? "/admin" : "/dashboard";
    homeUrl.search = "";

    const redirectResponse = NextResponse.redirect(homeUrl);
    copySupabaseCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  // Role check only on /admin — avoids an extra DB round-trip elsewhere.
  if (requiresRoleCheck && user) {
    const { data: role } = await supabase.rpc("get_my_role");

    if (role === "investor") {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";

      const redirectResponse = NextResponse.redirect(dashboardUrl);
      copySupabaseCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
