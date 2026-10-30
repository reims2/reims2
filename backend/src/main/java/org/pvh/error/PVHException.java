package org.pvh.error;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class PVHException extends ResponseStatusException {

    public PVHException(String message, HttpStatus statusCode) {
        super(statusCode, message);
    }

}
