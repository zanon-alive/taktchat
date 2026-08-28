import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmptyState from "../index";

describe("EmptyState", () => {
  it("mostra título e dispara a ação", () => {
    const onAction = jest.fn();
    render(
      <EmptyState
        title="Nenhuma campanha"
        actionLabel="Criar a primeira"
        onAction={onAction}
      />
    );
    expect(screen.getByText("Nenhuma campanha")).toBeInTheDocument();
    userEvent.click(screen.getByRole("button", { name: "Criar a primeira" }));
    expect(onAction).toHaveBeenCalled();
  });
});
