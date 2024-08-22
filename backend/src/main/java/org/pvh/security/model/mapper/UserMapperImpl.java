package org.pvh.security.model.mapper;

import org.pvh.security.model.dto.UserDTO;
import org.pvh.security.model.dto.UserDTO.RoleDTO;
import org.pvh.security.model.entity.Role;
import org.pvh.security.model.entity.User;
import org.pvh.security.model.enums.ERole;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;


@Component
public class UserMapperImpl implements UserMapper {

    private static UserMapperImpl mapper;

    private UserMapperImpl() {
    }

    public static UserMapperImpl getInstance() {
        if (mapper == null) {
            mapper = new UserMapperImpl();
        }

        return mapper;
    }


    @Override
    public User userDTOToUser(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }

        User user = new User();

        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setRoles(roleDTOSetToRoleSet(userDTO.getRoles()));

        return user;
    }

    @Override
    public UserDTO userToUserDTO(User user) {
        if (user == null) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setUsername(user.getUsername());
        userDTO.setPassword(user.getPassword());
        userDTO.setRoles(roleSetToRoleDTOSet(user.getRoles()));

        return userDTO;
    }

    @Override
    public User updateUserFromUserDTO(UserDTO userDTO, User user) {
        if (userDTO == null) {
            return null;
        }

        if (userDTO.getUsername() != null) {
            user.setUsername(userDTO.getUsername());
        }
        if (userDTO.getPassword() != null) {
            user.setPassword(userDTO.getPassword());
        }
        if (user.getRoles() != null) {
            Set<Role> set = roleDTOSetToRoleSet(userDTO.getRoles());
            if (set != null) {
                user.getRoles().clear();
                user.getRoles().addAll(set);
            }
        } else {
            Set<Role> set = roleDTOSetToRoleSet(userDTO.getRoles());
            if (set != null) {
                user.setRoles(set);
            }
        }

        return user;
    }

    protected Role roleDTOToRole(RoleDTO roleDTO) {
        if (roleDTO == null) {
            return null;
        }

        Role role = new Role();

        if (roleDTO.getName() != null) {
            role.setName(Enum.valueOf(ERole.class, roleDTO.getName()));
        }

        return role;
    }

    protected Set<Role> roleDTOSetToRoleSet(Set<RoleDTO> set) {
        if (set == null) {
            return Collections.emptySet();
        }

        Set<Role> set1 = new HashSet<>();
        for (RoleDTO roleDTO : set) {
            set1.add(roleDTOToRole(roleDTO));
        }

        return set1;
    }

    protected RoleDTO roleToRoleDTO(Role role) {
        if (role == null) {
            return null;
        }

        RoleDTO roleDTO = new RoleDTO();

        if (role.getName() != null) {
            roleDTO.setName(role.getName().name());
        }

        return roleDTO;
    }

    protected Set<RoleDTO> roleSetToRoleDTOSet(Set<Role> set) {
        if (set == null) {
            return Collections.emptySet();
        }

        Set<RoleDTO> set1 = new HashSet<>();
        for (Role role : set) {
            set1.add(roleToRoleDTO(role));
        }

        return set1;
    }
}
