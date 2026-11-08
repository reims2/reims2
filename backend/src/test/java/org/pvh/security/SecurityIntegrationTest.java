package org.pvh.security;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.pvh.IntegrationTest;
import org.pvh.repository.UserRepository;
import org.pvh.service.UserService;
import org.pvh.model.enums.RoleEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.session.web.http.SessionRepositoryFilter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@IntegrationTest
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @BeforeEach
    void createUsers() {
        createUser("sec-user", RoleEnum.ROLE_USER);
        createUser("sec-admin", RoleEnum.ROLE_ADMIN);
    }

    private void createUser(String username, RoleEnum role) {
        if (!userRepository.existsByUsername(username))
            userService.register(username, "password", Set.of(role));
    }

    private static String credentials(String username) {
        return "{\"username\":\"" + username + "\",\"password\":\"password\"}";
    }

    private MockHttpServletResponse signin(MockMvc mvc, String username, Cookie... cookies) throws Exception {
        var request = post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON).content(credentials(username));
        if (cookies.length > 0)
            request.cookie(cookies);
        return mvc.perform(request).andExpect(status().isOk()).andReturn().getResponse();
    }

    private Cookie login(String username) throws Exception {
        return signin(mockMvc, username).getCookie("SESSION");
    }

    // like the browser, without the token the other tests send by default
    private MockMvc browser() {
        return MockMvcBuilders.webAppContextSetup(context)
            .addFilters(context.getBean(SessionRepositoryFilter.class))
            .apply(springSecurity())
            .build();
    }

    @Test
    void signin_withWrongPassword_isUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"sec-user\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.detail", is("Invalid username or password.")));
    }

    @Test
    void signin_returnsTheUser() throws Exception {
        String body = signin(mockMvc, "sec-user").getContentAsString();
        assertEquals("sec-user", JsonPath.read(body, "$.username"));
        assertEquals(List.of("ROLE_USER"), JsonPath.read(body, "$.roles"));
    }

    @Test
    void signin_replacesAnEarlierSessionId() throws Exception {
        Cookie before = login("sec-user");
        Cookie after = signin(mockMvc, "sec-user", before).getCookie("SESSION");
        assertNotEquals(before.getValue(), after.getValue());
        mockMvc.perform(get("/api/glasses/sa/all").cookie(before)).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/glasses/sa/all").cookie(after)).andExpect(status().isOk());
    }

    @Test
    void glasses_needLogin() throws Exception {
        mockMvc.perform(get("/api/glasses/sa/all")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/glasses/sa/all").cookie(new Cookie("SESSION", "garbage")))
            .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/glasses/sa/all").cookie(login("sec-user")))
            .andExpect(status().isOk());
    }

    @Test
    void signout_endsTheSession() throws Exception {
        Cookie session = login("sec-user");
        mockMvc.perform(post("/api/auth/signout").cookie(session)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/glasses/sa/all").cookie(session)).andExpect(status().isUnauthorized());
        // also when the session is already gone
        mockMvc.perform(post("/api/auth/signout").cookie(session)).andExpect(status().isNoContent());
    }

    @Test
    void changes_needTheCsrfTokenFromItsCookie() throws Exception {
        MockMvc browser = browser();
        MockHttpServletResponse login = signin(browser, "sec-user");
        Cookie session = login.getCookie("SESSION");
        Cookie token = login.getCookie("XSRF-TOKEN");

        browser.perform(put("/api/glasses/-1/dispense").cookie(session)).andExpect(status().isForbidden());
        browser.perform(put("/api/glasses/-1/dispense").cookie(session, token).header("X-XSRF-TOKEN", "wrong"))
            .andExpect(status().isForbidden());
        browser.perform(put("/api/glasses/-1/dispense").cookie(session, token).header("X-XSRF-TOKEN", token.getValue()))
            .andExpect(status().isNotFound());
    }

    @Test
    void adminOnlyEndpoints_areForbiddenForUsers() throws Exception {
        Cookie user = login("sec-user");
        Cookie admin = login("sec-admin");

        mockMvc.perform(delete("/api/auth/999999").cookie(user)).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/auth/999999").cookie(admin)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/auth").cookie(user)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/auth").cookie(admin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].username", hasItem("sec-admin")));
    }

    @Test
    void currentUser_needsLogin() throws Exception {
        mockMvc.perform(get("/api/auth/user")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/auth/user").cookie(login("sec-user")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username", is("sec-user")))
            .andExpect(jsonPath("$.roles[0].name", is("ROLE_USER")));
    }

    @Test
    void deletedUser_loosesAccess() throws Exception {
        createUser("sec-deleted", RoleEnum.ROLE_USER);
        Cookie session = login("sec-deleted");
        userRepository.delete(userRepository.findByUsername("sec-deleted").orElseThrow());

        mockMvc.perform(get("/api/glasses/sa/all").cookie(session)).andExpect(status().isUnauthorized());
    }

    @Test
    void deletingAUser_endsTheirSessions() throws Exception {
        createUser("sec-recreated", RoleEnum.ROLE_USER);
        Cookie session = login("sec-recreated");
        userService.delete(userRepository.findByUsername("sec-recreated").orElseThrow().getId());
        createUser("sec-recreated", RoleEnum.ROLE_USER);

        mockMvc.perform(get("/api/glasses/sa/all").cookie(session)).andExpect(status().isUnauthorized());
    }

    @Test
    void signup_byAdmin() throws Exception {
        String body = "{\"username\":\"sec-new\",\"password\":\"password\",\"roles\":[{\"name\":\"ROLE_USER\"}]}";
        mockMvc.perform(post("/api/auth/signup").cookie(login("sec-user"))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isForbidden());
        userRepository.findByUsername("sec-new").ifPresent(userRepository::delete);

        mockMvc.perform(post("/api/auth/signup").cookie(login("sec-admin"))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/signup").cookie(login("sec-admin"))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/glasses/sa/all").cookie(login("sec-new"))).andExpect(status().isOk());
    }

    // BCrypt's limit is 72 bytes, so non-ASCII passwords hit it before 72 characters
    @Test
    void signup_rejectsPasswordsOver72Bytes() throws Exception {
        Cookie admin = login("sec-admin");
        userRepository.findByUsername("sec-long").ifPresent(userRepository::delete);
        for (String password : new String[] {"a".repeat(73), "ü".repeat(37)}) {
            mockMvc.perform(post("/api/auth/signup").cookie(admin).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"username\":\"sec-long\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isBadRequest());
        }
        mockMvc.perform(post("/api/auth/signup").cookie(admin).contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"sec-long\",\"password\":\"" + "ü".repeat(36) + "\"}"))
            .andExpect(status().isOk());
    }
}
