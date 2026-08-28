import {
  buildFlowMenuInteractive,
  buildFlowMenuText,
  extractInteractiveReplyId,
  resolveFlowMenuPressKey,
  resolveFlowMenuTarget,
  resolveFlowElseTarget,
  resolveFlowHandleTarget,
  shouldSendFlowMenuInteractive
} from "../flowMenuInteractive";

const options = [
  { number: 1, value: "Suporte" },
  { number: 2, value: "Vendas" },
  { number: 3, value: "Falar com atendente" }
];

describe("flowMenuInteractive", () => {
  describe("buildFlowMenuText", () => {
    it("monta o menu numerado usado como fallback", () => {
      expect(buildFlowMenuText("Escolha:", options)).toBe(
        "Escolha:\n\n[1] Suporte\n[2] Vendas\n[3] Falar com atendente"
      );
    });
  });

  describe("shouldSendFlowMenuInteractive", () => {
    it("envia interativo por padrao ate 10 opcoes", () => {
      expect(shouldSendFlowMenuInteractive(undefined, 3)).toBe(true);
      expect(shouldSendFlowMenuInteractive(undefined, 10)).toBe(true);
      expect(shouldSendFlowMenuInteractive(undefined, 11)).toBe(false);
    });

    it("respeita o opt-out do editor", () => {
      expect(shouldSendFlowMenuInteractive(false, 3)).toBe(false);
    });

    it("não usa botão nem lista no Baileys", () => {
      expect(shouldSendFlowMenuInteractive(undefined, 3, "baileys")).toBe(false);
      expect(shouldSendFlowMenuInteractive(undefined, 5, "baileys")).toBe(false);
    });

    it("na API oficial envia interativo", () => {
      expect(shouldSendFlowMenuInteractive(undefined, 3, "official")).toBe(true);
      expect(shouldSendFlowMenuInteractive(undefined, 5, "official")).toBe(true);
    });
  });

  describe("buildFlowMenuInteractive", () => {
    it("usa botoes quando ha ate 3 opcoes", () => {
      const payload = buildFlowMenuInteractive("Como posso ajudar?", options);
      expect(payload.kind).toBe("buttons");
      expect(payload.body).toBe("Como posso ajudar?");
      expect(payload.buttons).toEqual([
        { id: "1", title: "Suporte" },
        { id: "2", title: "Vendas" },
        { id: "3", title: "Falar com atendente" }
      ]);
    });

    it("usa lista quando ha 4 a 10 opcoes", () => {
      const many = Array.from({ length: 5 }, (_, index) => ({
        number: index + 1,
        value: `Opção ${index + 1}`
      }));
      const payload = buildFlowMenuInteractive("Menu", many);
      expect(payload.kind).toBe("list");
      expect(payload.listButtonText).toBe("Escolher");
      expect(payload.listSections?.[0].rows).toHaveLength(5);
      expect(payload.listSections?.[0].rows[0]).toEqual({
        id: "1",
        title: "Opção 1"
      });
    });

    it("trunca titulo do botao em 20 caracteres", () => {
      const payload = buildFlowMenuInteractive("Menu", [
        { number: 1, value: "Falar com um atendente humano agora" }
      ]);
      expect(payload.buttons?.[0].title.length).toBeLessThanOrEqual(20);
    });

    it("volta para texto quando o usuario desliga os botoes", () => {
      const payload = buildFlowMenuInteractive("Escolha", options, false);
      expect(payload.kind).toBe("text");
      expect(payload.body).toContain("[1] Suporte");
    });

    it("no Baileys monta texto numerado mesmo com 3 opcoes", () => {
      const payload = buildFlowMenuInteractive(
        "Escolha uma opção:",
        options,
        undefined,
        "baileys"
      );
      expect(payload.kind).toBe("text");
      expect(payload.body).toContain("[1] Suporte");
      expect(payload.body).toContain("[3] Falar com atendente");
    });

    it("na API oficial continua com botoes", () => {
      const payload = buildFlowMenuInteractive(
        "Como posso ajudar?",
        options,
        undefined,
        "official"
      );
      expect(payload.kind).toBe("buttons");
      expect(payload.body).toBe("Como posso ajudar?");
    });
  });

  describe("extractInteractiveReplyId", () => {
    it("lê o id do clique em botao Baileys", () => {
      expect(
        extractInteractiveReplyId({
          message: { buttonsResponseMessage: { selectedButtonId: "2" } }
        })
      ).toBe("2");
    });

    it("lê o id da lista e do nativeFlow", () => {
      expect(
        extractInteractiveReplyId({
          message: {
            listResponseMessage: { singleSelectReply: { selectedRowId: "3" } }
          }
        })
      ).toBe("3");

      expect(
        extractInteractiveReplyId({
          message: {
            interactiveResponseMessage: {
              nativeFlowResponseMessage: {
                paramsJson: JSON.stringify({ id: "1", display_text: "Suporte" })
              }
            }
          }
        })
      ).toBe("1");
    });
  });

  describe("resolveFlowMenuPressKey", () => {
    it("aceita o numero digitado", () => {
      expect(resolveFlowMenuPressKey("2", options)).toBe("2");
    });

    it("aceita o titulo do botao", () => {
      expect(resolveFlowMenuPressKey("Suporte", options)).toBe("1");
    });

    it("prioriza o id da mensagem interativa", () => {
      expect(
        resolveFlowMenuPressKey("Suporte", options, {
          message: { buttonsResponseMessage: { selectedButtonId: "3" } }
        })
      ).toBe("3");
    });
  });

  describe("resolveFlowMenuTarget", () => {
    const connections = [
      { source: "menu1", sourceHandle: "a1", target: "ticket-suporte" },
      { source: "menu1", sourceHandle: "2", target: "ticket-vendas" },
      { source: "menu1", sourceHandle: "a3", target: "ticket-financeiro" }
    ];

    it("aceita handle a1 e handle 2", () => {
      expect(resolveFlowMenuTarget(connections, "menu1", "1")).toBe(
        "ticket-suporte"
      );
      expect(resolveFlowMenuTarget(connections, "menu1", "2")).toBe(
        "ticket-vendas"
      );
    });

    it("retorna undefined para opção inválida", () => {
      expect(resolveFlowMenuTarget(connections, "menu1", "teste")).toBeUndefined();
      expect(resolveFlowMenuTarget(connections, "menu1", "")).toBeUndefined();
    });

    it("resolve o handle aelse", () => {
      const withElse = [
        ...connections,
        { source: "menu1", sourceHandle: "aelse", target: "msg-nao-entendi" }
      ];
      expect(resolveFlowElseTarget(withElse, "menu1")).toBe("msg-nao-entendi");
      expect(resolveFlowHandleTarget(withElse, "menu1", "a")).toBeUndefined();
      expect(resolveFlowElseTarget(connections, "menu1")).toBeUndefined();
    });
  });
});
