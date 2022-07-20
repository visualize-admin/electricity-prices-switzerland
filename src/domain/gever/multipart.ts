/**
 * Split a buffer containing a multipart
 */
export const splitMultipart = (buf: Buffer) => {
  const firstBreak = buf.indexOf("\r\n", buf.indexOf("\r\n"));
  const secondBreak = buf.indexOf("\r\n", firstBreak + 1);
  const boundary = buf.slice(firstBreak + 2, secondBreak);
  const parts = [...splitBuffer(buf, boundary)];
  return parts;
};

const splitOnce = (str: string, token: string) => {
  const index = str.indexOf(token);
  if (index === -1) {
    return str;
  } else {
    return [str.slice(0, index), str.slice(index + token.length)];
  }
};

export const parsePart = (buf: Buffer) => {
  const [headersRaw, content] = [...splitBuffer(buf, "\r\n\r\n")];
  const headers = Object.fromEntries(
    headersRaw
      .toString()
      .split("\n")
      .slice(1)
      .filter((x) => x.length > 0)
      .map((h) => {
        const [k, v] = splitOnce(h, ": ");
        return [k, v.trim()];
      })
  );
  return {
    headers,
    content: content ? content.slice(0, -2) : content,
  };
};

/**
 * Splits a buffer in several buffers, for a specific token
 */
export const splitBuffer = function* (buf: Buffer, token: string | Uint8Array) {
  let cursor = 0;
  while (cursor !== -1) {
    const next = buf.indexOf(token, cursor + 1);
    if (next === -1) {
      if (cursor <= buf.length) {
        yield buf.slice(cursor);
      }
      break;
    } else {
      yield buf.slice(cursor, next);
      cursor = next + token.length;
    }
  }
};

export const parseMultiPart = (buf: Buffer) => {
  return splitMultipart(buf)
    .map(parsePart)
    .filter((p) => p.content);
};
