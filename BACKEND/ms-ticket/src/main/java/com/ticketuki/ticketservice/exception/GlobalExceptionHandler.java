package com.ticketuki.ticketservice.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice
public class GlobalExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ApiError> handleTicketNotFoundException(TicketNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

    @ExceptionHandler(TicketOperacionInvalidaException.class)
    public ResponseEntity<ApiError> handleTicketOperacionInvalidaException(TicketOperacionInvalidaException ex, HttpServletRequest request) {
        return respuesta(422, ex.getMessage(), request);
    }

}
