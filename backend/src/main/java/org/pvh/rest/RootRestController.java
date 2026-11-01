package org.pvh.rest;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootRestController {

    // external uptime check, actuator isn't routed publicly
    @SecurityRequirements
    @GetMapping(value = "/api", produces = MediaType.TEXT_PLAIN_VALUE)
    public String status() {
        return "OK";
    }

}
