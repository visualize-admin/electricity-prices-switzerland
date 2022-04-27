import { makeDownloadRequest } from ".";

const main = async () => {
  const resp = await makeDownloadRequest(process.argv[2]);
  console.log(resp);
};

main().catch((e) => {
  console.warn(e);
  process.exit(1);
});
