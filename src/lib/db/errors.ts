export class PeerGroupNotFoundError extends Error {
  constructor(operatorId: string | number) {
    const message = `Peer group not found for operator ID: ${operatorId}`;
    super(message);
    this.name = "PeerGroupNotFoundError";
  }
}

export class UnknownPeerGroupError extends Error {
  constructor(operatorId: string | number, peerGroup: string) {
    const message = `Peer group ${peerGroup} is unknown (operator ID: ${operatorId})`;
    super(message);
    this.name = "UnknownPeerGroupError";
  }
}
