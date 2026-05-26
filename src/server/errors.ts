export type ServerErrorCode =
  | "GEVER_AUTH_IPSTS"
  | "GEVER_AUTH_RPSTS"
  | "GEVER_SVC";

const userMessages: Record<ServerErrorCode, string> = {
  GEVER_AUTH_IPSTS: "Cannot reach document download authentication servers",
  GEVER_AUTH_RPSTS: "Cannot reach document download authentication servers",
  GEVER_SVC: "Cannot reach document download service",
};

export class ServerError extends Error {
  public readonly userMessage: string;

  constructor(
    public readonly code: ServerErrorCode,
    public readonly cause?: unknown
  ) {
    const userMessage = userMessages[code];
    super(`[${code}] ${userMessage}`);
    this.name = "ServerError";
    this.userMessage = userMessage;
  }
}
