import {
  getContactChatJid,
  pickOutboundChatJid,
  safeSendPresenceUpdate,
  toWhatsAppAdapterAddress
} from "../whatsappJid";

describe("pickOutboundChatJid", () => {
  it("responde no @lid da última mensagem recebida", () => {
    expect(
      pickOutboundChatJid(
        { remoteJid: "5511999999999@s.whatsapp.net", number: "5511999999999" },
        false,
        "123456@lid"
      )
    ).toBe("123456@lid");
  });

  it("cai no número quando a última mensagem não é @lid", () => {
    expect(
      pickOutboundChatJid(
        { remoteJid: "5511999999999@s.whatsapp.net", number: "5511999999999" },
        false,
        "5511999999999@s.whatsapp.net"
      )
    ).toBe("5511999999999@s.whatsapp.net");
  });
});

describe("toWhatsAppAdapterAddress", () => {
  it("na API Oficial envia só o número", () => {
    expect(toWhatsAppAdapterAddress("5511999999999@s.whatsapp.net", "official")).toBe(
      "5511999999999"
    );
  });

  it("no Baileys preserva @lid", () => {
    expect(toWhatsAppAdapterAddress("123456@lid", "baileys")).toBe("123456@lid");
  });
});

describe("getContactChatJid", () => {
  it("prefere o número mesmo quando remoteJid já é um JID", () => {
    expect(
      getContactChatJid({
        remoteJid: "5511999999999@s.whatsapp.net",
        number: "5511999999999"
      })
    ).toBe("5511999999999@s.whatsapp.net");
  });

  it("não usa @lid quando há número de telefone", () => {
    expect(
      getContactChatJid({ remoteJid: "123456@lid", number: "5511999999999" })
    ).toBe("5511999999999@s.whatsapp.net");
  });

  it("monta JID pelo número quando remoteJid está vazio", () => {
    expect(getContactChatJid({ remoteJid: "", number: "5511999999999" })).toBe(
      "5511999999999@s.whatsapp.net"
    );
  });

  it("retorna undefined sem número e com @lid", () => {
    expect(
      getContactChatJid({ remoteJid: "123456@lid", number: null })
    ).toBeUndefined();
  });

  it("retorna undefined sem JID e sem número", () => {
    expect(getContactChatJid({ remoteJid: null, number: null })).toBeUndefined();
  });
});

describe("safeSendPresenceUpdate", () => {
  it("não chama o socket sem JID", async () => {
    const sendPresenceUpdate = jest.fn();
    await safeSendPresenceUpdate({ sendPresenceUpdate }, "paused");
    expect(sendPresenceUpdate).not.toHaveBeenCalled();
  });

  it("engole erro de jidDecode", async () => {
    const sendPresenceUpdate = jest.fn().mockRejectedValue(
      new TypeError("Cannot destructure property 'server' of 'jidDecode(...)' as it is undefined.")
    );
    await expect(
      safeSendPresenceUpdate(
        { sendPresenceUpdate },
        "paused",
        "5511999999999@s.whatsapp.net"
      )
    ).resolves.toBeUndefined();
  });
});
