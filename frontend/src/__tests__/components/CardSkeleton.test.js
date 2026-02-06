/**
 * Testes para o componente CardSkeleton
 */

import React from "react";
import { render } from "@testing-library/react";
import CardSkeleton from "../../components/CardSkeleton";

describe("CardSkeleton", () => {
  test("renderiza sem erros com variant default", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });

  test("renderiza variant chip sem erros", () => {
    const { container } = render(<CardSkeleton variant="chip" />);
    expect(container.querySelector(".rounded-lg")).toBeInTheDocument();
  });

  test("não renderiza elementos tr (evita DOM nesting inválido)", () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector("tr")).not.toBeInTheDocument();
  });
});
