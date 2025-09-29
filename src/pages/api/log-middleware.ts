import fs from "fs/promises";

import { NextApiMiddleware } from "src/pages/api/run-middleware";

class ActionQueue {
  private running: boolean = false;
  private queue: (() => void | (() => Promise<void>))[] = [];

  add(action: () => void) {
    this.queue.push(action);
    this.run();
  }

  async run() {
    if (this.running) {
      console.warn("ActionQueue is already running, skipping execution.");
      return;
    }
    this.running = true;
    while (this.queue.length > 0) {
      const action = this.queue.shift();
      if (action) {
        await action();
      }
    }
    this.running = false;
  }
}

export const createLogMiddleware = ({
  logQuery = true,
  logVariables = false,
  filepath,
}: {
  logQuery?: boolean;
  logVariables?: boolean;
  filepath: string;
}) => {
  const queue = new ActionQueue();
  const middleware: NextApiMiddleware = (req, _res, next) => {
    // log graphql query
    if (req.method === "POST") {
      const body = req.body as {
        query?: string;
        variables?: Record<string, $IntentionalAny>;
      };

      let log = ``;
      if (body.query) {
        if (logQuery) {
          log = `"GraphQL Query: ${body.query}"\n`;
        }
        if (body.variables && logVariables) {
          log += `GraphQL Variables: ${JSON.stringify(
            body.variables,
            null,
            2
          )} \n`;
        }
      }
      queue.add(async () => {
        try {
          await fs.appendFile(filepath, log);
        } catch (error) {
          console.error("Failed to write to /tmp/graphql.log:", error);
        }
      });
    }
    next();
  };
  return middleware;
};
