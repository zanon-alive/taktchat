import { canViewDeletedTickets } from "../../helpers/ticketDeletion";

describe("permissão tickets.viewDeleted", () => {
  it("não-admin sem a permissão não vê lista", () => {
    expect(
      canViewDeletedTickets({ profile: "user", permissions: ["tickets.view"] })
    ).toBe(false);
  });

  it("supervisor só com viewDeleted pode ver", () => {
    expect(
      canViewDeletedTickets({
        profile: "user",
        permissions: ["tickets.viewDeleted"]
      })
    ).toBe(true);
  });
});
