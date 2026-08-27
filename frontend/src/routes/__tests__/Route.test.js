import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route as RouterRoute, Switch } from "react-router-dom";

import { AuthContext } from "../../context/Auth/AuthContext";
import Route from "../Route";
import { isNativeCapacitor } from "../../utils/nativeApp";

jest.mock("../../utils/nativeApp", () => ({
  isNativeCapacitor: jest.fn(() => false),
}));

const Dashboard = () => <div>Dashboard</div>;
const Landing = () => <div>Landing</div>;
const Login = () => <div>Login</div>;

function renderGuestHome() {
  return render(
    <AuthContext.Provider value={{ isAuth: false, loading: false }}>
      <MemoryRouter initialEntries={["/"]}>
        <Switch>
          <RouterRoute exact path="/landing" component={Landing} />
          <RouterRoute exact path="/login" component={Login} />
          <Route
            exact
            path="/"
            component={Dashboard}
            isPrivate
            guestRedirect="/landing"
          />
        </Switch>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Route guestRedirect da home", () => {
  beforeEach(() => {
    isNativeCapacitor.mockReturnValue(false);
  });

  it("visitante web em / vai para /landing", () => {
    renderGuestHome();
    expect(screen.getByText("Landing")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("visitante nativo em / vai para /login", () => {
    isNativeCapacitor.mockReturnValue(true);
    renderGuestHome();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Landing")).not.toBeInTheDocument();
  });

  it("usuario autenticado em / permanece no Dashboard", () => {
    render(
      <AuthContext.Provider value={{ isAuth: true, loading: false }}>
        <MemoryRouter initialEntries={["/"]}>
          <Switch>
            <RouterRoute exact path="/landing" component={Landing} />
            <Route
              exact
              path="/"
              component={Dashboard}
              isPrivate
              guestRedirect="/landing"
            />
          </Switch>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
