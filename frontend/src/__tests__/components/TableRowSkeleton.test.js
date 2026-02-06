/**
 * Testes para o componente TableRowSkeleton
 */

import React from "react";
import { render } from "@testing-library/react";
import TableRowSkeleton from "../../components/TableRowSkeleton";

describe("TableRowSkeleton", () => {
  test("renderiza com columns default quando não informado", () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton />
        </tbody>
      </table>
    );
    expect(container.querySelectorAll("td").length).toBe(4);
  });

  test("renderiza número correto de células com columns prop", () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={6} />
        </tbody>
      </table>
    );
    expect(container.querySelectorAll("td").length).toBeGreaterThanOrEqual(6);
  });

  test("renderiza dentro de tbody sem erros de nesting", () => {
    const { container } = render(
      <table>
        <tbody>
          <TableRowSkeleton columns={4} />
        </tbody>
      </table>
    );
    const tr = container.querySelector("tbody tr");
    expect(tr).toBeInTheDocument();
    expect(tr.parentElement.tagName).toBe("TBODY");
  });
});
