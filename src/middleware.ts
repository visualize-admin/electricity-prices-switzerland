import { NextRequest } from "next/server";
import { nextBasicAuthMiddleware } from "nextjs-basic-auth-middleware";

const auth = (req: NextRequest) =>
  nextBasicAuthMiddleware(
    {
      users: [
        {
          name: process.env.PREVIEW_USER!,
          password: process.env.PREVIEW_PASSWORD!,
        },
      ],
    },
    req
  );

export function middleware(request: NextRequest) {
  if (
    process.env.VERCEL_ENV === "preview" &&
    request.nextUrl.pathname !== "/api/health"
  ) {
    return auth(request);
  }
}
