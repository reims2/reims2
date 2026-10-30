package org.pvh.error;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.stream.Collectors;

// clients drop a queued offline change on a 4xx and retry it on a 5xx, so only bad input may map to 4xx
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers,
                                                                  HttpStatusCode status, WebRequest request) {
        ProblemDetail body = ex.getBody();
        body.setDetail(ex.getFieldErrors().stream()
            .map(error -> error.getField() + " " + error.getDefaultMessage())
            .sorted()
            .collect(Collectors.joining(", ")));
        return handleExceptionInternal(ex, body, headers, status, request);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail handleBadRequest(ConstraintViolationException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail handleConflict(DataIntegrityViolationException ex) {
        logger.warn("Write rejected by a database constraint", ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
            "This change conflicts with another one, please reload and try again.");
    }

    @ExceptionHandler({DataAccessException.class, TransactionException.class})
    ProblemDetail handleDatabaseError(Exception ex) {
        logger.error("Database error", ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Database error, please try again later.");
    }
}
