export type ServerContext = Record<string, never>;

export const context = async (): Promise<ServerContext> => {
  return {};
};
