import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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

const theme = createTheme();

const fillCompanyForm = ({ name, email, password }) => {
  userEvent.type(screen.getByLabelText("companyModal.form.name"), name);
  userEvent.type(screen.getByLabelText("companyModal.form.email"), email);
  userEvent.type(document.body.querySelector('input[name="passwordDefault"]'), password);
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

  it("chama onSave após cadastrar empresa com sucesso", async () => {
    const onSave = jest.fn(() => Promise.resolve());
    renderModal({ onSave });

    fillCompanyForm({
      name: "Gerson - Empresa Teste",
      email: "gerson@taktchat.com.br",
      password: "senha123",
    });
    userEvent.click(screen.getByRole("button", { name: "companyModal.buttons.okAdd" }));

    await waitFor(
      () => {
        expect(api.post).toHaveBeenCalledWith(
          "/companies",
          expect.objectContaining({
            name: "Gerson - Empresa Teste",
            email: "gerson@taktchat.com.br",
          })
        );
        expect(onSave).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );
  });

  it("nao chama onSave quando o cadastro falha", async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: "erro" } } });
    const onSave = jest.fn();
    renderModal({ onSave });

    fillCompanyForm({
      name: "Empresa Falha",
      email: "falha@taktchat.com.br",
      password: "senha123",
    });
    userEvent.click(screen.getByRole("button", { name: "companyModal.buttons.okAdd" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    }, { timeout: 3000 });

    expect(onSave).not.toHaveBeenCalled();
  });
});
