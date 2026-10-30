package org.pvh.rest;

import jakarta.validation.Valid;
import org.pvh.error.PVHException;
import org.pvh.model.payload.request.LoginRequest;
import org.pvh.model.payload.request.SignupRequest;
import org.pvh.model.payload.response.JwtResponse;
import org.pvh.model.payload.response.MessageResponse;
import org.pvh.model.payload.response.UserResponse;
import org.pvh.repository.RoleRepository;
import org.pvh.repository.UserRepository;
import org.pvh.security.model.entity.Role;
import org.pvh.security.model.entity.User;
import org.pvh.security.model.enums.ERole;
import org.pvh.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwtEncoder;
    private final long jwtExpirationMs;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, RoleRepository roleRepository,
                          PasswordEncoder encoder, JwtEncoder jwtEncoder, @Value("${pvh.app.jwtExpirationMs}") long jwtExpirationMs) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtEncoder = jwtEncoder;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    @PostMapping("/signin")
    public JwtResponse authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication;
        try {
            authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.username(), loginRequest.password()));
        } catch (BadCredentialsException e) {
            throw new PVHException("Invalid username or password.", HttpStatus.UNAUTHORIZED);
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .subject(userDetails.getUsername())
            .issuedAt(now)
            .expiresAt(now.plusMillis(jwtExpirationMs))
            .build();
        String jwt = jwtEncoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS512).build(), claims))
            .getTokenValue();
        List<String> roles = userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();

        return new JwtResponse(jwt, "Bearer", userDetails.getId(), userDetails.getUsername(), roles);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping(value = "/user", produces = "application/json")
    public UserResponse getCurrentUserInfo(Principal userPrincipal) {
        return userRepository.findByUsername(userPrincipal.getName()).map(UserResponse::from)
            .orElseThrow(() -> new PVHException("User was not found.", HttpStatus.NOT_FOUND));
    }

    @PostMapping("/signup")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public MessageResponse registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.username())) {
            throw new PVHException("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        Set<ERole> roleNames = signUpRequest.roles() == null || signUpRequest.roles().isEmpty()
            ? Set.of(ERole.ROLE_USER)
            : signUpRequest.roles().stream().map(SignupRequest.RoleName::name).collect(Collectors.toSet());
        Set<Role> roles = roleNames.stream()
            .map(name -> roleRepository.findByName(name).orElseThrow(() -> new IllegalStateException("Role " + name + " is missing")))
            .collect(Collectors.toSet());

        User user = new User(signUpRequest.username(), encoder.encode(signUpRequest.password()));
        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable("id") long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new PVHException("User was not found.", HttpStatus.NOT_FOUND));
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

}
