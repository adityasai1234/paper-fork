import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isLoginPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher(["/audits(.*)", "/research(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthed = await convexAuth.isAuthenticated();

  if (isLoginPage(request) && isAuthed) {
    return nextjsMiddlewareRedirect(request, "/research");
  }
  if (isProtectedRoute(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
