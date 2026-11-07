package org.pvh.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClientErrorDTO(
    @NotBlank @Size(max = 2000) String message,
    @Size(max = 64) String version) {
}
