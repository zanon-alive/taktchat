import { QueryTypes, Transaction } from "sequelize";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import sequelize from "../../database";
import { getIO } from "../../libs/socket";

interface ProcessDuplicateParams {
  companyId: number;
  canonicalNumber: string;
  masterId: number;
  targetIds?: number[];
  mode?: "selected" | "all";
  operation?: "merge" | "delete";
}

interface ProcessDuplicateResult {
  master: Contact;
  mergedIds: number[];
  operation: "merge" | "delete";
  canonicalNumber: string;
}

const referencingTables: Array<{ table: string; column: string }> = [
  { table: "Tickets", column: "contactId" },
  { table: "Messages", column: "contactId" },
  { table: "ContactTags", column: "contactId" },
  { table: "ContactCustomFields", column: "contactId" },
  { table: "ContactWallets", column: "contactId" },
  { table: "ContactWhatsappLabels", column: "contactId" },
  { table: "CampaignShipping", column: "contactId" },
  { table: "Schedules", column: "contactId" },
  { table: "TicketNotes", column: "contactId" },
  { table: "LogTickets", column: "contactId" }
];

const mergeStringFields = [
  "email",
  "representativeCode",
  "city",
  "region",
  "instagram",
  "fantasyName",
  "creditLimit",
  "segment",
  "contactName",
  "bzEmpresa",
  "cpfCnpj"
];

const mergeDirectFields = ["foundationDate", "dtUltCompra", "vlUltCompra", "situation"] as const;

const shouldReplaceName = (currentName: string | null | undefined, fallbackNumber: string): boolean => {
  const normalized = (currentName || "").trim();
  if (!normalized) return true;

  const digitsOnly = normalized.replace(/\D/g, "");
  return digitsOnly === fallbackNumber;
};

const collectUpdatesFromDuplicate = (master: Contact, duplicate: Contact, canonicalNumber: string) => {
  const updates: Record<string, unknown> = {};

  mergeStringFields.forEach(field => {
    const incoming = (duplicate as any)[field];
    if (incoming === undefined || incoming === null) return;

    const normalizedIncoming = typeof incoming === "string" ? incoming.trim() : incoming;
    if (normalizedIncoming === "" || normalizedIncoming === null) return;

    const current = (master as any)[field];
    if (!current || (typeof current === "string" && current.trim() === "")) {
      updates[field] = incoming;
    }
  });

  mergeDirectFields.forEach(field => {
    const incoming = (duplicate as any)[field];
    if (incoming === undefined || incoming === null) return;
    const current = (master as any)[field];
    if (current === undefined || current === null) {
      updates[field] = incoming;
    }
  });

  const duplicateName = duplicate.name;
  if (duplicateName && shouldReplaceName(master.name, canonicalNumber)) {
    updates.name = duplicateName;
  }

  return updates;
};

const updateReferences = async (
  masterId: number,
  duplicateId: number,
  transaction: Transaction
): Promise<void> => {
  for (const ref of referencingTables) {
    await sequelize.query(
      `UPDATE "${ref.table}" SET "${ref.column}" = :masterId WHERE "${ref.column}" = :duplicateId`,
      {
        replacements: { masterId, duplicateId },
        transaction,
        type: QueryTypes.UPDATE
      }
    );
  }
};

const dedupeContactTags = async (transaction: Transaction): Promise<void> => {
  await sequelize.query(
    `
    DELETE FROM "ContactTags" a
    USING "ContactTags" b
    WHERE a."id" > b."id"
      AND a."contactId" = b."contactId"
      AND a."tagId" = b."tagId";
    `,
    { transaction, type: QueryTypes.DELETE }
  );
};

const ProcessDuplicateContactsService = async ({
  companyId,
  canonicalNumber,
  masterId,
  targetIds = [],
  mode = "selected",
  operation = "merge"
}: ProcessDuplicateParams): Promise<ProcessDuplicateResult> => {
  if (!canonicalNumber) {
    throw new AppError("ERR_INVALID_CANONICAL_NUMBER");
  }

  const contacts = await Contact.findAll({
    where: {
      companyId,
      canonicalNumber
    }
  });

  if (!contacts.length) {
    throw new AppError("ERR_DUPLICATE_GROUP_NOT_FOUND", 404);
  }

  const master = contacts.find(contact => contact.id === masterId);
  if (!master) {
    throw new AppError("ERR_MASTER_CONTACT_NOT_FOUND", 404);
  }

  let duplicates: Contact[];
  if (mode === "all") {
    duplicates = contacts.filter(contact => contact.id !== masterId);
  } else {
    if (!targetIds.length) {
      throw new AppError("ERR_DUPLICATE_TARGETS_REQUIRED");
    }

    const uniqueTargets = Array.from(new Set(targetIds.filter(id => id !== masterId)));
    duplicates = contacts.filter(contact => uniqueTargets.includes(contact.id));

    if (!duplicates.length) {
      throw new AppError("ERR_NO_VALID_DUPLICATES_SELECTED");
    }
  }

  const duplicateIds = duplicates.map(contact => contact.id);

  let updatedMaster: Contact;

  await sequelize.transaction(async transaction => {
    const aggregatedUpdates: Record<string, unknown> = {};

    if (operation === "merge") {
      duplicates.forEach(duplicate => {
        const updates = collectUpdatesFromDuplicate(master, duplicate, canonicalNumber);
        Object.assign(aggregatedUpdates, updates);
      });
    }

    if (master.number !== canonicalNumber) {
      aggregatedUpdates.number = canonicalNumber;
    }

    if (master.canonicalNumber !== canonicalNumber) {
      aggregatedUpdates.canonicalNumber = canonicalNumber;
    }

    if (Object.keys(aggregatedUpdates).length > 0) {
      await master.update(aggregatedUpdates, { transaction });
    }

    for (const duplicate of duplicates) {
      await updateReferences(master.id, duplicate.id, transaction);

      await sequelize.query(
        'DELETE FROM "ContactCustomFields" WHERE "contactId" = :duplicateId',
        {
          replacements: { duplicateId: duplicate.id },
          transaction,
          type: QueryTypes.DELETE
        }
      );

      await duplicate.destroy({ transaction, force: true });
    }

    await dedupeContactTags(transaction);

    await master.reload({ transaction });
    updatedMaster = master;
  });

  const io = getIO();

  if (updatedMaster) {
    io.of(`/workspace-${companyId}`)
      .emit(`company-${companyId}-contact`, {
        action: "update",
        contact: updatedMaster
      });
  }

  duplicateIds.forEach(id => {
    io.of(`/workspace-${companyId}`)
      .emit(`company-${companyId}-contact`, {
        action: "delete",
        contactId: id
      });
  });

  return {
    master: updatedMaster,
    mergedIds: duplicateIds,
    operation,
    canonicalNumber
  };
};

export default ProcessDuplicateContactsService;
