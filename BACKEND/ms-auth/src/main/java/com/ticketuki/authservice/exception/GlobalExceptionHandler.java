package com.ticketuki.authservice.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice
public class GlobalExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ApiError> handleCredencialesInvalidasException(CredencialesInvalidasException ex, HttpServletRequest request) {
        return respuesta(401, ex.getMessage(), request);
    }

}
