package org.pvh.error;

import org.pvh.error.dto.ErrorResponseDefault;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Date;

@RestControllerAdvice
@ConditionalOnProperty(name = "pvh.debug.enable", havingValue = "false")
public class PVHErrorController extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = RuntimeException.class)
    protected ResponseEntity<ErrorResponseDefault> handleConflict(RuntimeException ex) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex instanceof PVHException test) {
            if (test.getStatusCode() != null)
                status = test.getStatusCode();
        } else {
            status = HttpStatus.BAD_REQUEST;
        }

        return new ResponseEntity<>(
            new ErrorResponseDefault(status.value(),
                // Show error message in production as well.
                ex.getMessage(),
                new Date()),
            status);

    }
}
