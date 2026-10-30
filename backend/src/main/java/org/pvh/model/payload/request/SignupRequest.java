package org.pvh.model.payload.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.pvh.security.model.enums.ERole;

import java.util.Set;

public record SignupRequest(
    @NotBlank @Size(max = 20) String username,
    @NotBlank @Size(max = 120) String password,
    Set<@Valid RoleName> roles) {

    public record RoleName(@NotNull ERole name) {
    }
}
