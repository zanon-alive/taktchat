import { Op, QueryTypes } from "sequelize";
import Contact from "../../models/Contact";
import sequelize from "../../database";

interface DuplicateRow {
  canonicalNumber: string;
  total: number;
}

interface TotalRow {
  total: string | number;
}

interface ListDuplicatesParams {
  companyId: number;
  limit?: number;
  offset?: number;
  canonicalNumber?: string;
}

const ListDuplicateContactsService = async ({
  companyId,
  limit = 20,
  offset = 0,
  canonicalNumber
}: ListDuplicatesParams) => {
  const replacements: Record<string, unknown> = {
    companyId
  };

  let whereSql = '"companyId" = :companyId AND "canonicalNumber" IS NOT NULL';

  if (canonicalNumber) {
    whereSql += ' AND "canonicalNumber" = :canonicalNumber';
    replacements.canonicalNumber = canonicalNumber;
  }

  const baseSql = `
    FROM "Contacts"
    WHERE ${whereSql}
    GROUP BY "canonicalNumber"
    HAVING COUNT(*) > 1
  `;

  const dataSql = `
    SELECT "canonicalNumber", COUNT(*) AS total
    ${baseSql}
    ORDER BY total DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const duplicates = await sequelize.query<DuplicateRow>(dataSql, {
    replacements,
    type: QueryTypes.SELECT
  }) as unknown as DuplicateRow[];

  const canonicalNumbers = duplicates.map((d: DuplicateRow) => d.canonicalNumber);

  if (!canonicalNumbers.length) {
    return {
      groups: [],
      total: 0
    };
  }

  const contacts = await Contact.findAll({
    where: {
      companyId,
      canonicalNumber: { [Op.in]: canonicalNumbers }
    },
    order: [["canonicalNumber", "ASC"], ["updatedAt", "DESC"]]
  });

  const mapped = canonicalNumbers.map(cn => ({
    canonicalNumber: cn,
    total: duplicates.find((d: DuplicateRow) => d.canonicalNumber === cn)?.total || contacts.filter(c => c.canonicalNumber === cn).length,
    contacts: contacts.filter(c => c.canonicalNumber === cn)
  }));

  const totalSql = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT "canonicalNumber"
      ${baseSql}
    ) duplicates
  `;

  const totalResult = await sequelize.query<TotalRow>(totalSql, {
    replacements,
    type: QueryTypes.SELECT
  }) as unknown as TotalRow[];

  const totalGroups = Number(totalResult[0]?.total ?? 0);

  return {
    groups: mapped,
    total: totalGroups
  };
};

export default ListDuplicateContactsService;
