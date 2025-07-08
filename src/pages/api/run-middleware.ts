import { NextApiRequest, NextApiResponse } from "next";

export type NextApiMiddleware = (
  req: $IntentionalAny,
  res: $IntentionalAny,
  next: (err?: $IntentionalAny) => $IntentionalAny
) => void;

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// See https://nextjs.org/docs/api-routes/api-middlewares#connectexpress-middleware-support
export const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: NextApiMiddleware
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};
