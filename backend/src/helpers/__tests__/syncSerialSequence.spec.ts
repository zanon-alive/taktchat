import { syncCompanyCreateSequences, syncSerialSequence } from "../syncSerialSequence";
import sequelize from "../../database";

jest.mock("../../database", () => ({
  __esModule: true,
  default: { query: jest.fn() }
}));

describe("syncSerialSequence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (sequelize.query as jest.Mock).mockResolvedValue([]);
  });

  it("alinha a sequence da tabela permitida", async () => {
    await syncSerialSequence("Companies");

    expect(sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('pg_get_serial_sequence(\'"Companies"\', \'id\')'),
      expect.objectContaining({ transaction: undefined })
    );
  });

  it("alinha Companies, Users e CompaniesSettings juntos", async () => {
    await syncCompanyCreateSequences();
    expect(sequelize.query).toHaveBeenCalledTimes(3);
  });
});
