import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Si mustChangePassword est true, forcer la redirection vers la page dédiée
    // Sauf si on y est déjà
    if (token?.mustChangePassword && path !== "/force-password-change") {
      return NextResponse.redirect(new URL("/force-password-change", req.url));
    }
    
    // Si on est à la racine, rediriger selon le rôle
    if (path === "/") {
      if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
      }
    }

    // Protection des routes /admin
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/member/dashboard", req.url));
      }
    }
    
    // Protection des routes /member pour les non-connectés (déjà géré par withAuth, 
    // mais on s'assure qu'un Admin n'y aille pas forcément, bien qu'un admin puisse techniquement avoir un profil membre)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/", "/member/:path*", "/admin/:path*", "/force-password-change"],
};
