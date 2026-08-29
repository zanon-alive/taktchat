export const shortGitSha = (value, length = 7) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (raw === "N/A" || raw === "dev") {
    return raw;
  }
  return raw.slice(0, length);
};

export const parseGithubPrNumber = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const match = raw.match(/(\d+)/);
  return match ? match[1] : "";
};

export const formatBuildLabel = (sha, pr) => {
  const short = shortGitSha(sha);
  const prNum = parseGithubPrNumber(pr);
  if (prNum && short && short !== "dev" && short !== "N/A") {
    return `#${prNum} · ${short}`;
  }
  return short;
};

export const frontendBuildSha = () =>
  shortGitSha(process.env.REACT_APP_FRONTEND_VERSION || "dev");

export const frontendBuildPr = () =>
  parseGithubPrNumber(process.env.REACT_APP_GITHUB_PR || "");

export const frontendBuildLabel = () =>
  formatBuildLabel(process.env.REACT_APP_FRONTEND_VERSION || "dev", frontendBuildPr());
