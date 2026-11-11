package com.ticketuki.recintoservice.exception;

import com.ticketuki.common.error.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@ControllerAdvice
public class GlobalExceptionHandler extends ApiExceptionHandler {
    @ExceptionHandler(RecintoNotFoundException.class)
    public ResponseEntity<ApiError> handleRecintoNotFoundException(RecintoNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

    @ExceptionHandler(SectorNotFoundException.class)
    public ResponseEntity<ApiError> handleSectorNotFoundException(SectorNotFoundException ex, HttpServletRequest request) {
        return respuesta(404, ex.getMessage(), request);
    }

}
