import { NextMiddlewareResult } from "next/dist/server/web/types";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

export type MiddlewareFactory = (
  middleware: CustomMiddleware
) => CustomMiddleware;

export function chain(
  functions: MiddlewareFactory[],
  index = 0
): CustomMiddleware {
  const current = functions[index];

  if (current) {
    const next = chain(functions, index + 1);
    return current(next);
  }

  return (_request: NextRequest, _event: NextFetchEvent) => {
    return NextResponse.next();
  };
}
