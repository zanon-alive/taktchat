import {
  isPrivateLanHostname,
  resolveLocalDevBackendUrl,
} from "../localDevBackend";

describe("isPrivateLanHostname", () => {
  it("reconhece redes privadas", () => {
    expect(isPrivateLanHostname("192.168.18.184")).toBe(true);
    expect(isPrivateLanHostname("10.0.0.5")).toBe(true);
    expect(isPrivateLanHostname("172.16.0.2")).toBe(true);
  });

  it("rejeita localhost e hosts publicos", () => {
    expect(isPrivateLanHostname("localhost")).toBe(false);
    expect(isPrivateLanHostname("127.0.0.1")).toBe(false);
    expect(isPrivateLanHostname("taktchat.com.br")).toBe(false);
    expect(isPrivateLanHostname("")).toBe(false);
  });
});

describe("resolveLocalDevBackendUrl", () => {
  it("usa localhost:8080 no loopback", () => {
    expect(resolveLocalDevBackendUrl("localhost")).toBe("http://localhost:8080");
    expect(resolveLocalDevBackendUrl("127.0.0.1")).toBe("http://localhost:8080");
  });

  it("aponta a API para o mesmo IP da LAN na porta 8080", () => {
    expect(resolveLocalDevBackendUrl("192.168.18.184")).toBe(
      "http://192.168.18.184:8080"
    );
  });

  it("nao inventa URL para hostname de producao", () => {
    expect(resolveLocalDevBackendUrl("taktchat.com.br")).toBeNull();
  });
});
