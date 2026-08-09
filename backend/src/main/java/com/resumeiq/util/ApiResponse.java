package com.resumeiq.util;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Standard { success, message, data } envelope used by every endpoint,
 * so the frontend's axios layer can treat every response uniformly
 * regardless of which controller produced it.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(boolean success, String message, T data) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
