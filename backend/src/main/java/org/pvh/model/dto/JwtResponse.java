package org.pvh.model.dto;

import java.util.List;

public record JwtResponse(String accessToken, String tokenType, Long id, String username, List<String> roles) {
}
