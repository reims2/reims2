package org.pvh.model.dto;

import java.util.List;

public record LoginResponse(Long id, String username, List<String> roles) {
}
