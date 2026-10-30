package org.pvh.model.payload.response;

import org.pvh.security.model.entity.Role;
import org.pvh.security.model.entity.User;
import org.pvh.security.model.enums.ERole;

import java.util.List;

public record UserResponse(Long id, String username, List<RoleResponse> roles) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getRoles().stream().map(RoleResponse::from).toList());
    }

    public record RoleResponse(Long id, ERole name) {
        static RoleResponse from(Role role) {
            return new RoleResponse(role.getId(), role.getName());
        }
    }
}
