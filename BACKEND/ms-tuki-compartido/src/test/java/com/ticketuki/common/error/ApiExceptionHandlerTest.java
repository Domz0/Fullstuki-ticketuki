package com.ticketuki.common.error;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiExceptionHandlerTest {
    @RestControllerAdvice static class Handler extends ApiExceptionHandler {}
    @RestController static class Controller {
        @GetMapping("/prueba/{id}") String leer(@PathVariable long id) { throw new DataIntegrityViolationException("SQL privado"); }
        @PostMapping("/prueba") String crear(@RequestBody java.util.Map<String, Object> body) { return "ok"; }
    }
    @Test void conflictosNoExponenSqlYTodosLosErroresTienenElMismoFormato() throws Exception {
        var mvc = MockMvcBuilders.standaloneSetup(new Controller()).setControllerAdvice(new Handler()).build();
        mvc.perform(get("/prueba/1")).andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409)).andExpect(jsonPath("$.timestamp").exists())
            .andExpect(jsonPath("$.path").value("/prueba/1"))
            .andExpect(jsonPath("$.message").value("Los datos entran en conflicto con un registro existente"));
        mvc.perform(post("/prueba").contentType(MediaType.APPLICATION_JSON).content("{"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        mvc.perform(get("/prueba/abc")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }
}
