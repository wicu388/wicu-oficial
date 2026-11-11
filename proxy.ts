import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: authData } = await supabase.auth.getClaims();
  const esAdmin = authData?.claims?.sub === process.env.WICU_ADMIN_USER_ID;
  const esLogin = request.nextUrl.pathname === "/admin/login";

  if (esLogin && esAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!esLogin && !esAdmin) {
    const destino = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );

    response.cookies.getAll().forEach((cookie) => {
      destino.cookies.set(cookie);
    });

    return destino;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
