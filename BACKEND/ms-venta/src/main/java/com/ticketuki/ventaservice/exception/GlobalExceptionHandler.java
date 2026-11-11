package com.ticketuki.ventaservice.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice(basePackages = "com.ticketuki.ventaservice.controller")
public class GlobalExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(VentaNotFoundException.class)
    public ResponseEntity<ApiError> handleVentaNotFoundException(VentaNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

}
