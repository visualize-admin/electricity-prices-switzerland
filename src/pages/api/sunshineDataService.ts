import { NextApiRequest, NextApiResponse } from "next";

import {
  SUNSHINE_DATA_SERVICE_COOKIE_NAME,
  getValidServiceKeys,
} from "src/lib/sunshine-data-service-context";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { serviceKey } = req.query;
  const validServiceKeys = getValidServiceKeys();

  if (!serviceKey || typeof serviceKey !== "string") {
    return res.status(400).json({
      error: "serviceKey query parameter is required",
      validKeys: validServiceKeys,
    });
  }

  if (!validServiceKeys.includes(serviceKey)) {
    return res.status(400).json({
      error: `Invalid serviceKey: ${serviceKey}`,
      validKeys: validServiceKeys,
    });
  }

  // Set the cookie with appropriate options
  const cookieOptions = [
    `${SUNSHINE_DATA_SERVICE_COOKIE_NAME}=${serviceKey}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    // Cookie expires in 30 days
    `Max-Age=${30 * 24 * 60 * 60}`,
  ].join("; ");

  res.setHeader("Set-Cookie", cookieOptions);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Service Updated</title>
        <meta http-equiv="refresh" content="3;url=/map?tab=sunshine">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div>Sunshine data service set to: ${serviceKey}<br/>Redirecting to sunshine map...</div>
      </body>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
}
