jest.mock("../../../models/Message", () => ({
  __esModule: true,
  default: { findAll: jest.fn(), update: jest.fn() }
}));
jest.mock("../../../utils/logger", () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

import { isSafeCompanyMediaPath } from "../AnonymizeTicketMessagesService";

describe("isSafeCompanyMediaPath", () => {
  it("rejeita path traversal", () => {
    expect(isSafeCompanyMediaPath(1, "../secret.txt").ok).toBe(false);
    expect(isSafeCompanyMediaPath(1, "ok.jpg").ok).toBe(true);
  });
});
