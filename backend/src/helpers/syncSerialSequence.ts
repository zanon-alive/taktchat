import { QueryTypes, Transaction } from "sequelize";
import sequelize from "../database";

const ALLOWED_TABLES = [
  "Companies",
  "Users",
  "CompaniesSettings",
  "Plans",
  "Queues",
  "Licenses"
] as const;

export type SerialTable = (typeof ALLOWED_TABLES)[number];

const isAllowedTable = (table: string): table is SerialTable => {
  return (ALLOWED_TABLES as readonly string[]).includes(table);
};

export const syncSerialSequence = async (
  table: SerialTable,
  transaction?: Transaction
): Promise<void> => {
  if (!isAllowedTable(table)) {
    throw new Error("Tabela não permitida para sync de sequence");
  }

  await sequelize.query(
    `SELECT setval(
      pg_get_serial_sequence('"${table}"', 'id'),
      (SELECT COALESCE(MAX("id"), 1) FROM "${table}"),
      (SELECT EXISTS (SELECT 1 FROM "${table}"))
    )`,
    { type: QueryTypes.SELECT, transaction }
  );
};

export const syncCompanyCreateSequences = async (
  transaction?: Transaction
): Promise<void> => {
  await syncSerialSequence("Companies", transaction);
  await syncSerialSequence("Users", transaction);
  await syncSerialSequence("CompaniesSettings", transaction);
};
