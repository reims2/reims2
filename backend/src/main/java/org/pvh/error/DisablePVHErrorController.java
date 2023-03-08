package org.pvh.error;

import org.pvh.error.dto.ErrorResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Date;

@RestControllerAdvice
@ConditionalOnProperty(name = "pvh.debug.enable", havingValue = "true")
public class DisablePVHErrorController extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = RuntimeException.class)
    protected ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex, WebRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex instanceof PVHException) {
            PVHException test = (PVHException) ex;
            if (test.getStatusCode() != null)
                status = test.getStatusCode();
        } else {
            status = HttpStatus.BAD_REQUEST;
        }


        return new ResponseEntity<>(
                new ErrorResponse(status.value(),
                        ex.getClass().toString(),
                        ex.getMessage(),
                        ((ServletWebRequest) request).getRequest().getRequestURI(),
                        new Date()),
                status);

    }
}

