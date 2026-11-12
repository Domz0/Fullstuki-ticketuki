package com.ticketuki.common.validation;

import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolationException;

public class ValidacionDatos {
    private final Validator validator;
    public ValidacionDatos(Validator validator) { this.validator = validator; }
    public <T> void validar(T datos) {
        if (datos == null) throw new IllegalArgumentException("Los datos son obligatorios");
        var errores = validator.validate(datos);
        if (!errores.isEmpty()) throw new ConstraintViolationException(errores);
    }
}
