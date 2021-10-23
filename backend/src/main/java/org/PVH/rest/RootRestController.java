package org.PVH.rest;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping("/")
public class RootRestController {

    @Value("#{servletContext.contextPath}")
    private String servletContextPath;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public void redirectToSwagger(HttpServletResponse response) throws IOException {
        response.sendRedirect(this.servletContextPath + "/swagger-ui.html");
    }

    @RequestMapping(value = "/api", method = RequestMethod.GET, produces = MediaType.TEXT_PLAIN_VALUE)
    public @ResponseBody String status(HttpServletResponse response) {
        return "OK";
    }

}
