import { parse } from "cookie";
import { NextApiRequest } from "next";
import { isValidSignedPreviewCookie } from "src/lib/auth";
import { COOKIE_NAME } from "src/middleware";

export interface ServerContext {
  isAuthed: boolean;
}

export async function context(req: NextApiRequest): Promise<ServerContext> {
  const cookies = parse(req.headers.cookie ?? "");
  const cookie = cookies[COOKIE_NAME];
  const isAuthed = isValidSignedPreviewCookie(cookie);
  return { isAuthed };
}
