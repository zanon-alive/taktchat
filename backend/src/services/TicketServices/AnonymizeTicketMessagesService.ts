import fs from "fs";
import path from "path";
import Message from "../../models/Message";
import logger from "../../utils/logger";
import { LGPD_REDACTED_BODY } from "../../helpers/ticketDeletion";

const publicRoot = () => path.resolve(__dirname, "..", "..", "..", "public");

export const isSafeCompanyMediaPath = (
  companyId: number,
  fileRel: string
): { ok: boolean; absPath?: string } => {
  if (!fileRel || fileRel.includes("\0")) {
    return { ok: false };
  }
  const companyDir = path.resolve(publicRoot(), `company${companyId}`);
  const absPath = path.resolve(companyDir, fileRel);
  const prefix = companyDir.endsWith(path.sep) ? companyDir : `${companyDir}${path.sep}`;
  if (absPath !== companyDir && !absPath.startsWith(prefix)) {
    return { ok: false };
  }
  return { ok: true, absPath };
};

const unlinkIfSafe = async (companyId: number, fileRel: string): Promise<void> => {
  const { ok, absPath } = isSafeCompanyMediaPath(companyId, fileRel);
  if (!ok || !absPath) return;
  try {
    await fs.promises.unlink(absPath);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      logger.error({ err, absPath }, "Falha ao apagar mídia LGPD");
    }
  }
};

const AnonymizeTicketMessagesService = async (
  ticketId: number | string,
  companyId: number
): Promise<void> => {
  const messages = await Message.findAll({
    where: { ticketId, companyId }
  });

  for (const message of messages) {
    const fileRel = message.getDataValue("mediaUrl") as string | null;
    if (fileRel) {
      await unlinkIfSafe(companyId, fileRel);
    }
    await Message.update(
      { body: LGPD_REDACTED_BODY, mediaUrl: null },
      { where: { id: message.id, companyId } }
    );
  }
};

export default AnonymizeTicketMessagesService;
