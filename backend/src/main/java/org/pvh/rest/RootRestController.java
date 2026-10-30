package org.pvh.rest;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootRestController {

    // external uptime check, actuator isn't routed publicly
    @GetMapping(value = "/api", produces = MediaType.TEXT_PLAIN_VALUE)
    public String status() {
        return "OK";
    }

}
