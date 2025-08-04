// Unprotected routes
export const UNPROTECTED_ROUTES = [
  // API routes
  "/api/auth/login",
  "/api/verify",
  // Client-side routes
  "/auth/login",
  // metadata routes
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
  "/_next/.*",
  "_assets/.*",
  ".*\.(png|jpg|jpeg|gif|svg|ico|webp)",
];


// The name of the cookie for authentication
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "X-Auth-Token";

// The secret for JWT
export const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// The expiry time for JWT
export const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";

// The leeway for JWT expiry
export const JWT_EXPIRY_LEEWAY = process.env.JWT_EXPIRY_LEEWAY || "1h";

// The name of the query parameter for redirect
export const REDIRECT_PARAM = "redirect";
