package org.pvh.rest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping("/")
public class RootRestController {

    @Value("#{servletContext.contextPath}")
    private String servletContextPath;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public void redirectToSwagger(HttpServletResponse response) throws IOException {
        response.sendRedirect(this.servletContextPath + "/api");
    }

    @RequestMapping(value = "/api", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
    public @ResponseBody String status(HttpServletResponse response) {
        return "OK";
    }

}
