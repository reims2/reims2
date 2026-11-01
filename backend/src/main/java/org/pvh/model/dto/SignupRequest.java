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
    // UserService also checks the byte length for non-ASCII passwords
    @NotBlank @Size(max = SignupRequest.MAX_PASSWORD_BYTES) String password,
    Set<@Valid RoleName> roles) {

    // BCrypt ignores everything after 72 bytes, Spring Security rejects longer passwords
    public static final int MAX_PASSWORD_BYTES = 72;

    public Set<RoleEnum> roleNames() {
        return roles == null ? Set.of() : roles.stream().map(RoleName::name).collect(Collectors.toSet());
    }

    public record RoleName(@NotNull RoleEnum name) {
    }
}
