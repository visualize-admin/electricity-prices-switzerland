const { exec, execSync } = require("child_process");

const getGitCommitSHA = () => {
  const res = execSync("git rev-parse HEAD").toString();
  console.log(res);
  return res;
};

module.exports = {
  getGitCommitSHA,
};
