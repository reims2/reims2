package org.pvh.security.model.dto;

import org.pvh.security.model.entity.Role;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Objects;
import java.util.Set;

/**
 * A DTO for the {@link org.pvh.security.model.entity.User} entity
 */
public class UserDTO implements Serializable {
    @NotBlank
    @Size(max = 20)
    private String username;
    @NotBlank
    @Size(max = 120)
    private String password;
    private Set<RoleDTO> roles;

    public UserDTO() {
    }

    public UserDTO(String username, String password, Set<RoleDTO> roles) {
        this.username = username;
        this.password = password;
        this.roles = roles;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<RoleDTO> getRoles() {
        return roles;
    }

    public void setRoles(Set<RoleDTO> roles) {
        this.roles = roles;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDTO entity = (UserDTO) o;
        return Objects.equals(this.username, entity.username) &&
            Objects.equals(this.password, entity.password) &&
            Objects.equals(this.roles, entity.roles);
    }

    @Override
    public int hashCode() {
        return Objects.hash(username, password, roles);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" +
            "username = " + username + ", " +
            "password = " + password + ", " +
            "roles = " + roles + ")";
    }

    /**
     * A DTO for the {@link Role} entity
     */
    public static class RoleDTO implements Serializable {
        private String name;

        public RoleDTO() {
        }

        public RoleDTO(String name) {
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            RoleDTO entity = (RoleDTO) o;
            return Objects.equals(this.name, entity.name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(name);
        }

        @Override
        public String toString() {
            return getClass().getSimpleName() + "(" +
                "name = " + name + ")";
        }
    }
}
