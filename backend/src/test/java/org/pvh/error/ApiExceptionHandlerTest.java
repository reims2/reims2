package org.pvh.error;

import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.function.Supplier;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ApiExceptionHandlerTest {

    private static final Map<String, Supplier<RuntimeException>> FAILURES = Map.of(
        "bad-request", () -> new BadRequestException("bad"),
        "bad-credentials", () -> new BadCredentialsException("wrong"),
        "not-found", () -> new NotFoundException("missing"),
        "conflict", () -> new ConflictException("taken"),
        "constraint", () -> new DataIntegrityViolationException("unique"),
        "database-down", () -> new DataAccessResourceFailureException("down"),
        "bug", () -> new IllegalStateException("bug"),
        "denied", () -> new AccessDeniedException("denied"));

    @RestController
    static class FailingController {
        @GetMapping("/{failure}")
        void fail(@PathVariable String failure) {
            throw FAILURES.get(failure).get();
        }
    }

    private final MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new FailingController())
        .setControllerAdvice(new ApiExceptionHandler()).build();

    private void expect(String failure, int status, String detail) throws Exception {
        mockMvc.perform(get("/" + failure))
            .andExpect(status().is(status))
            .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
            .andExpect(jsonPath("$.detail", is(detail)));
    }

    @Test
    void badInput_isAClientError() throws Exception {
        expect("bad-request", 400, "bad");
        expect("bad-credentials", 401, "Invalid username or password.");
        expect("not-found", 404, "missing");
        expect("conflict", 409, "taken");
        expect("constraint", 409, "This change conflicts with another one, please reload and try again.");
    }

    // a 5xx keeps a change queued offline for the next try, a 4xx would drop it
    @Test
    void everythingElse_isAServerError() throws Exception {
        expect("database-down", 500, "Database error, please try again later.");
        expect("bug", 500, "Unexpected error, please try again later.");
    }

    @Test
    void accessDenied_isLeftToSpringSecurity() {
        ServletException ex = assertThrows(ServletException.class, () -> mockMvc.perform(get("/denied")));
        assertInstanceOf(AccessDeniedException.class, ex.getCause());
    }
}
