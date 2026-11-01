package org.pvh.service;

import org.pvh.error.BadRequestException;
import org.pvh.error.NotFoundException;
import org.pvh.model.dto.SignupRequest;
import org.pvh.model.entity.Role;
import org.pvh.model.entity.User;
import org.pvh.model.enums.RoleEnum;
import org.pvh.repository.RoleRepository;
import org.pvh.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public User register(String username, String password, Set<RoleEnum> roleNames) {
        if (userRepository.existsByUsername(username))
            throw new BadRequestException("Username is already taken!");
        if (password.getBytes(StandardCharsets.UTF_8).length > SignupRequest.MAX_PASSWORD_BYTES)
            throw new BadRequestException("password must be at most " + SignupRequest.MAX_PASSWORD_BYTES + " bytes");

        Set<Role> roles = (roleNames.isEmpty() ? Set.of(RoleEnum.ROLE_USER) : roleNames).stream()
            .map(name -> roleRepository.findByName(name).orElseThrow(() -> new IllegalStateException("Role " + name + " is missing")))
            .collect(Collectors.toSet());
        User user = new User(username, passwordEncoder.encode(password));
        user.setRoles(roles);
        return userRepository.save(user);
    }

    @Transactional
    public void delete(long id) {
        userRepository.delete(userRepository.findById(id).orElseThrow(() -> new NotFoundException("User was not found.")));
    }
}
