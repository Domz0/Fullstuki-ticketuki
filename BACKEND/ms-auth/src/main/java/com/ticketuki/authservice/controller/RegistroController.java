package com.ticketuki.authservice.controller;

import com.ticketuki.authservice.dto.*;
import com.ticketuki.authservice.service.RegistroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class RegistroController {
    private final RegistroService registroService;

    @PostMapping("/auth/registro")
    public ResponseEntity<LoginResponseDTO> registrar(@Valid @RequestBody RegistroRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(registroService.registrar(dto));
    }
}
