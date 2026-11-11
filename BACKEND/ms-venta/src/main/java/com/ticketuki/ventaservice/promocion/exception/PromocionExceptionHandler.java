package com.ticketuki.ventaservice.promocion.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice(basePackages = "com.ticketuki.ventaservice.promocion.controller")
public class PromocionExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(PromocionNotFoundException.class)
    public ResponseEntity<ApiError> noEncontrada(PromocionNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }
}
