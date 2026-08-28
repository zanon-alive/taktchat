import {
  isGenericContactName,
  pickWhatsAppProfileName,
  resolveContactDisplayName
} from "../contactDisplayName";

describe("isGenericContactName", () => {
  it("trata vazio, undefined e só número como genérico", () => {
    expect(isGenericContactName("", "5511999")).toBe(true);
    expect(isGenericContactName("undefined", "5511999")).toBe(true);
    expect(isGenericContactName("5511999", "5511999")).toBe(true);
    expect(isGenericContactName("55 11 999", "5511999")).toBe(true);
  });

  it("mantém nome próprio", () => {
    expect(isGenericContactName("Maria Silva", "5511999")).toBe(false);
  });
});

describe("pickWhatsAppProfileName", () => {
  it("ignora pushName igual ao número", () => {
    expect(pickWhatsAppProfileName("5511999", "5511999")).toBe("");
  });

  it("aceita o nome do perfil", () => {
    expect(pickWhatsAppProfileName("João", "5511999")).toBe("João");
  });
});

describe("resolveContactDisplayName", () => {
  it("usa name quando já está definido", () => {
    expect(
      resolveContactDisplayName({
        name: "Cliente Curado",
        contactName: "Push Name",
        number: "5511999"
      })
    ).toBe("Cliente Curado");
  });

  it("cai no nome do WhatsApp quando name é o número", () => {
    expect(
      resolveContactDisplayName({
        name: "5511999",
        contactName: "Ana WhatsApp",
        number: "5511999"
      })
    ).toBe("Ana WhatsApp");
  });

  it("aceita ticket.contact", () => {
    expect(
      resolveContactDisplayName({
        contact: { name: "", contactName: "Perfil WA", number: "5511" }
      })
    ).toBe("Perfil WA");
  });
});
