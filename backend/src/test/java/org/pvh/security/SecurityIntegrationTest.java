package org.pvh.security;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.pvh.repository.RoleRepository;
import org.pvh.repository.UserRepository;
import org.pvh.security.model.entity.User;
import org.pvh.security.model.enums.ERole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "pvh.security.enable=true")
@AutoConfigureMockMvc
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @BeforeEach
    void createUsers() {
        createUser("sec-user", ERole.ROLE_USER);
        createUser("sec-admin", ERole.ROLE_ADMIN);
    }

    private void createUser(String username, ERole role) {
        if (userRepository.existsByUsername(username))
            return;
        User user = new User(username, encoder.encode("password"));
        user.setRoles(Set.of(roleRepository.findByName(role).orElseThrow()));
        userRepository.save(user);
    }

    private String login(String username) throws Exception {
        String body = mockMvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"" + username + "\",\"password\":\"password\"}"))
            .andExpect(status().isOk())
            .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.accessToken");
    }

    @Test
    void signin_withWrongPassword_isUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/signin").contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"sec-user\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.detail", is("Invalid username or password.")));
    }

    @Test
    void signin_ignoresStaleToken() throws Exception {
        mockMvc.perform(post("/api/auth/signin").header("Authorization", "Bearer expired.or.garbage")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"sec-user\",\"password\":\"password\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.roles", hasItem("ROLE_USER")));
    }

    @Test
    void glasses_needValidToken() throws Exception {
        mockMvc.perform(get("/api/glasses/sa/all")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/glasses/sa/all").header("Authorization", "Bearer garbage"))
            .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/glasses/sa/all").header("Authorization", login("sec-user")))
            .andExpect(status().isOk());
    }

    @Test
    void adminOnlyEndpoints_areForbiddenForUsers() throws Exception {
        String user = login("sec-user");
        String admin = login("sec-admin");

        mockMvc.perform(delete("/api/glasses/sa/9999").header("Authorization", user)).andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/glasses/sa/9999").header("Authorization", admin)).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/auth").header("Authorization", user)).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/auth").header("Authorization", admin))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].username", hasItem("sec-admin")));
    }

    @Test
    void currentUser_needsLogin() throws Exception {
        mockMvc.perform(get("/api/auth/user")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/auth/user").header("Authorization", login("sec-user")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username", is("sec-user")))
            .andExpect(jsonPath("$.roles[0].name", is("ROLE_USER")));
    }

    @Test
    void deletedUser_loosesAccess() throws Exception {
        createUser("sec-deleted", ERole.ROLE_USER);
        String token = login("sec-deleted");
        userRepository.delete(userRepository.findByUsername("sec-deleted").orElseThrow());

        mockMvc.perform(get("/api/glasses/sa/all").header("Authorization", token)).andExpect(status().isUnauthorized());
    }

    @Test
    void signup_byAdmin() throws Exception {
        String body = "{\"username\":\"sec-new\",\"password\":\"password\",\"roles\":[{\"name\":\"ROLE_USER\"}]}";
        mockMvc.perform(post("/api/auth/signup").header("Authorization", login("sec-user"))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isForbidden());
        userRepository.findByUsername("sec-new").ifPresent(userRepository::delete);

        mockMvc.perform(post("/api/auth/signup").header("Authorization", login("sec-admin"))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/signup").header("Authorization", login("sec-admin"))
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/glasses/sa/all").header("Authorization", login("sec-new"))).andExpect(status().isOk());
    }
}
