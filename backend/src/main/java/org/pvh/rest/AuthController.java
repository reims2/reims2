package org.pvh.rest;

import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import org.pvh.error.NotFoundException;
import org.pvh.model.dto.JwtResponse;
import org.pvh.model.dto.LoginRequest;
import org.pvh.model.dto.MessageResponse;
import org.pvh.model.dto.SignupRequest;
import org.pvh.model.dto.UserResponse;
import org.pvh.security.TokenService;
import org.pvh.security.UserDetailsImpl;
import org.pvh.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, TokenService tokenService, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.userService = userService;
    }

    @SecurityRequirements
    @PostMapping("/signin")
    public JwtResponse authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        UserDetailsImpl user = (UserDetailsImpl) authenticationManager
            .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()))
            .getPrincipal();
        List<String> roles = user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        return new JwtResponse(tokenService.createToken(user.getUsername()), "Bearer", user.getId(), user.getUsername(), roles);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/user", produces = "application/json")
    public UserResponse getCurrentUserInfo(Principal userPrincipal) {
        return userService.findByUsername(userPrincipal.getName()).map(UserResponse::from)
            .orElseThrow(() -> new NotFoundException("User was not found."));
    }

    @PostMapping("/signup")
    @PreAuthorize("hasRole('ADMIN')")
    public MessageResponse registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        userService.register(signUpRequest.username(), signUpRequest.password(), signUpRequest.roleNames());
        return new MessageResponse("User registered successfully!");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.findAll().stream().map(UserResponse::from).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable("id") long id) {
        userService.delete(id);
    }

}
