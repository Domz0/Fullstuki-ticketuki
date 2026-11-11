package com.ticketuki.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.*;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import java.util.LinkedHashMap;
import java.util.Map;

public abstract class ApiExceptionHandler {
    protected ResponseEntity<ApiError> respuesta(int status, String mensaje, HttpServletRequest request) {
        return ResponseEntity.status(status).body(ApiError.of(status, mensaje, request.getRequestURI(), null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validacion(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errores = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(e ->
            errores.put(e instanceof FieldError f ? f.getField() : e.getObjectName(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ApiError.of(400, "Validación fallida", request.getRequestURI(), errores));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
        MissingServletRequestParameterException.class, MissingRequestHeaderException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiError> solicitudInvalida(Exception ex, HttpServletRequest request) {
        return respuesta(400, "El cuerpo o los parámetros de la solicitud no son válidos", request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> argumento(IllegalArgumentException ex, HttpServletRequest request) {
        return respuesta(400, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> estado(IllegalStateException ex, HttpServletRequest request) {
        return respuesta(409, "La operación no es compatible con el estado actual", request);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, OptimisticLockingFailureException.class, PessimisticLockingFailureException.class})
    public ResponseEntity<ApiError> conflicto(Exception ex, HttpServletRequest request) {
        return respuesta(409, "Los datos entran en conflicto con un registro existente", request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> estadoHttp(ResponseStatusException ex, HttpServletRequest request) {
        return respuesta(ex.getStatusCode().value(), ex.getReason(), request);
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> metodo(Exception ex, HttpServletRequest request) {
        return respuesta(405, "Método no permitido", request);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiError> recurso(Exception ex, HttpServletRequest request) {
        return respuesta(404, "Recurso no encontrado", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> inesperado(Exception ex, HttpServletRequest request) {
        org.slf4j.LoggerFactory.getLogger(getClass()).error("Error interno", ex);
        return respuesta(500, "Error interno del servidor", request);
    }
}
