import fs from "fs";
import path from "path";

const publicRoot = () => path.resolve(__dirname, "..", "..", "public");

export const listFlowBuilderMediaRelPaths = (
  storedName: string,
  companyId: number
): string[] => {
  const raw = String(storedName || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  if (!raw) {
    return [];
  }

  const basename = path.posix.basename(raw);
  const unique: string[] = [];
  const add = (rel: string) => {
    const normalized = rel.replace(/\\/g, "/").replace(/^\/+/, "");
    if (normalized && !unique.includes(normalized)) {
      unique.push(normalized);
    }
  };

  add(raw);
  add(`flowbuilder/${basename}`);
  add(`company${companyId}/${basename}`);
  add(`company${companyId}/flowbuilder/${basename}`);
  add(basename);

  return unique;
};

export const resolveFlowBuilderMediaPath = (
  storedName: string,
  companyId: number
): string | null => {
  const root = publicRoot();
  for (const rel of listFlowBuilderMediaRelPaths(storedName, companyId)) {
    const abs = path.join(root, rel);
    if (fs.existsSync(abs)) {
      return abs;
    }
  }
  return null;
};

export const toFlowBuilderPublicUrl = (
  storedName: string,
  companyId: number,
  backendUrl = process.env.BACKEND_URL || ""
): string | null => {
  const rels = listFlowBuilderMediaRelPaths(storedName, companyId);
  if (rels.length === 0) {
    return null;
  }

  const root = publicRoot();
  const found = resolveFlowBuilderMediaPath(storedName, companyId);
  const preferredRel =
    rels.find(item => item.startsWith("flowbuilder/")) || rels[0];
  const abs = found || path.join(root, preferredRel);
  const rel = path.relative(root, abs).split(path.sep).join("/");
  const base = String(backendUrl).replace(/\/+$/, "");
  if (!base || !rel || rel.startsWith("..")) {
    return null;
  }
  return `${base}/public/${rel}`;
};
