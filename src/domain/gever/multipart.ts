/**
 * Split a buffer containing a multipart
 */
const splitMultipart = (buf: Buffer, contentType: string) => {
  const contentTypeBoundary = /boundary="(.*?)"/.exec(contentType)?.[1];
  if (!contentTypeBoundary) {
    throw new Error("Could not recognize boundary");
  }
  const parts = [...splitBuffer(buf, `--${contentTypeBoundary}`)];
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

const parsePart = (buf: Buffer) => {
  const splitted = [...splitBuffer(buf, "\r\n\r\n", 1)];
  const [headersRaw, content] = splitted;
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
const splitBuffer = function* (
  buf: Buffer,
  token: string | Uint8Array,
  maxSplits = Infinity
) {
  let cursor = 0;
  let splits = 0;
  while (cursor !== -1) {
    const next = buf.indexOf(token, cursor + 1);
    if (next === -1 || splits === maxSplits) {
      if (cursor <= buf.length) {
        yield buf.slice(cursor);
      }
      break;
    } else {
      yield buf.slice(cursor, next);
      cursor = next + token.length;
    }
    splits++;
  }
};

export const parseMultiPart = (buf: Buffer, contentType: string) => {
  return splitMultipart(buf, contentType)
    .map(parsePart)
    .filter((p) => p.content);
};
