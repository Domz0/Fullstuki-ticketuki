package com.ticketuki.ventaservice.pago.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice(basePackages = "com.ticketuki.ventaservice.pago.controller")
public class PagoExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(PagoNotFoundException.class)
    public ResponseEntity<ApiError> handlePagoNotFoundException(PagoNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

}
