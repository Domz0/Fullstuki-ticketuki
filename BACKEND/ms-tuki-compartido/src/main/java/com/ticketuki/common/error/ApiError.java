package com.ticketuki.common.error;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(LocalDateTime timestamp, int status, String message, String path,
                       Map<String, String> errors) {
    public static ApiError of(int status, String message, String path, Map<String, String> errors) {
        return new ApiError(LocalDateTime.now(), status, message, path, errors);
    }
}
