import { ArgumentParser } from "argparse";

const accessToken = process.env.VERCEL_TOKEN;

type Deployment = {
  state: string;
  url: string;
  meta: {
    githubCommitSha: string;
  };
};

async function fetchDeploymentForCommit(
  commitSha: string,
  teamId: string,
  projectId: string
) {
  try {
    const response = await fetch(
      `https://vercel.com/api/v6/deployments?limit=20&projectId=${projectId}&state=READY,ERROR,BUILDING,QUEUED&teamId=${teamId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then((x) => x.json());

    const deployments = (
      response as { deployments: Deployment[] }
    ).deployments.filter(
      (deployment) => deployment.meta.githubCommitSha === commitSha
    );

    return deployments;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

async function waitForDeploymentReady({
  team,
  project,
  commitSha,
  interval,
  timeout,
}: {
  team: string;
  project: string;
  commitSha: string;
  interval: number;
  timeout: number;
}) {
  const start = Date.now();
  const end = start + timeout;
  while (Date.now() < end) {
    const deployments = await fetchDeploymentForCommit(
      commitSha,
      team,
      project
    );

    if (deployments.length === 0 || deployments[0].state !== "READY") {
      const state = deployments[0]?.state || "NOT YET DEPLOYED";
      if (state === "ERROR") {
        throw new Error("Deployment errored");
      }
      console.log(
        `Deployment not yet ready (state: ${state}), waiting ${interval}ms for deployment with commit ${commitSha}`
      );
      await sleep(Math.min(end - Date.now(), interval));
    } else {
      console.log(`Deployment for commit ${commitSha} is READY`);
      return deployments[0];
    }
  }

  if (Date.now() > end) {
    throw new Error("Timeout for waitForDeploymentReady");
  }
}

async function main() {
  const parser = new ArgumentParser();
  parser.add_argument("commit", {
    help: "Commit that started the deployment",
  });
  parser.add_argument("--interval", {
    default: 5000,
    type: Number,
  });
  parser.add_argument("--project", {
    required: true,
  });
  parser.add_argument("--team", {
    required: true,
  });
  parser.add_argument("--timeout", {
    default: 10 * 60 * 1000,
    type: Number,
  });
  const args = parser.parse_args();

  const deployment = await waitForDeploymentReady({
    commitSha: args.commit,
    interval: args.interval,
    timeout: args.timeout,
    team: args.team,
    project: args.project,
  });
  if (!deployment) {
    throw new Error("Could not retrieve deployment");
  }
  console.log(`DEPLOYMENT_URL=https://${deployment.url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
