package com.ticketuki.historialservice.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice
public class GlobalExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(HistorialNotFoundException.class)
    public ResponseEntity<ApiError> handleHistorialNotFoundException(HistorialNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

}
