package org.pvh.rest;

import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.Valid;
import org.pvh.model.dto.ClientErrorDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

// browser errors, Grafana alerts on the counter and the log has the details
@RestController
@PreAuthorize("hasRole('USER')")
public class ClientErrorController {
    private static final Logger logger = LoggerFactory.getLogger(ClientErrorController.class);

    private final MeterRegistry meterRegistry;

    public ClientErrorController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @PostMapping(path = "/api/clientErrors")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reportClientError(@RequestBody @Valid ClientErrorDTO error, Principal principal) {
        meterRegistry.counter("reims.client.errors").increment();
        logger.warn("Client error from {} on version {}: {}", principal.getName(), error.version(),
            error.message().replaceAll("[\\r\\n]+", " | "));
    }
}
