package org.pvh.model.dto;

import org.pvh.model.entity.Role;
import org.pvh.model.entity.User;
import org.pvh.model.enums.RoleEnum;

import java.util.List;

public record UserResponse(Long id, String username, List<RoleResponse> roles) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getRoles().stream().map(RoleResponse::from).toList());
    }

    public record RoleResponse(Long id, RoleEnum name) {
        static RoleResponse from(Role role) {
            return new RoleResponse(role.getId(), role.getName());
        }
    }
}
