import { makeDownloadRequest } from ".";

const main = async () => {
  if (!process.argv[2]) {
    throw new Error("Usage: node cli.js <docid>");
  }
  const resp = await makeDownloadRequest(process.argv[2]);
  console.log(resp);
};

main().catch((e) => {
  console.warn(e);
  process.exit(1);
});
