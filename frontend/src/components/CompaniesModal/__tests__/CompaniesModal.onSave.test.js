import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CompanyModal from "../index";
import api from "../../../services/api";

jest.mock("../../../services/api", () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: { id: 2 } })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock("../../../errors/toastError", () => jest.fn());

jest.mock("../../../translate/i18n", () => ({
  i18n: { t: (key) => key },
}));

jest.mock("../../../hooks/usePlans", () => ({
  __esModule: true,
  default: () => ({
    list: jest.fn(() => Promise.resolve([{ id: 1, name: "Plano Teste" }])),
  }),
}));

const theme = createTheme();

const selectPlan = async () => {
  fireEvent.mouseDown(screen.getByLabelText("companyModal.form.plan"));
  const option = await screen.findByText("Plano Teste");
  fireEvent.click(option);
};

const fillCompanyForm = async ({ name, email, password, withPlan = true }) => {
  userEvent.type(screen.getByLabelText("companyModal.form.name"), name);
  userEvent.type(screen.getByLabelText("companyModal.form.email"), email);
  userEvent.type(document.body.querySelector('input[name="passwordDefault"]'), password);
  if (withPlan) {
    await selectPlan();
  }
};

const renderModal = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <CompanyModal open onClose={jest.fn()} {...props} />
    </ThemeProvider>
  );

describe("CompanyModal onSave", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.post.mockResolvedValue({ data: { id: 2 } });
  });

  afterEach(() => {
    cleanup();
  });

  it("chama onSave após cadastrar empresa com sucesso", async () => {
    const onSave = jest.fn(() => Promise.resolve());
    renderModal({ onSave });

    await fillCompanyForm({
      name: "Gerson - Empresa Teste",
      email: "gerson@taktchat.com.br",
      password: "senha123",
    });
    api.post.mockClear();
    onSave.mockClear();
    userEvent.click(screen.getByRole("button", { name: "companyModal.buttons.okAdd" }));

    await waitFor(
      () => {
        expect(api.post).toHaveBeenCalledWith(
          "/companies",
          expect.objectContaining({
            name: "Gerson - Empresa Teste",
            email: "gerson@taktchat.com.br",
            planId: 1,
            licenseStartDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
            licenseEndDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          })
        );
        expect(onSave).toHaveBeenCalledTimes(1);
      },
      { timeout: 4000 }
    );
  }, 15000);

  it("nao chama onSave quando o cadastro falha", async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: "erro" } } });
    const onSave = jest.fn();
    renderModal({ onSave });

    await fillCompanyForm({
      name: "Empresa Falha",
      email: "falha@taktchat.com.br",
      password: "senha123",
    });
    api.post.mockClear();
    api.post.mockRejectedValueOnce({ response: { data: { message: "erro" } } });
    onSave.mockClear();
    userEvent.click(screen.getByRole("button", { name: "companyModal.buttons.okAdd" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    }, { timeout: 4000 });

    expect(onSave).not.toHaveBeenCalled();
  }, 15000);

  it("nao chama api.post quando o plano nao e informado", async () => {
    const onSave = jest.fn();
    renderModal({ onSave });

    await fillCompanyForm({
      name: "Sem Plano",
      email: "semplano@taktchat.com.br",
      password: "senha123",
      withPlan: false,
    });
    api.post.mockClear();
    onSave.mockClear();
    userEvent.click(screen.getByRole("button", { name: "companyModal.buttons.okAdd" }));

    await waitFor(() => {
      expect(screen.getByText("Plano é obrigatório")).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  }, 15000);

  it("nao chama api.post quando o termino esta vazio", async () => {
    const onSave = jest.fn();
    renderModal({ onSave });

    await fillCompanyForm({
      name: "Sem Termino",
      email: "semtermino@taktchat.com.br",
      password: "senha123",
    });
    fireEvent.change(screen.getByLabelText("companyModal.form.licenseEndDate"), {
      target: { value: "" },
    });
    api.post.mockClear();
    onSave.mockClear();
    userEvent.click(screen.getByRole("button", { name: "companyModal.buttons.okAdd" }));

    await waitFor(() => {
      expect(screen.getByText("Data de término é obrigatória")).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  }, 15000);
});
