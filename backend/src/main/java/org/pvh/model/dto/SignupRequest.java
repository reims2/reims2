package org.pvh.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.pvh.model.enums.RoleEnum;

import java.util.Set;
import java.util.stream.Collectors;

public record SignupRequest(
    @NotBlank @Size(max = 20) String username,
    // UserService checks the length, BCrypt's limit is in bytes
    @NotBlank String password,
    Set<@Valid RoleName> roles) {

    public Set<RoleEnum> roleNames() {
        return roles == null ? Set.of() : roles.stream().map(RoleName::name).collect(Collectors.toSet());
    }

    public record RoleName(@NotNull RoleEnum name) {
    }
}
