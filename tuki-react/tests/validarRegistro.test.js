import { describe, expect, it } from "vitest";
import { validarRegistro } from "../src/utils/validarRegistro";

describe("Validación del registro", () => {
  it("registro correcto", () => {
    const datos = {
      nombre: "pepe",
      apellido: "nacho",
      rut: "11111111-3",
      correo: "chispops@duoc.cl",
      password: "clave123",
      terminos: true,
    };

    const errores = validarRegistro(datos);

    expect(errores).toEqual({});
  });

  it("registro malito", () => {
    const datos = {
      nombre: "   ",
      apellido: "",
      rut: "123",
      correo: "correo-invalido",
      password: "123",
      terminos: false,
    };

    const errores = validarRegistro(datos);

    expect(errores).toEqual({
      nombre: "Ingresa tu nombre",
      apellido: "Ingresa tu apellido",
      rut: "Usa el formato 12.345.678-5 o 12345678-5",
      correo: "Correo no válido",
      password: "Debe tener entre 4 y 10 caracteres",
      terminos: "Debes aceptar los términos",
    });
  });
});
