package com.ticketuki.eventoservice.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice
public class GlobalExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(EventoNotFoundException.class)
    public ResponseEntity<ApiError> handleEventoNotFoundException(EventoNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

}
