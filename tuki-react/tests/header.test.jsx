import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Header from "../src/components/Header";

describe("Header según la sesión", () => {
  it("muestra registro y login", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute(
      "href",
      "#/registro",
    );
    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }),
    ).toHaveAttribute("href", "#/login");
    expect(
      screen.queryByRole("link", { name: /Mi cuenta/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cerrar sesión" }),
    ).not.toBeInTheDocument();
  });

  it("muestra iniciales y mi cuenta al recibir un usuario y permite solicitar el cierre", () => {
    const onCerrarSesion = vi.fn();
    const { rerender } = render(<Header onCerrarSesion={onCerrarSesion} />);
    rerender(
      <Header
        usuario={{ nombre: "chispop", apellido: "master", rol: "cliente" }}
        onCerrarSesion={onCerrarSesion}
      />,
    );

    expect(
      screen.queryByRole("link", { name: "Crear cuenta" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Iniciar sesión" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("CM")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Mi cuenta/ })).toHaveAttribute(
      "href",
      "#/cuenta/datos",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(onCerrarSesion).toHaveBeenCalledTimes(1);
    rerender(<Header onCerrarSesion={onCerrarSesion} />);
    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
  });
});
