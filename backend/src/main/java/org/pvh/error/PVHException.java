package org.pvh.error;

import org.springframework.http.HttpStatus;

public class PVHException extends RuntimeException {
    private final HttpStatus statusCode;

    public PVHException(String message, HttpStatus statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }

}
