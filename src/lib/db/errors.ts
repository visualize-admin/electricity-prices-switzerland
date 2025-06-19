export class PeerGroupNotFoundError extends Error {
  constructor(operatorId: string | number) {
    const message = `Peer group not found for operator ID: ${operatorId}`;
    super(message);
    this.name = "PeerGroupNotFoundError";
  }
}
